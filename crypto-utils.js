/**
 * 加密解密工具函数
 * 用于对设备ID进行加密和解密
 */

// 加密密钥（可以修改，但需要保持一致）
const CRYPTO_KEY = 'Hy-Device-Id-Key-1998';

/**
 * 简单的字符串加密函数
 * @param {string} text - 要加密的文本
 * @returns {string} - 加密后的字符串（十六进制格式）
 */
function encrypt(text) {
  if (!text) return '';
  
  let encrypted = '';
  const keyLength = CRYPTO_KEY.length;
  
  // 遍历每个字符进行加密
  for (let i = 0; i < text.length; i++) {
    // 获取字符的ASCII码
    const charCode = text.charCodeAt(i);
    // 获取密钥对应位置的字符ASCII码
    const keyCharCode = CRYPTO_KEY.charCodeAt(i % keyLength);
    // 异或加密
    const encryptedCharCode = charCode ^ keyCharCode;
    // 转换为十六进制并补齐两位
    encrypted += encryptedCharCode.toString(16).padStart(2, '0');
  }
  // 返回加密后的十六进制字符串
  return encrypted;
}

/**
 * 解密函数
 * @param {string} encryptedText - 加密后的字符串（十六进制格式）
 * @returns {string} - 解密后的原始文本
 */
function decrypt(encryptedText) {
  if (!encryptedText) return '';
  
  let decrypted = '';
  const keyLength = CRYPTO_KEY.length;
  
  // 将十六进制字符串转换为字符数组（每两个字符代表一个加密字符）
  const encryptedChars = encryptedText.match(/.{1,2}/g) || [];
  
  // 遍历每个加密字符进行解密
  for (let i = 0; i < encryptedChars.length; i++) {
    // 将十六进制转换为十进制
    const encryptedCharCode = parseInt(encryptedChars[i], 16);
    // 获取密钥对应位置的字符ASCII码
    const keyCharCode = CRYPTO_KEY.charCodeAt(i % keyLength);
    // 异或解密（异或运算的特性：A ^ B ^ B = A）
    const decryptedCharCode = encryptedCharCode ^ keyCharCode;
    // 转换为字符
    decrypted += String.fromCharCode(decryptedCharCode);
  }
  
  return decrypted;
}

// 导出函数（如果在 Node.js 环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    encrypt,
    decrypt
  };
}

// 在浏览器环境中，将函数暴露到全局作用域
if (typeof window !== 'undefined') {
  window.encrypt = encrypt;
  window.decrypt = decrypt;
}

