import NodeClamscan from 'clamscan';

let clamscanInstance: any;

/**
 * Initialize ClamAV scanner.
 * Connects to clamd daemon.
 */
export async function initializeClamAV(): Promise<any> {
  if (clamscanInstance) {
    return clamscanInstance;
  }

  const clamscan = await new NodeClamscan().init({
    clamdscan: {
      host: process.env.CLAM_HOST || 'clamd',
      port: Number(process.env.CLAM_PORT || 3310),
      timeout: 30000,
    },
  });

  clamscanInstance = clamscan;
  return clamscan;
}

/**
 * Scan file buffer for malware.
 * Returns { isInfected, threat, error }
 */
export async function scanFileBuffer(
  fileBuffer: Buffer,
  filename: string = 'file.bin'
): Promise<{
  isInfected: boolean;
  threat?: string;
  error?: string;
}> {
  try {
    const clamscan = await initializeClamAV();

    // Scan the buffer
    const { isInfected, viruses } = await clamscan.scanBuffer(fileBuffer);

    if (isInfected) {
      const threatName = viruses && viruses.length > 0 ? viruses[0] : 'Unknown';
      return {
        isInfected: true,
        threat: threatName,
      };
    }

    return {
      isInfected: false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[ClamAV] Scan error: ${errorMessage}`);

    // In development, allow the upload if ClamAV is unavailable
    // In production, this should fail safe (mark as infected)
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment && errorMessage.includes('ECONNREFUSED')) {
      console.warn(`[ClamAV] Service unavailable - allowing upload in development mode`);
      return {
        isInfected: false,
      };
    }

    // On error in production, fail safe: mark as potentially infected
    // Better to block than accidentally allow malware
    return {
      isInfected: true,
      error: `Scan failed: ${errorMessage}`,
    };
  }
}

/**
 * Test ClamAV connectivity.
 * Useful for health checks.
 */
export async function testClamAVConnection(): Promise<boolean> {
  try {
    const clamscan = await initializeClamAV();
    const isRunning = await clamscan.isRunning();
    return isRunning;
  } catch {
    return false;
  }
}

/**
 * Close ClamAV connection.
 */
export async function closeClamAV(): Promise<void> {
  if (clamscanInstance) {
    // clamscan doesn't have a close method, just clear the reference
    clamscanInstance = undefined;
  }
}
