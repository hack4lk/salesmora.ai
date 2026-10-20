import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface StorageObject {
  data: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface StorageObjectMetadata {
  size: number;
  contentType?: string;
  lastModified?: Date;
}

export class StorageAdapter {
  private client: S3Client;
  private bucket: string;

  constructor(config: {
    endpoint: string;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    forcePathStyle?: boolean;
  }) {
    this.bucket = config.bucket;
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.forcePathStyle ?? true,
    });
  }

  async put(key: string, object: StorageObject): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: object.data,
      ContentType: object.contentType,
      Metadata: object.metadata,
    });

    await this.client.send(command);
  }

  async get(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);
    const chunks: Uint8Array[] = [];

    if (!response.Body) {
      throw new Error(`No body in response for key ${key}`);
    }

    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  async head(key: string): Promise<StorageObjectMetadata> {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);
    return {
      size: response.ContentLength ?? 0,
      contentType: response.ContentType,
      lastModified: response.LastModified,
    };
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  close(): void {
    this.client.destroy();
  }
}

export function createStorageAdapter(config?: {
  endpoint?: string;
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  forcePathStyle?: boolean;
}): StorageAdapter {
  const endpoint = config?.endpoint ?? process.env.OBJECT_STORAGE_ENDPOINT;
  const bucket = config?.bucket ?? process.env.OBJECT_STORAGE_BUCKET;
  const region = config?.region ?? process.env.OBJECT_STORAGE_REGION ?? 'us-east-1';
  const accessKeyId = config?.accessKeyId ?? process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = config?.secretAccessKey ?? process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;
  const forcePathStyle = config?.forcePathStyle ?? (process.env.OBJECT_STORAGE_URL_STYLE === 'path');

  if (!endpoint) throw new Error('OBJECT_STORAGE_ENDPOINT is required');
  if (!bucket) throw new Error('OBJECT_STORAGE_BUCKET is required');
  if (!accessKeyId) throw new Error('OBJECT_STORAGE_ACCESS_KEY_ID is required');
  if (!secretAccessKey) throw new Error('OBJECT_STORAGE_SECRET_ACCESS_KEY is required');

  return new StorageAdapter({
    endpoint,
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    forcePathStyle,
  });
}
