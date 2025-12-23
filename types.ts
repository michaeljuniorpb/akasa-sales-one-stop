
export enum CalcMethod {
  FLAT = 'flat',
  ANNUITY = 'annuity'
}

export interface AmortizationRow {
  month: number;
  interest: number;
  principal: number;
  installment: number;
  remainingBalance: number;
}

export interface SavedSimulation {
  id: string;
  clientName: string;
  timestamp: string;
  data: SimulationResult;
}

export interface SimulationResult {
  hargaPL?: number;
  otr?: number;
  diskonPersen?: number;
  diskonNominal?: number;
  hargaNett?: number;
  dpNominal: number;
  dpPercent?: number;
  utj?: number;
  sisaDP?: number;
  bungaBank?: number;
  plafond?: number;
  principal?: number;
  totalFees?: number;
  totalFinancing?: number;
  tenorTahun?: number;
  tenorBulan?: number;
  monthlyInstallment: number;
  totalPayment: number;
  amortization?: AmortizationRow[];
}

export type FileType = 'pdf' | 'image' | 'link';

export interface SalesFile {
  id: string;
  title: string;
  type: FileType;
  url: string;
  tags: string[];
  updatedAt: string;
  storagePath?: string; // Optional, for Firebase files
  isCustom?: boolean; // For local/manual links
}

export enum AppTab {
  CALCULATOR = 'calculator',
  HISTORY = 'history',
  FILE_VIEWER = 'files'
}
