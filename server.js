const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 检查是否配置了 MongoDB（推荐用于 Render 等云平台）
const MONGODB_URI = process.env.MONGODB_URI;
const USE_MONGODB = !!MONGODB_URI;

// 使用环境变量配置数据文件路径（仅当不使用 MongoDB 时）
// 例如：DATA_DIR=/opt/render/project/src/data
// 如果没有配置，则使用项目根目录（注意：在 Render 上这会被重置）
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');

// MongoDB 相关变量
let mongoClient = null;
let db = null;
const DB_NAME = process.env.DB_NAME || 'list_manager';
const COLLECTION_NAME = 'devices';

// 使用中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(express.static(__dirname)); // 提供静态文件服务，用于访问HTML界面

// MongoDB 连接初始化（如果配置了 MONGODB_URI）
async function initMongoDB() {
  if (!USE_MONGODB) {
    return;
  }
  
  try {
    const { MongoClient } = require('mongodb');
    
    // 配置 MongoDB 连接选项，解决 SSL/TLS 连接问题
    // 对于 MongoDB Atlas 等云服务，需要启用 TLS/SSL 连接
    const clientOptions = {
      // 启用 TLS/SSL 连接（MongoDB Atlas 等云服务需要）
      tls: true,
      // 允许无效证书（仅用于开发环境，生产环境应使用有效证书）
      // 如果您的 MongoDB 服务有有效的 SSL 证书，可以移除此选项
      tlsAllowInvalidCertificates: true,
      // 设置连接超时时间（毫秒）
      serverSelectionTimeoutMS: 5000,
      // 设置连接池大小
      maxPoolSize: 10,
    };
    
    // 创建 MongoDB 客户端，传入连接选项
    mongoClient = new MongoClient(MONGODB_URI, clientOptions);
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);
    console.log('MongoDB 连接成功');
    
    // 确保集合存在并创建索引
    const collection = db.collection(COLLECTION_NAME);
    await collection.createIndex({ id: 1 }, { unique: true });
    console.log('MongoDB 索引创建成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error);
    console.error('将回退到文件系统存储（数据可能无法持久化）');
    // 连接失败时，清空 db 变量，后续操作会回退到文件系统
    db = null;
    mongoClient = null;
  }
}

// 初始化数据存储（MongoDB 或文件系统）
async function initDataStorage() {
  if (USE_MONGODB) {
    await initMongoDB();
  } else {
    initDataFile();
  }
}

// 初始化数据文件（如果不存在）- 仅用于文件系统模式
function initDataFile() {
  try {
    // 确保数据目录存在（如果使用自定义路径）
    if (DATA_DIR !== __dirname && !fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`已创建数据目录: ${DATA_DIR}`);
    }
    
    // 如果数据文件不存在，创建初始文件
    if (!fs.existsSync(DATA_FILE)) {
      // 初始化空的对象数组，每个对象包含 id 和 name 字段
      const initialData = { list: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      console.log(`已创建初始数据文件: ${DATA_FILE}`);
    } else {
      console.log(`数据文件已存在: ${DATA_FILE}`);
    }
  } catch (error) {
    console.error('初始化数据文件失败:', error);
    console.error('数据文件路径:', DATA_FILE);
    // 如果初始化失败，在启动时给出警告
    console.warn('警告: 数据文件初始化失败，数据可能无法持久化保存！');
  }
}

// 读取数据（支持 MongoDB 和文件系统）
async function readData() {
  if (USE_MONGODB && db) {
    try {
      const collection = db.collection(COLLECTION_NAME);
      const list = await collection.find({}).toArray();
      // 移除 MongoDB 的 _id 字段，只返回业务数据
      const cleanList = list.map(item => {
        const { _id, ...rest } = item;
        return rest;
      });
      return { list: cleanList };
    } catch (error) {
      console.error('从 MongoDB 读取数据失败:', error);
      return { list: [] };
    }
  } else {
    // 文件系统模式
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('读取数据文件失败:', error);
      return { list: [] };
    }
  }
}

