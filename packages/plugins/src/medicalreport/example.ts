import MedicalReportPlugin from './index';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    // 创建插件实例
    const plugin = new MedicalReportPlugin();
    
    // 连接数据库
    await plugin.connectMongo(process.env.MONGODB_URI);

    // 读取示例图片
    const imagePath = join(__dirname, 'example-report.jpg');
    const imageBase64 = fs.readFileSync(imagePath, 'base64');

    // 处理报告
    const result = await plugin.processReport(
      imageBase64,
      {
        patientId: "P202401001",
        name: "测试患者",
        phone: "13800138000"
      }
    );

    console.log('处理结果:', result);
    
    if (result.success && result.report) {
      console.log('\n报告详情:');
      console.log('- 报告ID:', result.reportId);
      console.log('- 患者ID:', result.report.patientId);
      console.log('- 报告日期:', result.report.date);
      
      // 显示异常指标
      const abnormalConditions = result.report.abnormalConditions || [];
      if (abnormalConditions.length > 0) {
        console.log('\n异常指标:');
        for (const condition of abnormalConditions) {
          console.log(`- ${condition}`);
        }
      }
      
      // 显示详细检测项目
      console.log('\n检测项目:');
      const parsedReport = result.report.parsedReport || {};
      for (const [name, item] of Object.entries(parsedReport)) {
        console.log(`\n${name}:`);
        console.log(`- 数值: ${item.originalValue}`);
        console.log(`- 状态: ${item.status}`);
        if (item.change) {
          console.log(`- 变化: ${item.change.value > 0 ? '上升' : '下降'} ${Math.abs(item.change.percentage).toFixed(1)}%`);
        }
        if (item.alerts?.length) {
          console.log('- 警报:');
          for (const alert of item.alerts) {
            console.log(`  * ${alert.message} (${alert.severity})`);
          }
        }
      }
    } else if (result.error) {
      console.error('处理失败:', result.error);
    }
  } catch (error) {
    console.error('处理失败:', error);
  }
}

main();