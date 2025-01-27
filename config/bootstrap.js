const { Admin } = require('../api/models/index');
const { BCRYPT, HTTP_STATUS_CODE, VALIDATOR } = require('./constants');
const i18n = require('./i18n');
const { validationRules } = require('./validationRules');

const bootstrap = async () => {
  try {
    const existingAdmin = await Admin.findAll({
      where: { isDeleted: false },
      attributes: { exclude: ['password', 'email'] },
      limit: 1,
    });

    if (existingAdmin.length > 0) {
      return {
        status: HTTP_STATUS_CODE.OK,
        msg: i18n.__('Admin.Auth.ADMIN_ALREADY_EXISTS'),
        data: existingAdmin,
        error: null,
      };
    }

    const data = {
      name: 'shiva',
      email: 'shiva1234@gmail.com',
      password: 'Shiva@1234',
    };

    const validation = new VALIDATOR(data, validationRules.Admin);

    if (validation.fails()) {
      return {
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        msg: i18n.__('messages.INVALID_INPUT'),
        data: validation.errors.all(),
        error: null,
      };
    }

    const hashedPassword = await BCRYPT.hash(data.password, 10);

    const newAdmin = await Admin.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return {
      status: HTTP_STATUS_CODE.CREATED,
      msg: i18n.__('Admin.Auth.ADMIN_CREATED'),
      data: newAdmin,
      error: null,
    };
  } catch (error) {
    console.error('Error in bootstrap:', error.message);
    return {
      status: HTTP_STATUS_CODE.SERVER_ERROR,
      msg: i18n.__('messages.SERVER_ERROR'),
      data: null,
      error: error.message,
    };
  }
};

module.exports = bootstrap;