// 写入数据（支持 MongoDB 和文件系统）
async function writeData(data) {
  if (USE_MONGODB && db) {
    try {
      const collection = db.collection(COLLECTION_NAME);
      // 先清空集合，然后插入新数据
      await collection.deleteMany({});
      if (data.list && data.list.length > 0) {
        await collection.insertMany(data.list);
      }
      console.log('数据已保存到 MongoDB');
      return true;
    } catch (error) {
      console.error('保存数据到 MongoDB 失败:', error);
      return false;
    }
  } else {
    // 文件系统模式
    try {
      // 确保数据目录存在
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // 写入数据文件，使用同步写入确保数据立即保存
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
      console.log(`数据已保存到: ${DATA_FILE}`);
      return true;
    } catch (error) {
      console.error('写入数据文件失败:', error);
      console.error('数据文件路径:', DATA_FILE);
      console.error('错误详情:', error.message);
      return false;
    }
  }
}

// 添加单个设备到数据库（MongoDB 模式）
async function addDeviceToDB(device) {
  if (USE_MONGODB && db) {
    try {
      const collection = db.collection(COLLECTION_NAME);
      await collection.insertOne(device);
      return true;
    } catch (error) {
      console.error('添加设备到 MongoDB 失败:', error);
      return false;
    }
  }
  return false;
}

// 更新数据库中的设备（MongoDB 模式）
async function updateDeviceInDB(index, device) {
  if (USE_MONGODB && db) {
    try {
      const collection = db.collection(COLLECTION_NAME);
      const list = await collection.find({}).toArray();
      if (index >= 0 && index < list.length) {
        await collection.updateOne(
          { id: list[index].id },
          { $set: device }
        );
        return true;
      }
    } catch (error) {
      console.error('更新 MongoDB 设备失败:', error);
      return false;
    }
  }
  return false;
}

// 删除数据库中的设备（MongoDB 模式）
async function deleteDeviceFromDB(index) {
  if (USE_MONGODB && db) {
    try {
      const collection = db.collection(COLLECTION_NAME);
      const list = await collection.find({}).toArray();
      if (index >= 0 && index < list.length) {
        await collection.deleteOne({ id: list[index].id });
        return list[index];
      }
    } catch (error) {
      console.error('从 MongoDB 删除设备失败:', error);
      return null;
    }
  }
  return null;
}

// GET接口：获取list（支持查询参数 status=active 来筛选可用设备）
app.get('/api/list', async (req, res) => {
  try {
    const data = await readData();
    let list = data.list;
    
    // 如果请求参数中有 status=active，则只返回状态为 active 的设备
    if (req.query.status === 'active') {
      list = list.filter(item => (item.status || 'active') === 'active');
    }
    
    res.json({
      success: true,
      data: list,
      message: '获取list成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取list失败',
      error: error.message
    });
  }
});

// GET接口：获取可用的设备列表（只返回状态为 active 的设备）
app.get('/api/list/active', async (req, res) => {
  try {
    const data = await readData();
    // 只返回状态为 active 的设备，如果没有 status 字段则默认为 active
    const activeList = data.list.filter(item => (item.status || 'active') === 'active');
    
    res.json({
      success: true,
      data: activeList,
      message: '获取可用设备列表成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取可用设备列表失败',
      error: error.message
    });
  }
});

// POST接口：添加元素到list
app.post('/api/list', async (req, res) => {
  try {
    const { id, name } = req.body;
    
    // 验证输入：id 和 name 都必须是字符串
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: '请提供有效的id（字符串类型）'
      });
    }

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: '请提供有效的name（字符串类型）'
      });
    }

    const data = await readData();
    
    // 检查是否已存在相同的id（可选：如果需要去重）
    if (data.list.some(item => item.id === id)) {
      return res.status(400).json({
        success: false,
        message: '该id已存在于list中'
      });
    }

    // 添加元素：创建包含 id、name 和 status 的对象，默认状态为启用（active）
    const newItem = { id, name, status: 'active' };
    
    // 如果使用 MongoDB，直接插入；否则添加到数组后保存
    if (USE_MONGODB && db) {
      const success = await addDeviceToDB(newItem);
      if (success) {
        data.list.push(newItem);
        res.json({
          success: true,
          data: data.list,
          message: '添加元素成功'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '保存数据失败'
        });
      }
    } else {
      data.list.push(newItem);
      const success = await writeData(data);
      if (success) {
        res.json({
          success: true,
          data: data.list,
          message: '添加元素成功'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '保存数据失败'
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '添加元素失败',
      error: error.message
    });
  }
});

