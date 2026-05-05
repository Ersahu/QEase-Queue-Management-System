const crypto = require('crypto');

const getKey = () => {
  const secret = process.env.DATA_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret || !String(secret).trim()) {
    throw new Error('DATA_ENCRYPTION_KEY or JWT_SECRET is required for encryption');
  }

  return crypto.createHash('sha256').update(String(secret)).digest();
};

const encrypt = (value) => {
  if (!value) return '';

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(String(value), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
};

const decrypt = (payload) => {
  if (!payload) return '';

  const [ivBase64, tagBase64, encryptedBase64] = String(payload).split(':');
  if (!ivBase64 || !tagBase64 || !encryptedBase64) return '';

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getKey(),
    Buffer.from(ivBase64, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tagBase64, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedBase64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
};

module.exports = {
  encrypt,
  decrypt,
};
