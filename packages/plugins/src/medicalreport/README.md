# Medical Report Processing Plugin

一个用于处理医疗报告的 FastGPT 插件，支持图像识别、数据提取和趋势分析。

## 功能特点

- 医疗报告图像文字识别（OCR）
- 结构化数据提取和解析
- 异常值检测和标记
- 历史数据趋势分析
- MongoDB 数据持久化

## 安装

```bash
npm install @fastgpt/plugin-medical-report
```

## 环境配置

创建 `.env` 文件并配置以下环境变量：

```env
MONGODB_URI=mongodb://myusername:mypassword@localhost:27018/medical_reports?authSource=admin
STEPFUN_API_KEY=your_stepfun_api_key
PORT=3330
```

## 快速开始

1. 安装依赖：
```bash
npm install
```

2. 启动服务：
```bash
npm start
```

## API 端点

### 1. 处理示例报告
```bash
POST http://localhost:3330/process-sample

# 示例响应
{
  "success": true,
  "reportId": "c0dc086a-4c8b-4e91-9246-6c90b77f61f3",
  "report": {
    "reportId": "c0dc086a-4c8b-4e91-9246-6c90b77f61f3",
    "patientId": "SAMPLE001",
    "date": "2024-12-06T06:35:47.625Z",
    "parsedReport": {
      "WBC": {
        "value": 6.5,
        "originalValue": "6.5 10^9/L",
        "unit": "10^9/L",
        "referenceRange": {
          "min": 4.0,
          "max": 10.0
        },
        "status": "normal"
      }
      // ... 其他指标
    },
    "abnormalConditions": []
  }
}
```

### 2. 获取患者报告列表
```bash
GET http://localhost:3330/reports/:patientId

# 示例
curl http://localhost:3330/reports/SAMPLE001

# 响应示例
[
  {
    "reportId": "c0dc086a-4c8b-4e91-9246-6c90b77f61f3",
    "patientId": "SAMPLE001",
    "date": "2024-12-06T06:35:47.625Z",
    "parsedReport": { ... },
    "abnormalConditions": []
  }
]
```

### 3. 查找患者信息
```bash
GET http://localhost:3330/patients?patientId=:patientId

# 示例
curl http://localhost:3330/patients?patientId=SAMPLE001

# 响应示例
{
  "patientId": "SAMPLE001",
  "name": "示例患者",
  "phone": "13800138000"
}
```

### 4. 健康检查
```bash
GET http://localhost:3330/health

# 响应示例
{
  "status": "ok",
  "timestamp": "2024-12-06T06:35:47.625Z"
}
```

## 错误处理

服务会返回适当的 HTTP 状态码和错误信息：

- 400: 请求参数错误
- 404: 资源未找到
- 429: API 调用频率超限
- 500: 服务器内部错误

错误响应格式：
```json
{
  "success": false,
  "error": "错误描述信息"
}
```

## 开发

### 运行测试
```bash
npm test
```

### 构建
```bash
npm run build
```

## 注意事项

1. 确保 MongoDB 服务已启动并可访问
2. StepFun API 有调用频率限制，请合理使用
3. 图像识别结果的准确性取决于原始图像质量

## 许可证

MIT