// PUT接口：更新list中的元素
app.put('/api/list/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const { id, name } = req.body;

    // 验证输入
    if (isNaN(index)) {
      return res.status(400).json({
        success: false,
        message: '索引必须是数字'
      });
    }

    // 验证 id 和 name 都必须是字符串
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: '请提供有效的id（字符串类型）'
      });
    }

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: '请提供有效的name（字符串类型）'
      });
    }

    const data = await readData();

    // 检查索引是否有效
    if (index < 0 || index >= data.list.length) {
      return res.status(400).json({
        success: false,
        message: `索引 ${index} 超出范围，list长度为 ${data.list.length}`
      });
    }

    // 检查是否与其他元素的id重复（排除当前元素）
    const duplicateIndex = data.list.findIndex((item, i) => i !== index && item.id === id);
    if (duplicateIndex !== -1) {
      return res.status(400).json({
        success: false,
        message: '该id已存在于其他元素中'
      });
    }

    // 更新元素：更新对象的 id 和 name 字段，保留原有的 status 字段（如果存在）
    const existingStatus = data.list[index]?.status || 'active';
    const updatedItem = { id, name, status: existingStatus };
    
    // 如果使用 MongoDB，直接更新；否则更新数组后保存
    if (USE_MONGODB && db) {
      const success = await updateDeviceInDB(index, updatedItem);
      if (success) {
        data.list[index] = updatedItem;
        res.json({
          success: true,
          data: data.list,
          message: '更新元素成功'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '保存数据失败'
        });
      }
    } else {
      data.list[index] = updatedItem;
      const success = await writeData(data);
      if (success) {
        res.json({
          success: true,
          data: data.list,
          message: '更新元素成功'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '保存数据失败'
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新元素失败',
      error: error.message
    });
  }
});

// DELETE接口：删除list中的元素
app.delete('/api/list/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    // 验证输入
    if (isNaN(index)) {
      return res.status(400).json({
        success: false,
        message: '索引必须是数字'
      });
    }

    const data = await readData();

    // 检查索引是否有效
    if (index < 0 || index >= data.list.length) {
      return res.status(400).json({
        success: false,
        message: `索引 ${index} 超出范围，list长度为 ${data.list.length}`
      });
    }

    // 删除元素
    const deletedItem = data.list[index];
    
    // 如果使用 MongoDB，直接从数据库删除；否则从数组删除后保存
    if (USE_MONGODB && db) {
      const result = await deleteDeviceFromDB(index);
      if (result) {
        data.list.splice(index, 1);
        res.json({
          success: true,
          data: data.list,
          deletedItem: deletedItem,
          message: '删除元素成功'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '保存数据失败'
        });
      }
    } else {
      data.list.splice(index, 1);
      const success = await writeData(data);
      if (success) {
        res.json({
          success: true,
          data: data.list,
          deletedItem: deletedItem,
          message: '删除元素成功'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '保存数据失败'
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除元素失败',
      error: error.message
    });
  }
});

