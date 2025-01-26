const { MstCity, MstCityTrans } = require("../../../models/index");
const { HTTP_STATUS_CODE,VALIDATOR } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");
const { uuidv4 } = require("../../../../config/constants");
const { validationRules } = require("../../../../config/validationRules");

const createCity = async (req, res) => {
  try {
    const { countryId, translations } = req.body;

    const validation = new VALIDATOR(req.body, validationRules.TransController);
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const newCity = await MstCity.create({
      id: uuidv4(),
      countryId,
      isActive: true,
      createdAt: Math.floor(Date.now() / 1000),
    });

    const translationPromises = translations.map(async (translation) => {
      return await MstCityTrans.create({
        id: uuidv4(),
        name: translation.name,
        lang: translation.lang,
        cityId: newCity.id,
      });
    });

    await Promise.all(translationPromises);

    return res.status(HTTP_STATUS_CODE.CREATED).json({
      msg: i18n.__("messages.CITY_CREATED"),
      data: { city: newCity, translations },
      err: null,
    });
  } catch (error) {
    console.error("Error in creating city:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const getCityById = async (req, res) => {
  try {
    const { cityId } = req.params;

    const validation = new VALIDATOR(req.params, { cityId: "required|string" });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const city = await MstCity.findByPk(cityId, {
      include: [
        {
          model: MstCityTrans,
          as: "translations",
        },
      ],
    });

    if (!city) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("messages.CITY_NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.CITY_FETCHED"),
      data: city,
      err: null,
    });
  } catch (error) {
    console.error("Error in getting city:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const updateCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { countryId, translations } = req.body;

    const paramValidation = new VALIDATOR(req.params, { cityId: "required|string" });
    const bodyValidation = new VALIDATOR(req.body, validationRules.City);
    if (paramValidation.fails() || bodyValidation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: {
          paramErrors: paramValidation.errors.all(),
          bodyErrors: bodyValidation.errors.all(),
        },
        err: null,
      });
    }

    const city = await MstCity.findByPk(cityId);

    if (!city) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("messages.CITY_NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    city.countryId = countryId || city.countryId;
    city.updatedAt =  Math.floor(Date.now() / 1000);
    await city.save();

    if (translations && translations.length > 0) {
      const translationPromises = translations.map(async (translation) => {
        const existingTranslation = await MstCityTrans.findOne({
          where: { cityId: city.id, lang: translation.lang },
        });

        if (existingTranslation) {
          existingTranslation.name = translation.name;
          await existingTranslation.save();
        } else {
          await MstCityTrans.create({
            id: uuidv4(),
            name: translation.name,
            lang: translation.lang,
            cityId: city.id,
          });
        }
      });

      await Promise.all(translationPromises);
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.CITY_UPDATED"),
      data: { city, translations },
      err: null,
    });
  } catch (error) {
    console.error("Error in updating city:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const deleteCity = async (req, res) => {
  try {
    const { cityId } = req.params;

    const validation = new VALIDATOR(req.params, { cityId: "required|string" });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const city = await MstCity.findByPk(cityId);

    if (!city) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("messages.CITY_NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    city.isDeleted = true;
    await city.save();

    await MstCityTrans.update(
      { isDeleted: true },
      { where: { cityId: city.id } }
    );

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.CITY_DELETED"),
      data: "",
      err: null,
    });
  } catch (error) {
    console.error("Error in deleting city:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

module.exports = {
  createCity,
  getCityById,
  updateCity,
  deleteCity,
};
