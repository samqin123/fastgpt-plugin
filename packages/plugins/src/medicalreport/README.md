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

# 请求示例
curl -X POST http://localhost:3330/process-sample \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "/path/to/your/sample_report.jpg",
    "patientInfo": {
      "patientId": "SAMPLE001",
      "name": "示例患者",
      "phone": "13800138000"
    }
  }'

# 响应示例
{
  "success": true,
  "reportId": "c0dc086a-4c8b-4e91-9246-6c90b77f61f3",
  "report": {
    "reportId": "c0dc086a-4c8b-4e91-9246-6c90b77f61f3",
    "patientId": "SAMPLE001",
    "date": "2024-12-06T06:35:47.625Z",
    "parsedReport": {
      "总蛋白": {
        "value": 78.40,
        "originalValue": "78.40 g/L",
        "unit": "g/L",
        "referenceRange": {
          "min": 65,
          "max": 85
        },
        "status": "normal"
      },
      "碱性磷酸酶": {
        "value": 190.70,
        "originalValue": "190.70 U/L",
        "unit": "U/L",
        "referenceRange": {
          "min": 50,
          "max": 135
        },
        "status": "high"
      }
      // ... 其他指标
    },
    "abnormalConditions": [
      "碱性磷酸酶: 190.70 U/L (偏高)"
    ],
    "confidence": 0.95
  }
}

**请求参数说明：**
- `image_url`: 支持本地文件路径或 HTTP URL
- `patientInfo`: 患者信息对象
  - `patientId`: 患者ID（必填）
  - `name`: 患者姓名（必填）
  - `phone`: 联系电话（必填）

**响应字段说明：**
- `success`: 处理是否成功
- `reportId`: 报告唯一标识
- `report`: 报告详细信息
  - `parsedReport`: 解析后的检验指标
    - `value`: 数值
    - `originalValue`: 原始值（包含单位）
    - `unit`: 单位
    - `referenceRange`: 参考范围
    - `status`: 状态（normal/high/low/unknown）
  - `abnormalConditions`: 异常指标列表
  - `confidence`: 置信度
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
    "parsedReport": {
      "总蛋白": {
        "value": 78.40,
        "originalValue": "78.40 g/L",
        "unit": "g/L",
        "referenceRange": {
          "min": 65,
          "max": 85
        },
        "status": "normal"
      }
      // ... 其他指标
    },
    "abnormalConditions": [],
    "confidence": 0.95,
    "createdAt": "2024-12-06T06:35:47.625Z"
  }
  // ... 其他报告
]
```

**参数说明：**
- `patientId`: 患者ID（路径参数）

**响应说明：**
- 返回一个数组，包含该患者的所有报告记录
- 报告按日期降序排序（最新的在前）
- 每个报告包含完整的检验数据和分析结果

### 3. 查找患者信息
```bash
GET http://localhost:3330/patients?patientId=:patientId&name=:name&phone=:phone

# 示例
# 通过患者ID查询
curl "http://localhost:3330/patients?patientId=SAMPLE001"

# 通过姓名和电话查询
curl "http://localhost:3330/patients?name=示例患者&phone=13800138000"

# 通过多个参数组合查询
curl "http://localhost:3330/patients?patientId=SAMPLE001&name=示例患者"

# 响应示例
{
  "patientId": "SAMPLE001",
  "name": "示例患者",
  "phone": "13800138000"
}
```

**查询参数：**
- `patientId`: 患者ID（可选）
- `name`: 患者姓名（可选）
- `phone`: 联系电话（可选）

**说明：**
- 支持通过任意组合的查询参数进行搜索
- 如果找不到匹配的患者，返回 null
- 参数之间是 AND 关系，即所有提供的参数都必须匹配

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
