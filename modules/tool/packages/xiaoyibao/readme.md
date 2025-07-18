# 小X宝癌症患者助手工具

## 简介

小X宝癌症患者助手是一个专为癌症患者设计的AI助手工具，通过调用小X宝平台的专业API，为癌症患者提供个性化的医疗咨询、治疗建议和心理支持。

## 功能特点

- 🏥 **专业医疗咨询**：基于权威医学知识库，提供专业的癌症相关咨询
- 🎯 **个性化建议**：根据患者具体情况，提供针对性的治疗和生活建议
- 💊 **药物指导**：提供用药建议和注意事项
- 🧠 **心理支持**：为患者提供心理疏导和情感支持
- 📊 **症状分析**：帮助患者理解和管理症状
- 🔒 **隐私保护**：严格保护患者隐私信息

## 配置说明

### 必需参数

1. **API Key**：小X宝平台的API密钥
   - 获取方式：访问 [https://admin.xiaoyibao.com.cn](https://admin.xiaoyibao.com.cn) 注册并获取API密钥
   - 配置位置：在FastGPT工作流中添加本工具时，在配置面板中输入

2. **患者咨询问题**：需要咨询的具体问题
   - 支持文本输入或引用其他节点的输出
   - 建议详细描述症状、病情或疑问

### 配置参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| API Key | string | 是 | 小X宝API密钥，用于身份验证 |
| 患者咨询问题 | string | 是 | 患者需要咨询的问题内容，支持工作流全局变量 |

## 使用方法

### 在FastGPT中使用

1. 在工作流编辑器中添加"小X宝癌症患者助手"工具
2. 配置API Key（首次使用需要输入）
3. 配置患者咨询问题：
   - 可以直接输入问题文本
   - 可以连接工作流全局变量（推荐）
   - 可以连接其他节点的输出
4. 运行工作流，获取专业回复

### 工作流全局变量配置

推荐使用工作流全局变量来传递患者咨询问题，这样可以实现更灵活的工作流设计：

1. **设置全局变量**：
   - 在FastGPT工作流中创建全局变量（如：`user_question`）
   - 将用户输入或其他节点的输出赋值给全局变量

2. **连接到工具**：
   - 在"小X宝癌症患者助手"工具的"患者咨询问题"参数中
   - 选择"引用"模式，连接到全局变量
   - 这样可以实现动态问题传递

3. **优势**：
   - 支持多个工具共享同一个问题
   - 便于工作流的维护和调试
   - 可以结合其他处理节点对问题进行预处理

### 示例问题

```
- "我是肺癌患者，化疗期间应该注意什么饮食？"
- "乳腺癌术后康复期间可以做哪些运动？"
- "化疗副作用导致的恶心呕吐如何缓解？"
- "癌症患者如何调节心理状态？"
```

## API接口说明

### 请求格式

```typescript
{
  question: string,     // 患者咨询问题
  type: 'cancer_assistant'  // 固定值，指定为癌症助手类型
}
```

### 认证方式

支持两种认证方式：
- `Authorization: Bearer {API_KEY}`
- `X-API-Key: {API_KEY}`

### 响应处理

工具会自动处理以下响应格式：
- `data.answer`
- `data.result`
- `data.response`
- 其他格式会转换为JSON字符串

## 错误处理

工具包含完善的错误处理机制：

- **API请求失败**：返回具体的错误状态码和信息
- **网络连接问题**：提供友好的错误提示
- **认证失败**：提示检查API Key配置
- **参数错误**：提供参数格式说明

## 注意事项

⚠️ **重要提醒**：

1. **医疗免责声明**：本工具提供的信息仅供参考，不能替代专业医生的诊断和治疗建议
2. **紧急情况**：如遇紧急医疗情况，请立即就医或拨打急救电话
3. **隐私保护**：请勿在咨询中包含过于敏感的个人信息
4. **API配额**：注意API调用次数限制，合理使用

## 技术规格

- **开发语言**：TypeScript
- **依赖框架**：Zod (数据验证)
- **API端点**：https://admin.xiaoyibao.com.cn
- **支持版本**：v0.1.0

## 开发信息

### 文件结构

```
xiaoyibao/
├── README.md           # 本文档
├── package.json        # 包配置
├── index.ts           # 工具入口
├── config.ts          # 工具配置
└── src/
    └── index.ts       # 核心实现
```

### 本地开发

```bash
# 安装依赖
bun install

# 构建工具
bun run build
```

## 更新日志

### v0.1.0 (当前版本)
- ✅ 基础API调用功能
- ✅ 错误处理机制
- ✅ 多种认证方式支持
- ✅ 响应格式自适应

## 支持与反馈

如有问题或建议，请通过以下方式联系：

- 提交Issue到项目仓库
- 联系小X宝技术支持团队
- 参考FastGPT官方文档

---

*本工具是FastGPT插件生态的一部分，遵循FastGPT的开发规范和最佳实践。*