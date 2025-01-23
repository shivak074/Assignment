const { JWT, uuidv4, VALIDATOR, BCRYPT, Op, HTTP_STATUS_CODE} = require('../../config/constant');
const { User } = require('../../models/index');
const { generateToken } = require('../../helper/auth/generateJWTToken');
const { validationRules } = require('../../config/validationRules');
const i18n = require('../../config/i18n')


const SignUp = async (req, res) => {
  const { name, email, password, country, city, companyName } = req.body;

  const validation = new VALIDATOR(req.body, validationRules.User);
  if (validation.fails()) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: validation.errors.all() });
  }

  try {
    const existingUser = await User.findOne({
      where: { email: { [Op.iLike]: email } },
    });

    if (existingUser) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: i18n.__('messages.INVALID_EMAIL_FORMAT') });
    }

    const hashedPassword = await BCRYPT.hash(password, 10);

    const newUser = await User.create({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      country,
      city,
      CompanyName: companyName,
    });

    const userWithoutPassword = newUser.toJSON();
    delete userWithoutPassword.password;

    return res.status(HTTP_STATUS_CODE.CREATED).json({
      message: i18n.__('messages.USER_CREATED'),
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error in signup:', error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({ message: i18n.__('messages.INTERNAL_ERROR') });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const validation = new VALIDATOR(req.body, validationRules.User);
  if (validation.fails()) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: validation.errors.all() });
  }

  try {
    const user = await User.findOne({
      where: { email: { [Op.iLike]: email } },
    });

    if (!user) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: i18n.__('messages.INVALID_CREDENTIALS') });
    }

    const isPasswordValid = await BCRYPT.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ message: i18n.__('messages.INVALID_CREDENTIALS') });
    }

    const token = generateToken({ userId: user.id, email: user.email }, '1h');

    return res.status(HTTP_STATUS_CODE.OK).json({ message: i18n.__('messages.LOGIN_SUCCESS'), token });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({ message: i18n.__('messages.INTERNAL_ERROR') });
  }
};

module.exports = {
  SignUp,
  login,
};
