const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const AV = require('leancloud-storage'); // 引入 LeanCloud SDK

const app = express();
const PORT = process.env.PORT || 3000;

// 使用环境变量配置数据文件路径
// 例如：DATA_DIR=/opt/render/project/src/data
// 如果没有配置，则使用项目根目录（注意：在 Render 上这会被重置）
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');

// LeanCloud 配置（从环境变量读取）
// 如果配置了 LeanCloud，则使用数据库存储；否则使用文件系统存储
const LEANCLOUD_APP_ID = process.env.LEANCLOUD_APP_ID;
const LEANCLOUD_APP_KEY = process.env.LEANCLOUD_APP_KEY;
const LEANCLOUD_SERVER_URL = process.env.LEANCLOUD_SERVER_URL; // 可选，用于国内节点

// 判断是否使用 LeanCloud 数据库
const USE_DATABASE = !!(LEANCLOUD_APP_ID && LEANCLOUD_APP_KEY);

// 使用中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(express.static(__dirname)); // 提供静态文件服务，用于访问HTML界面

// 初始化数据存储（LeanCloud 数据库或文件系统）
function initDataStorage() {
  if (USE_DATABASE) {
    // 初始化 LeanCloud 数据库
    initLeanCloud();
  } else {
    // 初始化文件系统存储
    initDataFile();
  }
}

// 初始化 LeanCloud 数据库
function initLeanCloud() {
  try {
    // 配置 LeanCloud
    AV.init({
      appId: LEANCLOUD_APP_ID,
      appKey: LEANCLOUD_APP_KEY,
      serverURL: LEANCLOUD_SERVER_URL || 'https://leancloud.cn' // 默认使用国内节点
    });
    console.log('✅ LeanCloud 数据库初始化成功');
    console.log(`应用ID: ${LEANCLOUD_APP_ID}`);
    
    // 测试连接：尝试读取或创建数据对象
    ensureDataObject();
  } catch (error) {
    console.error('❌ LeanCloud 数据库初始化失败:', error);
    console.warn('⚠️  警告: 将回退到文件系统存储');
  }
}

