const { Admin } = require("../../../models/index");
const { generateToken } = require("../../../helper/auth/generateJWTToken");
const { HTTP_STATUS_CODE, BCRYPT ,Op,VALIDATOR} = require("../../../../config/constants");
const i18n = require('../../../../config/i18n');
const validationRules = require('../../../../config/validationRules')

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validation = new VALIDATOR(req.body, validationRules.Login);
    
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const admin = await Admin.findOne({
      where: { email: { [Op.iLike]: email } }
    });

    if (!admin) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        message: i18n.__("Admin.Auth.INVALID_CREDENTIALS"),
        data: "",
        error: null
      });
    }

    if (admin.isDeleted) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        message: i18n.__("Admin.Auth.USER_NOT_FOUND"),
        data: "",
        error: null
      });
    }

    const isPasswordValid = await BCRYPT.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        message: i18n.__("Admin.Auth.INVALID_CREDENTIALS"),
        data: "",
        error: null
      });
    }

    const token = generateToken({ adminId: admin.id, email: admin.email }, "1h");

    return res.status(HTTP_STATUS_CODE.OK).json({
      message: i18n.__("Admin.Auth.LOGIN_SUCCESS"),
      data: { token },
      error: null
    });
  } catch (error) {
    console.error("Error in loginAdmin:", error.message);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      message: i18n.__("General.INTERNAL_ERROR"),
      data: error.message,
      error: error
    });
  }
};

module.exports = {
  login
};
