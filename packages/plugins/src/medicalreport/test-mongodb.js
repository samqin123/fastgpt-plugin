import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env') });

async function testMongoDBConnection() {
  // 尝试多个可能的连接字符串
  const possibleUris = [
    process.env.MONGODB_URI || 'mongodb://myusername:mypassword@localhost:27018/medical_reports?authSource=admin',
    'mongodb://myusername:mypassword@127.0.0.1:27018/medical_reports?authSource=admin'
  ];

  for (const uri of possibleUris) {
    console.log(`🔍 尝试连接到: ${uri}`);
    
    try {
      // 创建客户端
      const client = new MongoClient(uri, {
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        authSource: 'admin'
      });
      
      // 连接到MongoDB服务器
      await client.connect();
      
      // 列出所有数据库
      const adminDb = client.db('admin');
      const databases = await adminDb.admin().listDatabases();
      
      console.log('🟢 成功连接到MongoDB！');
      console.log('可用数据库:', databases.databases.map(db => db.name));
      
      // 测试创建和插入数据
      const testDb = client.db('medical_reports');
      const testCollection = testDb.collection('test_connection');
      
      const testDocument = { 
        timestamp: new Date(), 
        message: '连接测试成功',
        hostname: os.hostname()
      };
      
      const result = await testCollection.insertOne(testDocument);
      console.log('🟢 成功插入测试文档:', result.insertedId);
      
      // 查询测试文档
      const findResult = await testCollection.findOne({ _id: result.insertedId });
      console.log('🟢 查询测试文档:', findResult);
      
      // 关闭连接
      await client.close();

      console.log('🟢 MongoDB测试完成');
      process.exit(0);  // 显式退出
    } catch (error) {
      console.error(`🔴 连接 ${uri} 失败:`, error);
    }
  }

  console.error('🔴 所有连接尝试均失败');
  process.exit(1);
}

// 捕获未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  process.exit(1);
});

testMongoDBConnection().catch(error => {
  console.error('测试过程中发生错误:', error);
  process.exit(1);
});