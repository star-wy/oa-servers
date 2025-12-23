// Netlify Function 包装文件
// 将 Express 应用包装为 Netlify Serverless Function

const serverless = require('serverless-http');
const { app, initDataStorage } = require('../../server');

// 初始化数据存储（LeanCloud 数据库或文件系统）
// 在 Netlify Function 中，每次调用都会执行，但初始化是幂等的
initDataStorage();

// 将 Express 应用包装为 serverless function
// serverless-http 会将 Netlify 的 event 和 context 转换为 Express 请求
const handler = serverless(app, {
  // 配置选项
  binary: ['image/*', 'application/pdf'], // 支持二进制文件类型
});

// 导出 handler 函数，Netlify 会自动调用
module.exports.handler = async (event, context) => {
  // 设置 context 的 callbackWaitsForEmptyEventLoop 为 false
  // 这样可以避免函数等待事件循环，加快响应速度
  context.callbackWaitsForEmptyEventLoop = false;
  
  // 调用 serverless-http 包装的 handler
  return await handler(event, context);
};

