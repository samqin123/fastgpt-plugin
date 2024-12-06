import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import MedicalReportPlugin from './index.js';
import { MedicalReport, ReportItem } from './types.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

describe('MedicalReportPlugin Database Tests', () => {
  let plugin: MedicalReportPlugin;
  
  before(async () => {
    plugin = new MedicalReportPlugin();
    await plugin.connectMongo(process.env.MONGODB_URI);
  });
  
  after(async () => {
    if (plugin.mongoClient) {
      await plugin.mongoClient.close();
    }
  });
  
  it('should connect to MongoDB', () => {
    expect(plugin.mongoClient).to.not.be.null;
  });
  
  it('should save and retrieve a patient', async () => {
    const patientInfo = {
      patientId: 'TEST001',
      name: '测试患者',
      phone: '13800138000'
    };
    
    // 保存患者信息
    const savedPatient = await plugin.upsertPatient(patientInfo);
    expect(savedPatient).to.not.be.null;
    expect(savedPatient.patientId).to.equal(patientInfo.patientId);
    
    // 查找患者
    const foundPatient = await plugin.findPatient({ patientId: patientInfo.patientId });
    expect(foundPatient).to.not.be.null;
    expect(foundPatient?.name).to.equal(patientInfo.name);
  });
  
  it('should save and retrieve medical reports', async () => {
    const wbcItem: ReportItem = {
      value: 5.5,
      originalValue: '5.5',
      unit: '10^9/L',
      status: 'normal',
      referenceRange: {
        min: 4.0,
        max: 10.0
      }
    };

    const report: MedicalReport = {
      reportId: 'RPT001',
      patientId: 'TEST001',
      date: new Date(),
      parsedReport: {
        'WBC': wbcItem
      },
      abnormalConditions: [],
      confidence: 0.95,
      createdAt: new Date()
    };
    
    // 保存报告
    const result = await plugin.processReport(
      'base64_encoded_image_data',
      {
        patientId: report.patientId,
        name: '测试患者',
        phone: '13800138000'
      }
    );
    
    expect(result.success).to.be.true;
    expect(result.report).to.not.be.undefined;
    expect(result.reportId).to.not.be.undefined;
    
    // 获取患者报告
    const reports = await plugin.getPatientReports(report.patientId);
    expect(reports).to.be.an('array').that.is.not.empty;
    if (reports.length > 0) {
      expect(reports[0].patientId).to.equal(report.patientId);
    }
  });
});