const { Admin } = require('../../models/index');
const { generateToken } = require('../../helper/auth/generateJWTToken');
const { HTTP_STATUS_CODE,BCRYPT, i18n } = require('../../config/constant');

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        message: i18n.__('messages.INVALID_CREDENTIALS'),
      });
    }

    if (admin.isDeleted) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        message: i18n.__('messages.USER_NOT_FOUND'),
      });
    }

    const isPasswordValid = await BCRYPT.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        message: i18n.__('messages.INVALID_CREDENTIALS'),
      });
    }

    const token = generateToken({ adminId: admin.id, email: admin.email }, '1h');

    return res.status(HTTP_STATUS_CODE.OK).json({
      message: i18n.__('messages.LOGIN_SUCCESS'),
      token,
    });
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      message: i18n.__('messages.INTERNAL_ERROR'),
    });
  }
};

module.exports = {
  loginAdmin,
};
