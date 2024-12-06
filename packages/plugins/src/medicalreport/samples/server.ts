import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import MedicalReportPlugin from '../index.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// 创建插件实例
const plugin = new MedicalReportPlugin();

// 初始化函数
async function initialize() {
  try {
    // 连接数据库
    await plugin.connectMongo(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    const port = process.env.PORT || 3330;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`Available endpoints:`);
      console.log(`  POST /process-sample - Process sample medical report`);
      console.log(`  GET /reports/:patientId - Get patient reports`);
      console.log(`  GET /patients - Find patient information`);
      console.log(`  GET /health - Health check`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

// 处理示例报告的路由
app.post('/process-sample', async (req, res) => {
  try {
    console.log('Processing sample report...');
    
    // 读取示例图片
    const imagePath = join(__dirname, '..', '..', 'samples', 'sample_report.jpg');
    console.log('Reading image from:', imagePath);
    
    if (!fs.existsSync(imagePath)) {
      console.error('Sample image not found:', imagePath);
      return res.status(404).json({
        success: false,
        error: 'Sample image not found'
      });
    }
    
    const imageBase64 = fs.readFileSync(imagePath, 'base64');
    console.log('Image loaded, size:', imageBase64.length, 'bytes');
    
    // 处理报告
    const result = await plugin.processReport(
      imageBase64,
      {
        patientId: 'SAMPLE001',
        name: '示例患者',
        phone: '13800138000'
      }
    );
    
    console.log('Report processed:', result.success ? 'success' : 'failed');
    res.json(result);
  } catch (error) {
    console.error('处理报告失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 获取患者报告列表
app.get('/reports/:patientId', async (req, res) => {
  try {
    console.log('Getting reports for patient:', req.params.patientId);
    const reports = await plugin.getPatientReports(req.params.patientId);
    console.log('Found', reports.length, 'reports');
    res.json(reports);
  } catch (error) {
    console.error('获取报告失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 查找患者
app.get('/patients', async (req, res) => {
  try {
    const { patientId, name, phone } = req.query;
    console.log('Finding patient:', { patientId, name, phone });
    
    const patient = await plugin.findPatient({
      patientId: patientId as string,
      name: name as string,
      phone: phone as string
    });
    
    console.log('Patient found:', patient ? 'yes' : 'no');
    res.json(patient);
  } catch (error) {
    console.error('查找患者失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 添加健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
initialize();
