import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function encodeBase32(bytes: Uint8Array) {
  let buffer = 0;
  let bitsInBuffer = 0;
  let output = '';
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitsInBuffer += 8;
    while (bitsInBuffer >= 5) {
      output += BASE32_ALPHABET[(buffer >>> (bitsInBuffer - 5)) & 31];
      bitsInBuffer -= 5;
    }
  }
  if (bitsInBuffer > 0) output += BASE32_ALPHABET[(buffer << (5 - bitsInBuffer)) & 31];
  return output;
}

export function staffTotpAuthenticatorSecret(secret: string) {
  return encodeBase32(Buffer.from(secret, 'utf8'));
}

export function generateStaffTotpSecret() {
  return encodeBase32(randomBytes(20));
}

function totpAt(secret: string, step: number) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac('sha1', Buffer.from(secret, 'utf8')).update(counter).digest();
  const offset = digest[digest.length - 1] & 15;
  const number = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return number.toString().padStart(6, '0');
}

export function staffTotpMatches(secret: string, code: string, now = Date.now()) {
  return staffTotpMatchingStep(secret, code, now) !== null;
}

export function staffTotpMatchingStep(secret: string, code: string, now = Date.now()) {
  if (!/^\d{6}$/.test(code)) return null;
  const expectedCode = Buffer.from(code);
  const currentStep = Math.floor(now / 30_000);
  for (const step of [currentStep - 1, currentStep, currentStep + 1]) {
    const candidate = Buffer.from(totpAt(secret, step));
    if (candidate.length === expectedCode.length && timingSafeEqual(candidate, expectedCode)) return step;
  }
  return null;
}
