export interface ProcessReportParams {
  report_image: string; // URL or base64 encoded image
  api_key: string;
  mongo_uri: string;
  require_confirmation?: boolean;
}

export interface ParsedReportItem {
  value: number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low';
  category: string;
  healthImplication: string;
}

export interface ProcessResult {
  success: boolean;
  fullReport: string;
  parsedReport: Record<string, ParsedReportItem>;
  abnormalConditions: Array<{
    name: string;
    value: number;
    status: string;
    referenceRange: string;
  }>;
}

export interface MedicalReport {
  id: string;
  reportDate: Date;
  indicators: Record<string, ParsedReportItem>;
  abnormalIndicators: string[];
  overallAssessment: string;
  recommendations: string[];
}
