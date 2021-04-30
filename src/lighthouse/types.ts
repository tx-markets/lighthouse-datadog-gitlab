export interface NetworkAsset {
  resourceType: string;
  transferSize: number;
}

export interface JSReport {
  categories: Record<string, unknown>;
  audits: Record<string, unknown>;
}
