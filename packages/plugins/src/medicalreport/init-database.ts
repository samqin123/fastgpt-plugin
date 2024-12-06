import { MongoClient } from 'mongodb';

async function initializeDatabase(mongoUri: string) {
  try {
    console.log('开始初始化数据库...');
    
    // 连接到MongoDB
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('已连接到MongoDB');
    
    const db = client.db();
    
    // 创建集合（如果不存在）
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    // 创建patients集合
    if (!collectionNames.includes('patients')) {
      await db.createCollection('patients');
      console.log('创建patients集合');
    }
    
    // 创建reports集合
    if (!collectionNames.includes('reports')) {
      await db.createCollection('reports');
      console.log('创建reports集合');
    }
    
    // 创建索引
    const patients = db.collection('patients');
    const reports = db.collection('reports');
    
    // 患者集合索引
    await patients.createIndexes([
      { 
        key: { patientIdHash: 1 }, 
        unique: true,
        name: 'idx_patientIdHash' 
      },
      { 
        key: { nameHash: 1 }, 
        name: 'idx_nameHash' 
      },
      { 
        key: { phoneHash: 1 }, 
        name: 'idx_phoneHash' 
      }
    ]);
    console.log('已创建patients集合索引');
    
    // 报告集合索引
    await reports.createIndexes([
      { 
        key: { patientIdHash: 1, reportDate: -1 }, 
        name: 'idx_patient_date' 
      },
      { 
        key: { reportId: 1 }, 
        unique: true,
        name: 'idx_reportId' 
      }
    ]);
    console.log('已创建reports集合索引');
    
    // 创建验证规则（可选）
    await db.command({
      collMod: 'patients',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['patientId', 'patientIdHash', 'name', 'nameHash', 'createdAt', 'updatedAt'],
          properties: {
            patientId: { bsonType: 'string' },
            patientIdHash: { bsonType: 'string' },
            name: { bsonType: 'string' },
            nameHash: { bsonType: 'string' },
            phone: { bsonType: 'string' },
            phoneHash: { bsonType: 'string' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });
    
    await db.command({
      collMod: 'reports',
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['patientIdHash', 'reportId', 'reportDate', 'parsedReport', 'createdAt'],
          properties: {
            patientIdHash: { bsonType: 'string' },
            reportId: { bsonType: 'string' },
            reportDate: { bsonType: 'date' },
            parsedReport: { bsonType: 'object' },
            abnormalConditions: { bsonType: 'array' },
            confidence: { bsonType: 'number' },
            createdAt: { bsonType: 'date' }
          }
        }
      }
    });
    console.log('已设置集合验证规则');
    
    console.log('数据库初始化完成！');
    await client.close();
    
  } catch (error) {
    console.error('初始化数据库时发生错误:', error);
    throw error;
  }
}

// 导出初始化函数
export { initializeDatabase };