// PUT接口：切换设备状态（启用/停用）
app.put('/api/list/:index/toggle', async (req, res) => {
  try {
    const index = parseInt(req.params.index);

    // 验证输入
    if (isNaN(index)) {
      return res.status(400).json({
        success: false,
        message: '索引必须是数字'
      });
    }

    const data = await readData();

    // 检查索引是否有效
    if (index < 0 || index >= data.list.length) {
      return res.status(400).json({
        success: false,
        message: `索引 ${index} 超出范围，list长度为 ${data.list.length}`
      });
    }

    // 切换状态：如果当前是 active 则改为 inactive，否则改为 active
    const currentStatus = data.list[index].status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    data.list[index].status = newStatus;

    // 如果使用 MongoDB，直接更新；否则更新数组后保存
    if (USE_MONGODB && db) {
      const success = await updateDeviceInDB(index, data.list[index]);
      if (success) {
        res.json({
          success: true,
          data: data.list[index],
          message: `设备已${newStatus === 'active' ? '启用' : '停用'}`
        });
      } else {
        res.status(500).json({
          success: false,
          message: '保存数据失败'
        });
      }
    } else {
      const success = await writeData(data);
      if (success) {
        res.json({
          success: true,
          data: data.list[index],
          message: `设备已${newStatus === 'active' ? '启用' : '停用'}`
        });
      } else {
        res.status(500).json({
          success: false,
          message: '保存数据失败'
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '切换状态失败',
      error: error.message
    });
  }
});

// PUT接口：替换整个list
app.put('/api/list', async (req, res) => {
  try {
    const { list } = req.body;

    // 验证输入
    if (!Array.isArray(list)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的list（数组类型）'
      });
    }

    // 验证数组中的元素都是对象，且包含 id 和 name 字段（都是字符串）
    // status 字段可选，如果不提供则默认为 active
    if (!list.every(item => 
      typeof item === 'object' && 
      item !== null && 
      typeof item.id === 'string' && 
      typeof item.name === 'string'
    )) {
      return res.status(400).json({
        success: false,
        message: 'list中的所有元素必须是包含 id 和 name 字段的对象（都是字符串类型）'
      });
    }

    // 确保每个元素都有 status 字段，如果没有则默认为 active
    const normalizedList = list.map(item => ({
      ...item,
      status: item.status || 'active'
    }));

    const data = { list: normalizedList };

    const success = await writeData(data);
    if (success) {
      res.json({
        success: true,
        data: data.list,
        message: '替换list成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '保存数据失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '替换list失败',
      error: error.message
    });
  }
});

// 根路径，返回登录页面
app.get('/', (req, res) => {
  // 如果请求的是HTML文件，返回login.html
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    res.sendFile(path.join(__dirname, 'login.html'));
  } else {
    // 否则返回API说明（JSON格式）
    res.json({
      message: 'List管理服务API',
      endpoints: {
        'GET /api/list': '获取list（支持 ?status=active 查询参数）',
        'GET /api/list/active': '获取可用的设备列表（只返回状态为 active 的设备）',
        'POST /api/list': '添加元素到list',
        'PUT /api/list': '替换整个list',
        'PUT /api/list/:index': '更新指定索引的元素',
        'PUT /api/list/:index/toggle': '切换指定索引的设备状态（启用/停用）',
        'DELETE /api/list/:index': '删除指定索引的元素'
      }
    });
  }
});

// 启动服务器
async function startServer() {
  // 初始化数据存储（MongoDB 或文件系统）
  await initDataStorage();
  
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`可视化界面: http://localhost:${PORT}`);
    console.log(`API文档: http://localhost:${PORT}`);
    
    if (USE_MONGODB && db) {
      console.log(`数据存储: MongoDB (${DB_NAME}.${COLLECTION_NAME})`);
      console.log('✅ 数据将持久化保存，不会在重启后丢失');
    } else {
      console.log(`数据文件路径: ${DATA_FILE}`);
      console.log(`数据目录: ${DATA_DIR}`);
      console.warn('⚠️  警告: 数据存储在文件系统，在 Render 上可能会在重启后丢失！');
      console.warn('💡 建议: 配置 MongoDB Atlas（免费）并设置环境变量 MONGODB_URI');
      console.warn('   或: 在 Render 控制台配置持久化磁盘，并设置环境变量 DATA_DIR');
    }
  });
}

// 启动服务器
startServer().catch(error => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});

