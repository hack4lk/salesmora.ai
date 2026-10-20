import { randomUUID } from 'crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase, createStorageAdapter, createFileStore, encryptFile, serializeFileCiphertext } from '@salesmora/data';
import { processFileForStorage, sweepOrphanedFiles } from './file-processing.js';

async function main() {
  // Load environment
  const env = fileURLToPath(new URL('../../../.env.local', import.meta.url));
  if (existsSync(env)) process.loadEnvFile(env);

  console.log('[S2 Worker Test] Starting file processing worker test...');

  const db = createDatabase(process.env.DATABASE_URL || 'postgres://postgres:password@127.0.0.1:55432/salesmora_test');
  const storage = createStorageAdapter();

  try {
    // Verify database connection
    await db.raw('SELECT 1');
    console.log('[S2 Worker Test] ✓ Database connected');

    // Create a test file in storage and database
    const workspaceId = randomUUID();
    const testUserId = randomUUID();
    const uploadedByUserId = testUserId;
    const fileId = randomUUID();
    const entityId = randomUUID();
    const now = new Date();
    const uniqueEmail = `test-${testUserId}@worker.local`;

    // Create user, workspace, and membership
    await db.transaction(async (trx) => {
      await trx('users').insert({
        id: testUserId,
        name: 'File Processing Test User',
        email: uniqueEmail,
        createdAt: now,
        updatedAt: now,
        termsVersion: 'rehearsal',
        termsAcceptedAt: now,
      });

      await trx('workspaces').insert({
        id: workspaceId,
        ownerId: testUserId,
        businessName: 'File Processing Test Workspace',
        businessType: 'general',
        postalCode: '',
        serviceRange: '',
        timezone: 'America/New_York',
      });
    });
    console.log('[S2 Worker Test] ✓ Created test user and workspace');

    // Create test image data (minimal valid JPEG)
    const minimalJpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
      0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
      0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
      0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
      0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
      0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
      0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d,
      0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
      0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
      0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
      0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
      0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
      0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
      0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
      0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
      0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
      0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
      0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
      0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
      0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
      0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01,
      0x00, 0x00, 0x3f, 0x00, 0xfb, 0xd0, 0xff, 0xd9
    ]);

    console.log('[S2 Worker Test] ✓ Created minimal JPEG test data');

    // Encrypt and upload test file
    const envelope = encryptFile(minimalJpeg);
    const serialized = serializeFileCiphertext(envelope);
    const storageKey = `test-file-${fileId}`;
    await storage.put(storageKey, { data: serialized });
    console.log('[S2 Worker Test] ✓ Uploaded encrypted test file to storage');

    // Create database record
    await db('files').insert({
      id: fileId,
      workspaceId,
      entityType: 'work-order',
      entityId,
      uploadedByUserId,
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: BigInt(minimalJpeg.length),
      status: 'uploading',
      storageKey,
      encryptedDekB64: Buffer.concat([envelope.dekIv, envelope.dekAuthTag, envelope.encryptedDek]).toString('base64'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('[S2 Worker Test] ✓ Created file record in database');

    // Test 1: Process file (thumbnail + HEIC check)
    console.log('\n[S2 Worker Test] Test 1: Processing file for thumbnails and HEIC conversion...');
    const result = await processFileForStorage(db, storage, fileId);
    console.log('[S2 Worker Test] Processing result:', result);
    
    if (result.success) {
      console.log('[S2 Worker Test] ✓ File processing succeeded');
      if (result.thumbnailCreated) {
        console.log('[S2 Worker Test] ✓ Thumbnail created');
      } else {
        console.log('[S2 Worker Test] ✗ Thumbnail not created (might not be an image)');
      }
    } else {
      console.log('[S2 Worker Test] ✗ File processing failed:', result.error);
    }

    // Verify file status changed to ready
    const updatedFile = await db('files').where({ id: fileId }).first();
    if (updatedFile.status === 'ready') {
      console.log('[S2 Worker Test] ✓ File marked as ready');
    } else {
      console.log('[S2 Worker Test] ✗ File status not updated to ready:', updatedFile.status);
    }

    // Test 2: Orphan sweeper (should not find any orphans yet)
    console.log('\n[S2 Worker Test] Test 2: Running orphan sweeper...');
    const sweepResult = await sweepOrphanedFiles(db, storage);
    console.log('[S2 Worker Test] Sweep result:', sweepResult);
    console.log('[S2 Worker Test] ✓ Orphan sweeper completed');

    // Test 3: Create orphaned files and verify cleanup
    console.log('\n[S2 Worker Test] Test 3: Testing orphan cleanup...');
    const orphanFileId = randomUUID();
    const orphanFileId2 = randomUUID();
    
    // Create files stuck in uploading state for >24 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    await db('files').insert([
      {
        id: orphanFileId,
        workspaceId,
        entityType: 'work-order',
        entityId,
        uploadedByUserId,
        name: 'orphan-uploading.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: BigInt(100),
        status: 'uploading',
        storageKey: `orphan-${orphanFileId}`,
        encryptedDekB64: Buffer.alloc(64).toString('base64'),
        createdAt: twoDaysAgo,
        updatedAt: twoDaysAgo,
      },
      {
        id: orphanFileId2,
        workspaceId,
        entityType: 'work-order',
        entityId,
        uploadedByUserId,
        name: 'orphan-scanning.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: BigInt(100),
        status: 'scanning',
        storageKey: `orphan-${orphanFileId2}`,
        encryptedDekB64: Buffer.alloc(64).toString('base64'),
        createdAt: twoHoursAgo,
        updatedAt: twoHoursAgo,
      }
    ]);
    console.log('[S2 Worker Test] ✓ Created orphaned file records');

    const sweepResult2 = await sweepOrphanedFiles(db, storage);
    console.log('[S2 Worker Test] Sweep result for orphans:', sweepResult2);
    
    if (sweepResult2.cleaned === 2) {
      console.log('[S2 Worker Test] ✓ Successfully cleaned 2 orphaned files');
    } else {
      console.log('[S2 Worker Test] ✗ Expected 2 orphans cleaned, got:', sweepResult2.cleaned);
    }

    // Verify orphans are marked as deleted
    const deletedOrphans = await db('files').where({ id: orphanFileId }).orWhere({ id: orphanFileId2 });
    const allDeleted = deletedOrphans.every((f: any) => f.deletedAt !== null);
    if (allDeleted) {
      console.log('[S2 Worker Test] ✓ Orphaned files marked as deleted');
    } else {
      console.log('[S2 Worker Test] ✗ Some orphaned files not marked as deleted');
    }

    console.log('\n[S2 Worker Test] All tests completed! ✓');
  } catch (error) {
    console.error('[S2 Worker Test] Error:', error);
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
}

main();