// 确保数据对象存在（LeanCloud）
async function ensureDataObject() {
  try {
    const DataObject = AV.Object.extend('ListData');
    
    // 先尝试查询是否存在
    const query = new AV.Query(DataObject);
    query.equalTo('type', 'main'); // 使用 type 字段来标识主数据对象
    
    let result;
    try {
      result = await query.first();
    } catch (queryError) {
      // 如果查询失败（可能是类不存在），直接创建新对象
      // LeanCloud 会在第一次保存时自动创建类
      if (queryError.code === 101 || queryError.code === 404) {
        // 101: 查询结果不存在, 404: 类不存在
        result = null;
      } else {
        throw queryError; // 其他错误继续抛出
      }
    }
    
    if (!result) {
      // 如果不存在，创建初始数据对象
      // 注意：第一次保存到不存在的类时，LeanCloud 会自动创建该类
      const dataObj = new DataObject();
      dataObj.set('type', 'main'); // 使用 type 字段标识
      dataObj.set('list', []);
      await dataObj.save();
      console.log('✅ 已创建初始数据对象和 ListData 类');
    } else {
      console.log('✅ 数据对象已存在');
    }
  } catch (error) {
    // 如果创建失败，记录错误但不阻止服务器启动
    console.error('确保数据对象失败:', error);
    console.warn('⚠️  数据对象将在首次写入时自动创建');
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

// 读取数据（从 LeanCloud 数据库或文件系统）
async function readData() {
  if (USE_DATABASE) {
    // 从 LeanCloud 数据库读取
    try {
      const DataObject = AV.Object.extend('ListData');
      const query = new AV.Query(DataObject);
      query.equalTo('type', 'main'); // 使用 type 字段查询
      
      let result;
      try {
        result = await query.first();
      } catch (queryError) {
        // 如果类不存在（404），返回空数据
        if (queryError.code === 101 || queryError.code === 404) {
          // 101: 查询结果不存在, 404: 类不存在
          return { list: [] };
        }
        throw queryError; // 其他错误继续抛出
      }
      
      if (result) {
        const list = result.get('list') || [];
        return { list };
      } else {
        // 如果不存在，返回空数据
        return { list: [] };
      }
    } catch (error) {
      console.error('从数据库读取数据失败:', error);
      return { list: [] };
    }
  } else {
    // 从文件系统读取
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('读取数据文件失败:', error);
      return { list: [] };
    }
  }
}

// 写入数据（到 LeanCloud 数据库或文件系统）
async function writeData(data) {
  if (USE_DATABASE) {
    // 写入到 LeanCloud 数据库
    try {
      const DataObject = AV.Object.extend('ListData');
      const query = new AV.Query(DataObject);
      query.equalTo('type', 'main'); // 使用 type 字段查询
      
      let result;
      try {
        result = await query.first();
      } catch (queryError) {
        // 如果类不存在（404），result 设为 null，后续会创建新对象
        // LeanCloud 会在第一次保存时自动创建类
        if (queryError.code === 101 || queryError.code === 404) {
          // 101: 查询结果不存在, 404: 类不存在
          result = null;
        } else {
          throw queryError; // 其他错误继续抛出
        }
      }
      
      if (result) {
        // 更新现有对象
        result.set('list', data.list || []);
        await result.save();
        console.log('✅ 数据已保存到 LeanCloud 数据库');
        return true;
      } else {
        // 创建新对象（如果类不存在，LeanCloud 会自动创建类）
        const dataObj = new DataObject();
        dataObj.set('type', 'main'); // 使用 type 字段标识
        dataObj.set('list', data.list || []);
        await dataObj.save();
        console.log('✅ 数据已创建并保存到 LeanCloud 数据库（类已自动创建）');
        return true;
      }
    } catch (error) {
      console.error('❌ 写入数据库失败:', error);
      return false;
    }
  } else {
    // 写入到文件系统
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


// GET接口：获取list（支持查询参数 status=active 来筛选可用设备）
app.get('/api/list', async (req, res) => {
  try {
    const data = await readData(); // 使用 await 等待异步读取
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
    const data = await readData(); // 使用 await 等待异步读取
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

    const data = await readData(); // 使用 await 等待异步读取
    
    // 检查是否已存在相同的id（可选：如果需要去重）
    if (data.list.some(item => item.id === id)) {
      return res.status(400).json({
        success: false,
        message: '该id已存在于list中'
      });
    }

    // 添加元素：创建包含 id、name 和 status 的对象，默认状态为启用（active）
    const newItem = { id, name, status: 'active' };
    
    // 添加到数组后保存到数据库或文件系统
    data.list.push(newItem);
    const success = await writeData(data); // 使用 await 等待异步写入
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

    const data = await readData(); // 使用 await 等待异步读取

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
    
    // 更新数组后保存到数据库或文件系统
    data.list[index] = updatedItem;
    const success = await writeData(data); // 使用 await 等待异步写入
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

    const data = await readData(); // 使用 await 等待异步读取

    // 检查索引是否有效
    if (index < 0 || index >= data.list.length) {
      return res.status(400).json({
        success: false,
        message: `索引 ${index} 超出范围，list长度为 ${data.list.length}`
      });
    }

    // 删除元素
    const deletedItem = data.list[index];
    
    // 从数组删除后保存到数据库或文件系统
    data.list.splice(index, 1);
    const success = await writeData(data); // 使用 await 等待异步写入
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

    const data = await readData(); // 使用 await 等待异步读取

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

    // 更新数组后保存到数据库或文件系统
    const success = await writeData(data); // 使用 await 等待异步写入
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

    // 保存到数据库或文件系统
    const success = await writeData(data); // 使用 await 等待异步写入
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
function startServer() {
  // 初始化数据存储（LeanCloud 数据库或文件系统）
  initDataStorage();
  
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`可视化界面: http://localhost:${PORT}`);
    console.log(`API文档: http://localhost:${PORT}`);
    
    if (USE_DATABASE) {
      console.log('✅ 数据存储在 LeanCloud 数据库中（持久化）');
      console.log(`应用ID: ${LEANCLOUD_APP_ID}`);
    } else {
      console.log(`数据文件路径: ${DATA_FILE}`);
      console.log(`数据目录: ${DATA_DIR}`);
      console.log('✅ 数据存储在文件系统中');
      console.warn('⚠️  警告: 在 Render 等云平台上，数据存储在文件系统可能会在重启后丢失！');
      console.warn('💡 建议: 配置 LeanCloud 数据库实现持久化存储');
      console.warn('💡 或: 在 Render 控制台配置持久化磁盘，并设置环境变量 DATA_DIR');
    }
  });
}

// 导出 app 以便在 Netlify Functions 中使用
// 如果直接运行此文件（如本地开发），则启动服务器
// 如果作为模块导入（如 Netlify Function），则不启动服务器
if (require.main === module) {
  // 直接运行此文件时启动服务器（本地开发）
  startServer();
}

// 导出 app 和初始化函数，供 Netlify Functions 使用
module.exports = { app, initDataStorage };

