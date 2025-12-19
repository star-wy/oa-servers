const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// 使用中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体
app.use(express.static(__dirname)); // 提供静态文件服务，用于访问HTML界面

// 初始化数据文件（如果不存在）
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    // 初始化空的对象数组，每个对象包含 id 和 name 字段
    const initialData = { list: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

// 读取数据文件
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据文件失败:', error);
    return { list: [] };
  }
}

// 写入数据文件
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入数据文件失败:', error);
    return false;
  }
}

// 初始化数据文件
initDataFile();

// GET接口：获取list
app.get('/api/list', (req, res) => {
  try {
    const data = readData();
    res.json({
      success: true,
      data: data.list,
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

// POST接口：添加元素到list
app.post('/api/list', (req, res) => {
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

    const data = readData();
    
    // 检查是否已存在相同的id（可选：如果需要去重）
    if (data.list.some(item => item.id === id)) {
      return res.status(400).json({
        success: false,
        message: '该id已存在于list中'
      });
    }

    // 添加元素：创建包含 id 和 name 的对象
    const newItem = { id, name };
    data.list.push(newItem);
    
    if (writeData(data)) {
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
app.put('/api/list/:index', (req, res) => {
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

    const data = readData();

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

    // 更新元素：更新对象的 id 和 name 字段
    data.list[index] = { id, name };

    if (writeData(data)) {
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
app.delete('/api/list/:index', (req, res) => {
  try {
    const index = parseInt(req.params.index);

    // 验证输入
    if (isNaN(index)) {
      return res.status(400).json({
        success: false,
        message: '索引必须是数字'
      });
    }

    const data = readData();

    // 检查索引是否有效
    if (index < 0 || index >= data.list.length) {
      return res.status(400).json({
        success: false,
        message: `索引 ${index} 超出范围，list长度为 ${data.list.length}`
      });
    }

    // 删除元素
    const deletedItem = data.list.splice(index, 1)[0];

    if (writeData(data)) {
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

// PUT接口：替换整个list
app.put('/api/list', (req, res) => {
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

    const data = { list };

    if (writeData(data)) {
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

// 根路径，返回HTML界面
app.get('/', (req, res) => {
  // 如果请求的是HTML文件，返回index.html
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    // 否则返回API说明（JSON格式）
    res.json({
      message: 'List管理服务API',
      endpoints: {
        'GET /api/list': '获取list',
        'POST /api/list': '添加元素到list',
        'PUT /api/list': '替换整个list',
        'PUT /api/list/:index': '更新指定索引的元素',
        'DELETE /api/list/:index': '删除指定索引的元素'
      }
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`可视化界面: http://localhost:${PORT}`);
  console.log(`API文档: http://localhost:${PORT}`);
});

