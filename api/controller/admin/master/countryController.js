const { MstCountry, MstCountryTrans } = require("../../../models/index");
const { HTTP_STATUS_CODE,VALIDATOR } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");
const { uuidv4 } = require("../../../../config/constants");
const { validationRules } = require("../../../../config/validationRules");
// Create Country
const createCountry = async (req, res) => {
  try {
    const { countryName, translations } = req.body;
    
    const validation = new VALIDATOR(req.body, validationRules.Country);
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }
    
    const newCountry = await MstCountry.create({
      id: uuidv4(),
      isActive: true,
      createdAt: Math.floor(Date.now() / 1000)
    });

    const translationPromises = translations.map(async (translation) => {
      return await MstCountryTrans.create({
        id: uuidv4(),
        name: translation.name,
        lang: translation.lang,
        countryId: newCountry.id
      });
    });

    await Promise.all(translationPromises);

    return res.status(HTTP_STATUS_CODE.CREATED).json({
      msg: i18n.__("messages.COUNTRY_CREATED"),
      data: { country: newCountry, translations },
      err: null
    });
  } catch (error) {
    console.error("Error in creating country:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

// Get Country by ID
const getCountryById = async (req, res) => {
  try {
    const { countryId } = req.params;

    // Validate countryId
    const validation = new VALIDATOR(req.params, { countryId: "required|string" });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const country = await MstCountry.findByPk(countryId, {
      include: [
        {
          model: MstCountryTrans,
          as: "translations"
        }
      ]
    });

    if (!country) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("messages.COUNTRY_NOT_FOUND"),
        data: "",
        err: null
      });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.COUNTRY_FETCHED"),
      data: country,
      err: null
    });
  } catch (error) {
    console.error("Error in getting country:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

// Update Country
const updateCountry = async (req, res) => {
  try {
    const { countryId } = req.params;
    const { countryName, translations } = req.body;

    // Validate countryId and body
    const paramValidation = new VALIDATOR(req.params, { countryId: "required|string" });
    const bodyValidation = new VALIDATOR(req.body, validationRules.Country);
    if (paramValidation.fails() || bodyValidation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: {
          paramErrors: paramValidation.errors.all(),
          bodyErrors: bodyValidation.errors.all()
        },
        err: null,
      });
    }

    const country = await MstCountry.findByPk(countryId);

    if (!country) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("messages.COUNTRY_NOT_FOUND"),
        data: "",
        err: null
      });
    }

    country.updatedAt =  Math.floor(Date.now() / 1000);
    await country.save();

    if (translations && translations.length > 0) {
      const translationPromises = translations.map(async (translation) => {
        const existingTranslation = await MstCountryTrans.findOne({
          where: { countryId: country.id, lang: translation.lang }
        });

        if (existingTranslation) {
          existingTranslation.name = translation.name;
          await existingTranslation.save();
        } else {
          await MstCountryTrans.create({
            id: uuidv4(),
            name: translation.name,
            lang: translation.lang,
            countryId: country.id
          });
        }
      });

      await Promise.all(translationPromises);
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.COUNTRY_UPDATED"),
      data: { country, translations },
      err: null
    });
  } catch (error) {
    console.error("Error in updating country:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const deleteCountry = async (req, res) => {
  try {
    const { countryId } = req.params;

    const validation = new VALIDATOR(req.params, { countryId: "required|string" });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const country = await MstCountry.findByPk(countryId);

    if (!country) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("messages.COUNTRY_NOT_FOUND"),
        data: "",
        err: null
      });
    }

    country.isDeleted = true;
    await country.save();

    await MstCountryTrans.update(
      { isDeleted: true },
      { where: { countryId: country.id } }
    );

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.COUNTRY_DELETED"),
      data: "",
      err: null
    });
  } catch (error) {
    console.error("Error in deleting country:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

module.exports = {
  createCountry,
  getCountryById,
  updateCountry,
  deleteCountry
};
