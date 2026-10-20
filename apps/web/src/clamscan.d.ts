declare module 'clamscan' {
  interface ScanResult {
    isInfected: boolean;
    viruses?: string[];
  }

  interface ClamscanConfig {
    clamdscan?: {
      host?: string;
      port?: number;
      timeout?: number;
    };
    host?: string;
    port?: number;
    timeout?: number;
  }

  class NodeClam {
    init(options: ClamscanConfig): Promise<NodeClam>;
    scanBuffer(buffer: Buffer, filename?: string): Promise<ScanResult>;
    isRunning(): Promise<boolean>;
  }

  export = NodeClam;
}
