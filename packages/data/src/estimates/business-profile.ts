import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type { Knex } from "knex";
import {
  estimateBusinessProfileSchema,
  estimateBusinessProfileRecordSchema,
  estimateIdSchema,
  saveEstimateBusinessProfileSchema,
  type AuthorizationContext,
  type PermissionId,
} from "@salesmora/contracts";
import {
  authorize,
  calculateEstimateTotals,
  resolveAuthorizedCollectionScope,
} from "@salesmora/domain";
import {
  AuthorizationAccessError,
  withWorkspaceAuthorization,
  type WorkspaceIdentity,
} from "../authorization/store";
import { createFileStore, type FileRecord } from "../files/store";
import type { StorageAdapter } from "../files/storage-adapter";

type EstimateBusinessProfile = typeof estimateBusinessProfileSchema._output;
type EstimateBusinessProfileRow = {
  workspaceId: string;
  version: number;
  numberPrefix: string;
  nextNumber: number;
  profile: EstimateBusinessProfile;
};
type SettingsRow = {
  version: number;
  businessName: string;
  address: string;
  phone: string;
  replyToEmail: string;
  logoFileId: string | null;
  licenseLine: string;
  requireServiceAddress: boolean;
  defaultTaxRateMilliPercent: number;
  validForDays: number;
  paymentTermPresets: EstimateBusinessProfile["paymentPresets"];
  defaultMessage: string;
  defaultTerms: string;
  defaultDepositType: "none" | "percent" | "amount";
  defaultDepositValue: string;
  numberPrefix: string;
};

export class EstimateBusinessProfileConflict extends Error {}
export class EstimateBusinessProfileInvalid extends Error {}
export class EstimateBusinessLogoUnavailable extends Error {}

const logoEntityType = "estimate-business-profile-logo";
const logoBytesLimit = 2 * 1024 * 1024;
const noAdjustment = { type: "none" as const };
const defaultProfile: EstimateBusinessProfile = {
  name: "",
  address: "",
  phone: "",
  email: "",
  licenseLine: "",
  logoPath: null,
  requireServiceAddress: true,
  validForDays: "30",
  taxRate: "0",
  deposit: noAdjustment,
  paymentPresets: [],
  message: "",
  termsNote: "",
};

function requireSettingsAccess(
  context: AuthorizationContext,
  write = false,
) {
  if (
    !authorize(context, { permission: "settings.business.read" }).allowed ||
    (write &&
      ((context.membership.role !== "owner" &&
        context.membership.role !== "admin") ||
        !authorize(context, { permission: "settings.business.update" }).allowed))
  ) {
    throw new AuthorizationAccessError();
  }
}

function logoPath(fileId: string) {
  return `/api/settings/estimates/logo/${encodeURIComponent(fileId)}`;
}

function logoIdFromPath(value: string | null) {
  if (!value) return null;
  const match = /^\/api\/settings\/estimates\/logo\/([0-9a-f-]{36})$/i.exec(value);
  return match && estimateIdSchema.safeParse(match[1]).success ? match[1] : null;
}

async function currentProfileRow(
  trx: Knex.Transaction,
  workspaceId: string,
): Promise<EstimateBusinessProfileRow> {
  const row = await trx("workspaceEstimateSettings")
    .where({ workspaceId })
    .first() as SettingsRow | undefined;
  const counter = await trx("workspaceEstimateCounters")
    .where({ workspaceId })
    .first("lastNumber");
  const profile = row
    ? {
        name: row.businessName,
        address: row.address,
        phone: row.phone,
        email: row.replyToEmail,
        licenseLine: row.licenseLine,
        logoPath: row.logoFileId ? logoPath(row.logoFileId) : null,
        requireServiceAddress: row.requireServiceAddress,
        validForDays: String(row.validForDays),
        taxRate: String(Number(row.defaultTaxRateMilliPercent) / 1000),
        deposit: row.defaultDepositType === "none"
          ? noAdjustment
          : {
              type: row.defaultDepositType,
              value: String(row.defaultDepositValue),
            },
        paymentPresets: row.paymentTermPresets ?? [],
        message: row.defaultMessage,
        termsNote: row.defaultTerms,
      }
    : defaultProfile;
  const parsedProfile = estimateBusinessProfileSchema.safeParse(profile);
  if (!parsedProfile.success) {
    throw new Error("Saved estimate business settings are invalid.");
  }
  if (row?.logoFileId) {
    const logo = await trx("files")
      .where({
        id: row.logoFileId,
        workspaceId,
        entityType: logoEntityType,
        entityId: workspaceId,
        categoryTag: "saved",
      })
      .whereNull("deletedAt")
      .first("status", "mimeType");
    if (!logo || logo.status !== "ready" || logo.mimeType !== "image/webp") {
      throw new EstimateBusinessLogoUnavailable();
    }
  }
  return estimateBusinessProfileRecordSchema.parse({
    workspaceId,
    version: Number(row?.version ?? 1),
    numberPrefix: row?.numberPrefix ?? "EST-",
    nextNumber: Number(counter?.lastNumber ?? 0) + 1,
    profile: parsedProfile.data,
  });
}

