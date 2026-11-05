import { createCipheriv, createDecipheriv, randomBytes, randomUUID, type CipherGCM, type DecipherGCM } from 'node:crypto';

/**
 * File encryption uses AES-256-GCM envelope encryption.
 * Each file gets a unique data encryption key (DEK) that is encrypted
 * with the master key (KEK) stored in the environment.
 *
 * Stored format:
 * - Database: [dekIv (16)][dekAuthTag (16)][encryptedKey (32)]
 * - Object storage: [fileIv (16)][fileAuthTag (16)][ciphertext...]
 */

export interface EncryptedEnvelope {
  dekIv: Buffer;
  dekAuthTag: Buffer;
  encryptedDek: Buffer;
  fileIv: Buffer;
  fileAuthTag: Buffer;
  ciphertext: Buffer;
}

export interface DecryptionResult {
  plaintext: Buffer;
  dek: Buffer;
}

export interface StreamingFileEncryption {
  cipher: CipherGCM;
  dekEnvelope: Buffer;
  fileIv: Buffer;
}

export function createStreamingFileDecryption(
  masterKey: Buffer,
  dekEnvelope: Buffer,
  fileIv: Buffer,
  fileAuthTag: Buffer,
): DecipherGCM {
  if (masterKey.length !== 32) throw new Error('The file encryption master key must be 32 bytes.');
  if (dekEnvelope.length !== 64 || fileIv.length !== 16 || fileAuthTag.length !== 16) {
    throw new Error('The encrypted file envelope is invalid.');
  }
  const dekDecipher = createDecipheriv('aes-256-gcm', masterKey, dekEnvelope.subarray(0, 16));
  dekDecipher.setAuthTag(dekEnvelope.subarray(16, 32));
  const dek = Buffer.concat([
    dekDecipher.update(dekEnvelope.subarray(32)),
    dekDecipher.final(),
  ]);
  if (dek.length !== 32) {
    dek.fill(0);
    throw new Error('The encrypted file key is invalid.');
  }
  const decipher = createDecipheriv('aes-256-gcm', dek, fileIv);
  dek.fill(0);
  decipher.setAuthTag(fileAuthTag);
  return decipher;
}

function getMasterKey(): Buffer {
  const masterKeyB64 = process.env.FILE_MASTER_KEY;
  if (!masterKeyB64) {
    throw new Error('FILE_MASTER_KEY environment variable is required');
  }
  return Buffer.from(masterKeyB64, 'base64');
}

export function createStreamingFileEncryption(masterKey: Buffer): StreamingFileEncryption {
  if (masterKey.length !== 32) throw new Error('The file encryption master key must be 32 bytes.');
  const dek = generateDataEncryptionKey();
  const dekIv = randomBytes(16);
  const dekCipher = createCipheriv('aes-256-gcm', masterKey, dekIv);
  const encryptedDek = Buffer.concat([dekCipher.update(dek), dekCipher.final()]);
  const dekAuthTag = dekCipher.getAuthTag();
  const fileIv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', dek, fileIv);
  dek.fill(0);
  return {
    cipher,
    dekEnvelope: Buffer.concat([dekIv, dekAuthTag, encryptedDek]),
    fileIv,
  };
}

export function generateDataEncryptionKey(): Buffer {
  // AES-256 key
  return randomBytes(32);
}

export function encryptFile(plaintext: Buffer, dek?: Buffer): EncryptedEnvelope {
  const dataEncryptionKey = dek ?? generateDataEncryptionKey();
  const masterKey = getMasterKey();

  // Encrypt the DEK with the master key using AES-256-GCM
  const dekIv = randomBytes(16);
  const dekCipher = createCipheriv('aes-256-gcm', masterKey, dekIv);
  const encryptedDek = Buffer.concat([dekCipher.update(dataEncryptionKey), dekCipher.final()]);
  const dekAuthTag = dekCipher.getAuthTag();

  // Encrypt the file with the DEK using AES-256-GCM
  const fileIv = randomBytes(16);
  const fileCipher = createCipheriv('aes-256-gcm', dataEncryptionKey, fileIv);
  const ciphertext = Buffer.concat([fileCipher.update(plaintext), fileCipher.final()]);
  const fileAuthTag = fileCipher.getAuthTag();

  return {
    dekIv,
    dekAuthTag,
    encryptedDek,
    fileIv,
    fileAuthTag,
    ciphertext,
  };
}

export function decryptFile(envelope: EncryptedEnvelope, masterKey = getMasterKey()): DecryptionResult {
  if (masterKey.length !== 32) throw new Error('The file encryption master key must be 32 bytes.');

  // Decrypt the DEK
  const dekDecipher = createDecipheriv('aes-256-gcm', masterKey, envelope.dekIv);
  dekDecipher.setAuthTag(envelope.dekAuthTag);
  const dek = Buffer.concat([dekDecipher.update(envelope.encryptedDek), dekDecipher.final()]);

  // Decrypt the file
  const fileDecipher = createDecipheriv('aes-256-gcm', dek, envelope.fileIv);
  fileDecipher.setAuthTag(envelope.fileAuthTag);
  const plaintext = Buffer.concat([fileDecipher.update(envelope.ciphertext), fileDecipher.final()]);

  return { plaintext, dek };
}

/**
 * Serialize the encrypted DEK for database storage:  [dekIv (16)][dekAuthTag (16)][encryptedDek (32)]
 */
export function serializeDekEnvelope(envelope: EncryptedEnvelope): Buffer {
  return Buffer.concat([envelope.dekIv, envelope.dekAuthTag, envelope.encryptedDek]);
}

/**
 * Deserialize the DEK envelope from database
 */
export function deserializeDekEnvelope(data: Buffer): { dekIv: Buffer; dekAuthTag: Buffer; encryptedDek: Buffer } {
  if (data.length < 64) {
    throw new Error('Invalid DEK envelope format');
  }
  return {
    dekIv: data.subarray(0, 16),
    dekAuthTag: data.subarray(16, 32),
    encryptedDek: data.subarray(32),
  };
}

/**
 * Serialize the encrypted file content for storage: [fileIv (16)][fileAuthTag (16)][ciphertext...]
 */
export function serializeFileCiphertext(envelope: EncryptedEnvelope): Buffer {
  return Buffer.concat([envelope.fileIv, envelope.fileAuthTag, envelope.ciphertext]);
}

/**
 * Deserialize the file ciphertext from storage
 */
export function deserializeFileCiphertext(data: Buffer): { fileIv: Buffer; fileAuthTag: Buffer; ciphertext: Buffer } {
  if (data.length < 32) {
    throw new Error('Invalid file ciphertext format');
  }
  return {
    fileIv: data.subarray(0, 16),
    fileAuthTag: data.subarray(16, 32),
    ciphertext: data.subarray(32),
  };
}

/**
 * Generate an opaque file ID that doesn't reveal internal structure
 */
export function generateFileId(): string {
  return randomUUID();
}
