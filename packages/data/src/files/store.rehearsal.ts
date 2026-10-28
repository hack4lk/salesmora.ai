import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../database';
import { initializeWorkspacePolicy } from '../authorization/store';
import { createStorageAdapter } from './storage-adapter';
import { createFileStore } from './store';

const env = fileURLToPath(new URL('../../../../.env.local', import.meta.url));
if (existsSync(env)) process.loadEnvFile(env);

const connection = process.env.TEST_DATABASE_URL ?? '';
if (
  !connection ||
  !new URL(connection).pathname.endsWith('_test') ||
  connection === process.env.DATABASE_URL ||
  !['localhost', '127.0.0.1'].includes(new URL(connection).hostname)
) {
  throw Error('Use the isolated local test database.');
}

async function rehearsal() {
  const db = createDatabase(connection);
  let storage: ReturnType<typeof createStorageAdapter> | undefined;

  try {
    // Create test workspace and user
    const testWorkspaceId = randomUUID();
    const testUserId = randomUUID();
    const now = new Date();
    const uniqueEmail = `test-${testUserId}@files.local`;

    await db.transaction(async (trx) => {
      await trx('users').insert({
        id: testUserId,
        name: 'File Storage Test User',
        email: uniqueEmail,
        createdAt: now,
        updatedAt: now,
        termsVersion: 'rehearsal',
        termsAcceptedAt: now,
      });

      await trx('workspaces').insert({
        id: testWorkspaceId,
        ownerId: testUserId,
        businessName: 'File Storage Test Workspace',
        businessType: 'general',
        postalCode: '',
        serviceRange: '',
        timezone: 'America/New_York',
      });

      await trx('workspaceMemberships').insert({
        workspaceId: testWorkspaceId,
        userId: testUserId,
        role: 'owner',
      });

      await initializeWorkspacePolicy(trx, {
        workspaceId: testWorkspaceId,
        userId: testUserId,
      });
    });

    storage = createStorageAdapter({
      endpoint: process.env.OBJECT_STORAGE_ENDPOINT || 'http://127.0.0.1:59000',
      bucket: process.env.OBJECT_STORAGE_BUCKET || 'salesmora-dev',
      region: process.env.OBJECT_STORAGE_REGION || 'us-east-1',
      accessKeyId: process.env.OBJECT_STORAGE_ACCESS_KEY_ID || 'local',
      secretAccessKey: process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY || 'local',
      forcePathStyle: true,
    });

    const fileStore = await createFileStore(db, storage);

    // Test 1: Upload a file
    console.log('Test 1: Uploading a file to RustFS...');
    const testEntityId = randomUUID();
    const testData = Buffer.from('Test file content for RustFS');
    const fileRecord = await fileStore.uploadFile(
      {
        userId: testUserId,
        workspaceId: testWorkspaceId,
        permissions: { 'files.upload': { allowed: true } },
      },
      {
        entityType: 'test',
        entityId: testEntityId,
        name: 'test-file.txt',
        mimeType: 'text/plain',
        data: testData,
        categoryTag: 'test',
        caption: 'Test caption',
      },
    );

    console.log(`✓ File uploaded: ${fileRecord.id}`);
    console.log(`  - Name: ${fileRecord.name}`);
    console.log(`  - Size: ${fileRecord.sizeBytes} bytes`);
    console.log(`  - Status: ${fileRecord.status}`);

    // Test 2: Mark file as ready (simulating worker scanning)
    console.log('\nTest 2: Marking file as ready...');
    await db.transaction(async (trx) => {
      await fileStore.markFileReady(trx, fileRecord.id);
    });
    console.log('✓ File marked as ready');

    // Test 3: Download the file
    console.log('\nTest 3: Downloading the file from RustFS...');
    const downloadedData = await fileStore.downloadFile(
      {
        userId: testUserId,
        workspaceId: testWorkspaceId,
        permissions: { 'files.download': { allowed: true } },
      },
      fileRecord.id,
    );

    if (downloadedData.toString() === testData.toString()) {
      console.log('✓ File downloaded and decrypted successfully');
      console.log(`  - Content matches original: ${downloadedData.equals(testData)}`);
    } else {
      throw new Error('Downloaded content does not match original');
    }

    // Test 4: List entity files
    console.log('\nTest 4: Listing entity files...');
    const files = await fileStore.listEntityFiles(
      {
        userId: testUserId,
        workspaceId: testWorkspaceId,
        permissions: { 'files.list': { allowed: true } },
      },
      'test',
      testEntityId,
    );

    console.log(`✓ Found ${files.length} file(s)`);
    files.forEach((f) => {
      console.log(`  - ${f.name} (${f.sizeBytes} bytes)`);
    });

    // Test 5: Get storage usage
    console.log('\nTest 5: Checking storage usage...');
    const usage = await fileStore.getStorageUsage(db, testWorkspaceId);
    console.log(`✓ Storage usage: ${usage.usedBytes} / ${usage.quotaBytes} bytes (${usage.percentUsed}%)`);

    // Test 6: Remove the file
    console.log('\nTest 6: Removing the file...');
    await fileStore.removeFile(
      {
        userId: testUserId,
        workspaceId: testWorkspaceId,
        permissions: { 'files.remove': { allowed: true } },
      },
      fileRecord.id,
    );
    console.log('✓ File removed');

    console.log('\n✅ All rehearsal tests passed!');
  } catch (error) {
    console.error('❌ Rehearsal failed:', error);
    process.exit(1);
  } finally {
    storage?.close();
    await db.destroy();
  }
}

rehearsal().catch(console.error);