async function ensureSettingsRow(trx: Knex.Transaction, workspaceId: string) {
  await trx("workspaceEstimateSettings")
    .insert({ workspaceId })
    .onConflict("workspaceId")
    .ignore();
}

export async function readEstimateBusinessProfile(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    requireSettingsAccess(context);
    return {
      record: await currentProfileRow(trx, context.workspaceId),
      canManage:
        (context.membership.role === "owner" || context.membership.role === "admin") &&
        authorize(context, { permission: "settings.business.update" }).allowed,
      role: context.membership.role,
    };
  });
}

function validateProfileValues(profile: EstimateBusinessProfile) {
  const tax = calculateEstimateTotals({
    items: [],
    discount: noAdjustment,
    taxRate: profile.taxRate,
    deposit: noAdjustment,
  });
  const deposit = calculateEstimateTotals({
    items: [{
      description: "validation",
      quantity: "10",
      unitPrice: "1000000",
      taxable: true,
      included: false,
    }],
    discount: noAdjustment,
    taxRate: "100",
    deposit: profile.deposit,
  });
  if (tax.errors.taxRate || tax.taxRateMilliPercent === null || deposit.errors.deposit) {
    throw new EstimateBusinessProfileInvalid();
  }
  return tax.taxRateMilliPercent;
}

async function validateLogoReference(
  trx: Knex.Transaction,
  workspaceId: string,
  fileId: string | null,
) {
  if (!fileId) return;
  const file = await trx("files")
    .where({
      id: fileId,
      workspaceId,
      entityType: logoEntityType,
      entityId: workspaceId,
      mimeType: "image/webp",
    })
    .whereNull("deletedAt")
    .whereIn("categoryTag", ["staged", "saved"])
    .first("status", "categoryTag");
  if (!file || file.status !== "ready") {
    throw new EstimateBusinessProfileInvalid();
  }
}

export async function saveEstimateBusinessProfile(
  db: Knex,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  raw: unknown,
) {
  const parsed = saveEstimateBusinessProfileSchema.safeParse(raw);
  if (!parsed.success) throw new EstimateBusinessProfileInvalid();
  const input = parsed.data;
  if (input.workspaceId !== identity.workspaceId) {
    throw new AuthorizationAccessError();
  }
  const taxRateMilliPercent = validateProfileValues(input.profile);
  const fileId = logoIdFromPath(input.profile.logoPath);
  if (input.profile.logoPath && !fileId) {
    throw new EstimateBusinessProfileInvalid();
  }

  return withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    requireSettingsAccess(context, true);
    await ensureSettingsRow(trx, context.workspaceId);
    const existing = await trx("workspaceEstimateSettings")
      .where({ workspaceId: context.workspaceId })
      .forUpdate()
      .first("version");
    if (Number(existing?.version ?? 1) !== input.expectedVersion) {
      throw new EstimateBusinessProfileConflict();
    }
    await validateLogoReference(trx, context.workspaceId, fileId);
    const profile = input.profile;
    const depositValue = profile.deposit.type === "none"
      ? "0"
      : profile.deposit.value;
    const nextVersion = input.expectedVersion + 1;
    await trx("workspaceEstimateSettings")
      .where({ workspaceId: context.workspaceId, version: input.expectedVersion })
      .update({
        businessName: profile.name,
        address: profile.address,
        phone: profile.phone,
        replyToEmail: profile.email,
        logoFileId: fileId,
        licenseLine: profile.licenseLine,
        requireServiceAddress: profile.requireServiceAddress,
        defaultTaxRateMilliPercent: taxRateMilliPercent,
        validForDays: Number(profile.validForDays),
        paymentTermPresets: JSON.stringify(profile.paymentPresets),
        defaultMessage: profile.message,
        defaultTerms: profile.termsNote,
        defaultDepositType: profile.deposit.type,
        defaultDepositValue: depositValue,
        version: nextVersion,
        updatedBy: context.userId,
        updatedAt: trx.fn.now(),
      });
    if (fileId) {
      await trx("files")
        .where({
          id: fileId,
          workspaceId: context.workspaceId,
          entityType: logoEntityType,
          entityId: context.workspaceId,
          categoryTag: "staged",
        })
        .update({ categoryTag: "saved", updatedAt: trx.fn.now() });
    }
    return currentProfileRow(trx, context.workspaceId);
  });
}

