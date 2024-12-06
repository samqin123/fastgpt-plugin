import { MongoClient } from 'mongodb';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as base64 from 'base64-js';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

// 添加简单的日志函数
function addLog(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config();

// 定义接口和类型
interface ProcessReportParams {
  report_image: string; // URL or base64 encoded image
  api_key: string;
  mongo_uri: string;
  require_confirmation?: boolean;
}

interface ParsedReportItem {
  value: number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low';
  category: string;
  healthImplication: string;
}

interface ProcessResult {
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

interface MedicalReport {
  id: string;
  reportDate: Date;
  indicators: Record<string, ParsedReportItem>;
  abnormalIndicators: string[];
  overallAssessment: string;
  recommendations: string[];
}

class MedicalReportPlugin {
  private mongoUri: string;
  private openai: OpenAI;

  constructor() {
    this.mongoUri = process.env.MONGODB_URI || '';
    this.openai = new OpenAI({
      apiKey: process.env.STEPFUN_API_KEY || '',
      baseURL: "https://api.stepfun.com/v1"
    });
  }

  // 从URL获取图片并转为base64
  async getImageFromUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString('base64');
    } catch (error) {
      addLog(`Error getting image from URL: ${error}`);
      throw error;
    }
  }

  // 从文件路径获取图片并转为base64
  async imageToBase64(filePath: string): Promise<string> {
    try {
      const buffer = await fs.readFile(filePath);
      return buffer.toString('base64');
    } catch (error) {
      addLog(`Error converting image to base64: ${error}`);
      throw error;
    }
  }

  // 使用 StepFun API 提取文本
  async extractTextFromImage(base64Image: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "请提取这张医疗报告图片中的所有指标数据，包括指标名称、数值、单位和参考范围。请以结构化的方式输出，确保包含所有可见的医学指标信息。" },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096
      });

      addLog('Text extraction completed');
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      addLog(`Error extracting text from image: ${error}`);
      throw error;
    }
  }

  // 解析复杂的医疗报告文本
  parseComplexMedicalReport(reportText: string): ProcessResult {
    try {
      // 初始化结果对象
      const result: ProcessResult = {
        success: true,
        fullReport: reportText,
        parsedReport: {},
        abnormalConditions: []
      };

      // 使用正则表达式提取指标信息
      const lines = reportText.split('\n');
      for (const line of lines) {
        const match = line.match(/([^:]+):\s*(\d+\.?\d*)\s*(\w+)\s*\(参考范围:\s*([^)]+)\)/);
        if (match) {
          const [, name, value, unit, referenceRange] = match;
          const status = this.determineStatus(parseFloat(value), referenceRange);
          const category = this.determineCategory(name);
          
          const item: ParsedReportItem = {
            value: parseFloat(value),
            unit,
            referenceRange,
            status,
            category,
            healthImplication: this.getHealthImplication(name, status)
          };

          result.parsedReport[name.trim()] = item;

          if (status !== 'normal') {
            result.abnormalConditions.push({
              name: name.trim(),
              value: parseFloat(value),
              status,
              referenceRange
            });
          }
        }
      }

      addLog(`Parsed ${Object.keys(result.parsedReport).length} indicators`);
      return result;
    } catch (error) {
      addLog(`Error parsing medical report: ${error}`);
      throw error;
    }
  }

  // 判断指标状态
  private determineStatus(value: number, referenceRange: string): 'normal' | 'high' | 'low' {
    const [min, max] = referenceRange.split('-').map(Number);
    if (value < min) return 'low';
    if (value > max) return 'high';
    return 'normal';
  }

  // 判断指标类别
  private determineCategory(indicatorName: string): string {
    const categories = {
      blood: ['红细胞', '白细胞', '血红蛋白', '血小板'],
      liver: ['谷丙转氨酶', '谷草转氨酶', '总胆红素'],
      kidney: ['肌酐', '尿素氮'],
      metabolism: ['血糖', '总胆固醇', '甘油三酯']
    };

    for (const [category, indicators] of Object.entries(categories)) {
      if (indicators.some(indicator => indicatorName.includes(indicator))) {
        return category;
      }
    }
    return 'other';
  }

  // 获取健康建议
  private getHealthImplication(name: string, status: string): string {
    const implications: Record<string, Record<string, string>> = {
      '血红蛋白': {
        high: '血红蛋白偏高可能提示红细胞增多症，建议进一步检查',
        low: '血红蛋白偏低可能提示贫血，建议补充铁剂和营养'
      },
      '血糖': {
        high: '血糖偏高提示糖代谢异常，建议控制饮食和运动',
        low: '血糖偏低需要及时补充糖分，注意饮食规律'
      }
    };

    if (status === 'normal') return '指标在正常范围内';
    return implications[name]?.[status] || `${name}${status === 'high' ? '偏高' : '偏低'}，建议咨询医生`;
  }

  // 存储报告到数据库
  async storeReport(reportData: ProcessResult): Promise<void> {
    try {
      const client = new MongoClient(this.mongoUri);
      await client.connect();
      
      const db = client.db('medical_reports');
      const collection = db.collection('reports');

      const report: MedicalReport = {
        id: new Date().getTime().toString(),
        reportDate: new Date(),
        indicators: reportData.parsedReport,
        abnormalIndicators: reportData.abnormalConditions.map(c => c.name),
        overallAssessment: this.generateOverallAssessment(reportData),
        recommendations: this.generateRecommendations(reportData)
      };

      await collection.insertOne(report);
      addLog(`Report stored in database with ID: ${report.id}`);
      
      await client.close();
    } catch (error) {
      addLog(`Error storing report: ${error}`);
      throw error;
    }
  }

  // 生成整体评估
  private generateOverallAssessment(reportData: ProcessResult): string {
    const abnormalCount = reportData.abnormalConditions.length;
    if (abnormalCount === 0) return '所有指标均在正常范围内，整体健康状况良好。';
    
    const categories = new Set(
      reportData.abnormalConditions.map(c => 
        this.determineCategory(c.name)
      )
    );

    return `检测到${abnormalCount}项异常指标，主要涉及${Array.from(categories).join('、')}等系统，建议进行进一步检查和随访。`;
  }

  // 生成建议
  private generateRecommendations(reportData: ProcessResult): string[] {
    const recommendations: string[] = [];
    
    if (reportData.abnormalConditions.length === 0) {
      recommendations.push('保持当前的健康生活方式');
      recommendations.push('建议定期进行健康检查');
      return recommendations;
    }

    const categoryRecommendations: Record<string, string> = {
      blood: '建议进行血液系统专科检查',
      liver: '建议进行肝功能详细检查',
      kidney: '建议进行肾功能详细检查',
      metabolism: '建议调整饮食结构，增加运动量'
    };

    const categories = new Set(
      reportData.abnormalConditions.map(c => 
        this.determineCategory(c.name)
      )
    );

    categories.forEach(category => {
      if (categoryRecommendations[category]) {
        recommendations.push(categoryRecommendations[category]);
      }
    });

    recommendations.push('建议遵医嘱进行治疗和随访');
    return recommendations;
  }

  // 显示报告并等待确认
  async confirmReport(result: ProcessResult): Promise<boolean> {
    console.log('\n=== 医疗报告解析结果 ===');
    console.log('\n异常指标:');
    result.abnormalConditions.forEach(condition => {
      console.log(`${condition.name}: ${condition.value} (${condition.status})`);
    });
    
    console.log('\n建议:');
    this.generateRecommendations(result).forEach(rec => {
      console.log(`- ${rec}`);
    });

    return true; // 在实际应用中，这里应该等待用户确认
  }

  // FastGPT 工作流入口方法
  async processReport({
    report_image,
    api_key,
    mongo_uri,
    require_confirmation = true
  }: ProcessReportParams): Promise<ProcessResult> {
    try {
      addLog('Starting report processing');
      
      // 设置API密钥和MongoDB URI
      this.mongoUri = mongo_uri;
      this.openai = new OpenAI({ apiKey: api_key });

      // 获取base64图片
      let base64Image = report_image;
      if (report_image.startsWith('http')) {
        base64Image = await this.getImageFromUrl(report_image);
      } else if (report_image.includes('/')) {
        base64Image = await this.imageToBase64(report_image);
      }

      // 提取文本
      const extractedText = await this.extractTextFromImage(base64Image);
      
      // 解析报告
      const result = this.parseComplexMedicalReport(extractedText);

      // 如果需要确认
      if (require_confirmation) {
        const confirmed = await this.confirmReport(result);
        if (!confirmed) {
          throw new Error('Report not confirmed by user');
        }
      }

      // 存储到数据库
      await this.storeReport(result);

      addLog('Report processing completed successfully');
      return result;
    } catch (error) {
      addLog(`Error in processReport: ${error}`);
      throw error;
    }
  }
}

export default MedicalReportPlugin;
