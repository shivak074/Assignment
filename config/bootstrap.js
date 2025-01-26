const { Admin } = require('../api/models/index');
const { BCRYPT, HTTP_STATUS_CODE } = require('./constants');
const i18n = require('./i18n');

const bootstrap = async () => {
  try {
    await Admin.sync({ force: false }); 
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

    const hashedPassword = await BCRYPT.hash('shiva1234', 10);

    const newAdmin = await Admin.create({
      name: 'shiva',
      email: 'shiva1234@gmail.com',
      password: hashedPassword,
    });
  } catch (error) {
    console.error('Error in bootstrap:', error.message);
  }
};

module.exports = bootstrap;
