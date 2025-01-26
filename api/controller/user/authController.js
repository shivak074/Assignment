const { JWT, uuidv4, VALIDATOR, BCRYPT, Op, HTTP_STATUS_CODE } = require("../../../config/constants");
const { User } = require("../../models/index");
const { generateToken } = require("../../helper/auth/generateJWTToken");
const { validationRules } = require("../../../config/validationRules");
const i18n = require("../../../config/i18n");


const SignUp = async (req, res) => {
  try {
    // await Admin.sync({ force: false }); 
    const { name, email, password, country, city, companyName } = req.body;

    const validation = new VALIDATOR(req.body, validationRules.User);
    
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }
    await User.sync({ force: false }); 
    const existingUser = await User.findOne({
      where: { email: { [Op.iLike]: email } }
    });

    if (existingUser) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.EMAIL_ALREADY_EXISTS"),
        data: "",
        err: null,
      });
    }

    const hashedPassword = await BCRYPT.hash(password, 10);

    const newUser = await User.create({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      country,
      city,
      companyName,
    });

    const userWithoutPassword = newUser.toJSON();
    delete userWithoutPassword.password;

    return res.status(HTTP_STATUS_CODE.CREATED).json({
      msg: i18n.__("messages.USER_CREATED"),
      data: userWithoutPassword,
      err: null,
    });
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: error,
    });
  }
};

const login = async (req, res) => { 
  const { email, password } = req.body;

  const validation = new VALIDATOR(req.body, validationRules.Login);
  if (validation.fails()) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      msg: i18n.__("messages.INVALID_INPUT"),
      data: validation.errors.all(),
      err: null,
    });
  }

  try {
    const user = await User.findOne({ where: { email: { [Op.iLike]: email } } });

    if (!user) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_CREDENTIALS"),
        data: "",
        err: null,
      });
    }

    const isPasswordValid = await BCRYPT.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_CREDENTIALS"),
        data: "",
        err: null,
      });
    }

    const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "1h";
    const token = generateToken(
      { userId: user.id, email: user.email },
      TOKEN_EXPIRY
    );

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.LOGIN_SUCCESS"),
      data: { token },
      err: null,
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

module.exports = {
  SignUp,
  login
};
