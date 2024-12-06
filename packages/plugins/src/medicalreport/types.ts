import { ObjectId } from 'mongodb';

export interface ProcessReportParams {
  report_image: string; // URL or base64 encoded image
  api_key: string;
  mongo_uri: string;
  require_confirmation?: boolean;
}

export interface ReferenceRange {
  min?: number;
  max?: number;
  special?: string;  // 添加特殊参考范围字段
}

export interface TrendAnalysis {
  slope: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  prediction?: number;
}

export interface AlertCondition {
  type: 'sudden_change' | 'trend' | 'threshold';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface ReportItem {
  value: number;
  originalValue: string;
  unit: string;
  referenceRange?: ReferenceRange;
  status: 'normal' | 'high' | 'low' | 'unknown';  // 添加 unknown 状态
  change?: {
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  trendAnalysis?: TrendAnalysis;
  alerts?: AlertCondition[];
  chartUrl?: string;
}

export interface Patient {
  _id?: ObjectId;
  patientId: string;
  name: string;
  phone: string;
  hash: string;
}

export interface MedicalReport {
  _id?: ObjectId;
  reportId: string;
  patientId: string;
  date: Date;
  parsedReport: Record<string, ReportItem>;
  abnormalConditions?: string[];
  confidence?: number;
  createdAt?: Date;
}

export interface ProcessResult {
  success: boolean;
  fullReport: string;
  parsedReport: Record<string, ReportItem>;
  abnormalConditions: Array<{
    name: string;
    value: number;
    status: string;
    referenceRange: string;
  }>;
}

export interface ProcessReportResult {
  success: boolean;
  reportId?: string;
  report?: MedicalReport;
  error?: string;
}
