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
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    let imageBase64;
    
    // 检查是否提供了图片路径
    if (req.body.image_url) {
      try {
        // 尝试作为本地文件路径处理
        const imagePath = req.body.image_url;
        console.log('Attempting to read image from:', imagePath);
        
        if (fs.existsSync(imagePath)) {
          console.log('File exists, reading content...');
          imageBase64 = fs.readFileSync(imagePath, 'base64');
          console.log('Successfully read image, size:', imageBase64.length);
        } else {
          console.log('File not found at path:', imagePath);
          // 如果本地文件不存在，尝试作为URL处理
          console.log('Trying as URL:', req.body.image_url);
          const response = await fetch(req.body.image_url);
          const arrayBuffer = await response.arrayBuffer();
          imageBase64 = Buffer.from(arrayBuffer).toString('base64');
        }
      } catch (error) {
        console.error('Detailed error:', error);
        return res.status(400).json({
          success: false,
          error: `Failed to read image: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      // 使用本地示例图片作为后备
      const imagePath = join(__dirname, 'sample_report.jpg');
      console.log('Reading default sample image from:', imagePath);
      
      if (!fs.existsSync(imagePath)) {
        console.error('Sample image not found:', imagePath);
        return res.status(404).json({
          success: false,
          error: 'Sample image not found'
        });
      }
      
      imageBase64 = fs.readFileSync(imagePath, 'base64');
    }
    
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
