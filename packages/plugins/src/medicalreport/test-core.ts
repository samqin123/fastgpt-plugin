import MedicalReportPlugin from './index.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config();

async function testMedicalReportPlugin() {
  try {
    const plugin = new MedicalReportPlugin();
    
    // 测试图片路径
    const imagePath = path.join(__dirname, 'samples', 'sample_report.jpg');
    
    const result = await plugin.processReport({
      report_image: imagePath,
      api_key: process.env.STEPFUN_API_KEY || '',
      mongo_uri: process.env.MONGODB_URI || '',
      require_confirmation: true
    });

    console.log('Test completed successfully');
    console.log('Parsed Report:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMedicalReportPlugin();
