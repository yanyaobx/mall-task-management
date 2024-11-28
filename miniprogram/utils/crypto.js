// utils/crypto.js
const CryptoJS = require('./crypto-js/crypto-js'); // 引用本地的 crypto-js 文件

const SECRET_KEY = CryptoJS.enc.Utf8.parse('your-secret-key-1234'); // 请替换为你自己的密钥，长度为16字节
const IV = CryptoJS.enc.Utf8.parse('your-init-vector-123'); // 请替换为你自己的初始向量，长度为16字节

// 加密函数
function encryptPassword(password) {
  return CryptoJS.AES.encrypt(password, SECRET_KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
}

// 解密函数
function decryptPassword(encryptedPassword) {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = {
  encryptPassword,
  decryptPassword
};