export async function prepareEstimateBusinessLogo(file: {
  type: string;
  data: Buffer;
}) {
  if (
    file.data.length === 0 ||
    file.data.length > logoBytesLimit ||
    !["image/png", "image/jpeg", "image/webp"].includes(file.type)
  ) {
    throw new EstimateBusinessProfileInvalid();
  }
  try {
    const image = sharp(file.data, {
      failOn: "error",
      limitInputPixels: 20_000_000,
    });
    const metadata = await image.metadata();
    const acceptedFormats: Record<string, string> = {
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };
    if (
      !metadata.width ||
      !metadata.height ||
      acceptedFormats[metadata.format ?? ""] !== file.type
    ) {
      throw new EstimateBusinessProfileInvalid();
    }
    const data = await sharp(file.data, {
      failOn: "error",
      limitInputPixels: 20_000_000,
    })
      .rotate()
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    if (data.length === 0 || data.length > logoBytesLimit) {
      throw new EstimateBusinessProfileInvalid();
    }
    return data;
  } catch (error) {
    if (error instanceof EstimateBusinessProfileInvalid) throw error;
    throw new EstimateBusinessProfileInvalid();
  }
}

export async function uploadEstimateBusinessLogo(
  db: Knex,
  storage: StorageAdapter,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  expectedVersion: number,
  file: { type: string; data: Buffer },
) {
  await withWorkspaceAuthorization(db, identity, enabled, true, async (trx, context) => {
    requireSettingsAccess(context, true);
    const current = await currentProfileRow(trx, context.workspaceId);
    if (current.version !== expectedVersion) {
      throw new EstimateBusinessProfileConflict();
    }
  });
  const data = await prepareEstimateBusinessLogo(file);
  const store = await createFileStore(db, storage);
  const uploaded = await store.uploadFile(
    { userId: identity.userId, workspaceId: identity.workspaceId, permissions: {} },
    {
      entityType: logoEntityType,
      entityId: identity.workspaceId,
      name: "estimate-business-logo.webp",
      mimeType: "image/webp",
      data,
      categoryTag: "staged",
    },
  );
  await db.transaction(async (trx) => {
    const updated = await trx("files")
      .where({
        id: uploaded.id,
        workspaceId: identity.workspaceId,
        entityType: logoEntityType,
        entityId: identity.workspaceId,
      })
      .whereIn("status", ["uploading", "ready"])
      .update({ status: "ready", categoryTag: "staged", updatedAt: trx.fn.now() });
    if (updated !== 1) throw new EstimateBusinessProfileInvalid();
  });
  return { logoPath: logoPath(uploaded.id) };
}

