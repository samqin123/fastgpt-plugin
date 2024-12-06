import { expect } from 'chai';
import MedicalReportPlugin from './index.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { MedicalReport, ReportItem } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
config();

// 设置测试环境
process.env.NODE_ENV = 'test';

describe('MedicalReportPlugin Core Functions', () => {
  let plugin: MedicalReportPlugin;

  beforeEach(async () => {
    plugin = new MedicalReportPlugin();
    await plugin.connectMongo(process.env.MONGODB_URI);
  });

  afterEach(async () => {
    if (plugin.mongoClient) {
      await plugin.mongoClient.close();
    }
  });

  describe('Report Processing', () => {
    it('should process a medical report', async () => {
      const result = await plugin.processReport(
        'base64_encoded_image_data',
        {
          patientId: 'TEST001',
          name: '测试患者',
          phone: '13800138000'
        }
      );

      expect(result.success).to.be.true;
      expect(result.reportId).to.be.a('string');
      expect(result.report).to.exist;

      if (result.report) {
        expect(result.report.patientId).to.equal('TEST001');
        expect(result.report.date).to.be.instanceOf(Date);
        expect(result.report.parsedReport).to.be.an('object');
        expect(result.report.abnormalConditions).to.be.an('array');
      }
    });

    it('should handle invalid image data', async () => {
      const result = await plugin.processReport(
        'invalid_base64_data',
        {
          patientId: 'TEST002',
          name: '测试患者2',
          phone: '13800138001'
        }
      );

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });
  });

  describe('Patient Management', () => {
    it('should create and find a patient', async () => {
      const patientInfo = {
        patientId: 'TEST003',
        name: '测试患者3',
        phone: '13800138002'
      };

      const patient = await plugin.upsertPatient(patientInfo);
      expect(patient).to.exist;
      expect(patient.hash).to.be.a('string');

      const foundPatient = await plugin.findPatient({ patientId: 'TEST003' });
      expect(foundPatient).to.exist;
      expect(foundPatient?.name).to.equal('测试患者3');
    });
  });

  describe('Report Retrieval', () => {
    it('should retrieve patient reports', async () => {
      // 首先创建一个测试报告
      const result = await plugin.processReport(
        'base64_encoded_image_data',
        {
          patientId: 'TEST001',
          name: '测试患者',
          phone: '13800138000'
        }
      );
      
      expect(result.success).to.be.true;
      
      const reports = await plugin.getPatientReports('TEST001');
      expect(reports).to.be.an('array');
      
      if (reports.length > 0) {
        const report = reports[0];
        expect(report.patientId).to.equal('TEST001');
        expect(report.date).to.be.instanceOf(Date);
        expect(report.parsedReport).to.be.an('object');
      }
    });
  });
});
