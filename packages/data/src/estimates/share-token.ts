import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { estimateShareTokenSchema } from "@salesmora/contracts";
import {
  decryptFile,
  deserializeDekEnvelope,
  deserializeFileCiphertext,
  encryptFile,
  serializeDekEnvelope,
  serializeFileCiphertext,
} from "../files/encryption";

export function estimateTokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newEstimateShareToken() {
  const token = randomBytes(32).toString("base64url");
  const envelope = encryptFile(Buffer.from(token, "utf8"));
  return {
    tokenHash: estimateTokenHash(token),
    encryptedToken: Buffer.concat([
      serializeDekEnvelope(envelope),
      serializeFileCiphertext(envelope),
    ]).toString("base64"),
  };
}

/** Plaintext is recovered only at authorized copy/delivery boundaries, never persisted or logged. */
export function recoverEstimateShareToken(encrypted: string, expectedHash: string) {
  const bytes = Buffer.from(encrypted, "base64");
  if (bytes.length < 96 || !/^[0-9a-f]{64}$/.test(expectedHash)) {
    throw new Error("The customer link cannot be recovered.");
  }
  const { plaintext } = decryptFile({
    ...deserializeDekEnvelope(bytes.subarray(0, 64)),
    ...deserializeFileCiphertext(bytes.subarray(64)),
  });
  const token = estimateShareTokenSchema.parse(plaintext.toString("utf8"));
  if (!timingSafeEqual(Buffer.from(estimateTokenHash(token), "hex"), Buffer.from(expectedHash, "hex"))) {
    throw new Error("The customer link cannot be verified.");
  }
  return token;
}
