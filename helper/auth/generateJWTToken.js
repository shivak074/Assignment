const { JWT } = require('../../config/constant');

const secretKey = process.env.JWT_SECRET || 'your_default_secret_key';

function generateToken(payload, expiresIn = '1h') {
  try {
    const token = JWT.sign(payload, secretKey, { expiresIn });
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Error generating token');
  }
}

module.exports = {
  generateToken,
};