export async function readEstimateBusinessLogo(
  db: Knex,
  storage: StorageAdapter,
  identity: WorkspaceIdentity,
  enabled: readonly PermissionId[],
  fileId: string,
) {
  return withWorkspaceAuthorization(db, identity, enabled, false, async (trx, context) => {
    const file = await trx("files")
      .where({
        id: fileId,
        workspaceId: context.workspaceId,
        entityType: logoEntityType,
        entityId: context.workspaceId,
        mimeType: "image/webp",
        status: "ready",
      })
      .whereNull("deletedAt")
      .first("categoryTag");
    if (!file) throw new AuthorizationAccessError();

    const current = file.categoryTag === "saved" && await trx("workspaceEstimateSettings")
      .where({ workspaceId: context.workspaceId, logoFileId: fileId })
      .first("workspaceId");
    if (current) {
      if (
        !resolveAuthorizedCollectionScope(context, "estimates.read").allowed &&
        !authorize(context, { permission: "settings.business.read" }).allowed
      ) {
        throw new AuthorizationAccessError();
      }
    } else if (
      file.categoryTag !== "staged" ||
      !authorize(context, { permission: "settings.business.read" }).allowed
    ) {
      throw new AuthorizationAccessError();
    }
    const store = await createFileStore(db, storage);
    return store.downloadFile(
      {
        userId: context.userId,
        workspaceId: context.workspaceId,
        permissions: {},
      },
      fileId,
    );
  });
}

type LogoFileRow = Pick<FileRecord, "id" | "workspaceId" | "uploadedByUserId" | "name" | "sizeBytes"> & {
  storageKey: string;
  createdAt: Date;
};

export async function cleanupStagedEstimateBusinessLogos(
  db: Knex,
  storage: StorageAdapter,
  now = new Date(),
) {
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const candidates = await db("files as f")
    .leftJoin("workspaceEstimateSettings as s", function () {
      this.on("s.workspaceId", "=", "f.workspaceId")
        .andOn("s.logoFileId", "=", db.raw('"f"."id"::text'));
    })
    .where({
      "f.entityType": logoEntityType,
      "f.categoryTag": "staged",
    })
    .whereNull("f.deletedAt")
    .whereNull("s.logoFileId")
    .andWhere("f.createdAt", "<", cutoff)
    .select(
      "f.id",
      "f.workspaceId",
      "f.uploadedByUserId",
      "f.name",
      "f.sizeBytes",
      "f.storageKey",
      "f.createdAt",
    )
    .limit(100) as LogoFileRow[];
  let removed = 0;
  for (const candidate of candidates) {
    const storageKey = await db.transaction(async (trx) => {
      await trx("workspaces")
        .where({ id: candidate.workspaceId })
        .forUpdate()
        .first("id");
      const settings = await trx("workspaceEstimateSettings")
        .where({ workspaceId: candidate.workspaceId })
        .forUpdate()
        .first("logoFileId");
      const file = await trx("files")
        .where({
          id: candidate.id,
          workspaceId: candidate.workspaceId,
          entityType: logoEntityType,
          categoryTag: "staged",
        })
        .whereNull("deletedAt")
        .forUpdate()
        .first("storageKey", "sizeBytes", "uploadedByUserId", "name", "createdAt");
      if (
        !file ||
        settings?.logoFileId === candidate.id ||
        new Date(file.createdAt).getTime() >= cutoff.getTime()
      ) {
        return null;
      }
      await trx("files")
        .where({ id: candidate.id, workspaceId: candidate.workspaceId })
        .update({ deletedAt: now, updatedAt: now });
      await trx("fileEvents").insert({
        id: randomUUID(),
        fileId: candidate.id,
        workspaceId: candidate.workspaceId,
        actorId: file.uploadedByUserId,
        eventType: "removed",
        metadata: { name: file.name, reason: "staged-estimate-logo-expired" },
        createdAt: now,
      });
      const usage = await trx("workspaceStorageUsage")
        .where({ workspaceId: candidate.workspaceId })
        .first("usedBytes");
      if (usage) {
        await trx("workspaceStorageUsage")
          .where({ workspaceId: candidate.workspaceId })
          .update({
            usedBytes: Math.max(0, Number(usage.usedBytes) - Number(file.sizeBytes)),
          });
      }
      return file.storageKey as string;
    });
    if (storageKey) {
      await storage.delete(storageKey);
      removed++;
    }
  }
  return removed;
}
