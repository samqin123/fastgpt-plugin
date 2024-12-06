import MedicalReportPlugin from '../index';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testImageProcessing() {
  const plugin = new MedicalReportPlugin();
  
  try {
    // 读取测试图片
    const imagePath = join(__dirname, '..', 'test-data', 'sample-report.jpg');
    if (!fs.existsSync(imagePath)) {
      console.error('测试图片不存在:', imagePath);
      return;
    }
    
    const imageBase64 = fs.readFileSync(imagePath, 'base64');
    
    // 处理报告
    const result = await plugin.processReport(
      imageBase64,
      {
        patientId: 'TEST001',
        name: '测试患者',
        phone: '13800138000'
      }
    );
    
    if (result.success && result.report) {
      console.log('报告处理成功');
      console.log('报告ID:', result.reportId);
      console.log('患者ID:', result.report.patientId);
      console.log('报告日期:', result.report.date);
      
      if (result.report.abnormalConditions?.length) {
        console.log('\n异常指标:');
        for (const condition of result.report.abnormalConditions) {
          console.log('-', condition);
        }
      }
      
      console.log('\n报告详情:');
      for (const [name, item] of Object.entries(result.report.parsedReport)) {
        console.log(`\n${name}:`);
        console.log(`数值: ${item.originalValue}`);
        console.log(`状态: ${item.status}`);
        
        if (item.alerts?.length) {
          console.log('警报:');
          for (const alert of item.alerts) {
            console.log(`- ${alert.severity}: ${alert.message}`);
          }
        }
      }
    } else {
      console.error('报告处理失败:', result.error);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testImageProcessing();
