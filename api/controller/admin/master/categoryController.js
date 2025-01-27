const { Category, CategoryTrans, Account } = require("../../../models/index");
const { HTTP_STATUS_CODE, VALIDATOR } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");
const { uuidv4 } = require("../../../../config/constants");
const { validationRules } = require("../../../../config/validationRules");

const createCategory = async (req, res) => {
  try {
    const { translations } = req.body;

    const validation = new VALIDATOR(req.body, validationRules.TransController);
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

  
    for (let translation of translations) {
      const existingTranslation = await CategoryTrans.findOne({
        where: {
          lang: translation.lang,
          name: translation.name
        }
      });

      if (existingTranslation) {
        return res.status(HTTP_STATUS_CODE.CONFLICT).json({
          msg: i18n.__("Category.CATEGORY_TRANSLATIONS_EXISTS"),
          data: "",
          err: null
        });
      }
    }

   
    const newCategory = await Category.create({
      id: uuidv4(),
      isActive: true,
      createdAt: Math.floor(Date.now() / 1000)
    });

    const translationPromises = translations.map(async (translation) => {
      return await CategoryTrans.create({
        id: uuidv4(),
        name: translation.name,
        lang: translation.lang,
        categoryId: newCategory.id
      });
    });

    await Promise.all(translationPromises);

    return res.status(HTTP_STATUS_CODE.CREATED).json({
      msg: i18n.__("Category.CATEGORY_CREATED"),
      data: { category: newCategory, translations },
      err: null
    });
  } catch (error) {
    console.error("Error in creating category:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByPk(categoryId, {
      include: [
        {
          model: CategoryTrans,
          as: "translations"
        }
      ]
    });

    if (!category) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("Category.CATEGORY_NOT_FOUND"),
        data: "",
        err: null
      });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("Category.CATEGORY_FETCHED"),
      data: category,
      err: null
    });
  } catch (error) {
    console.error("Error in getting category:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: null,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { translations } = req.body;

    const paramValidation = new VALIDATOR(req.params, { categoryId: "required|string" });
    const bodyValidation = new VALIDATOR(req.body, validationRules.TransController);
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

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("Category.CATEGORY_NOT_FOUND"),
        data: "",
        err: null
      });
    }

    category.updatedAt = Math.floor(Date.now() / 1000);
    await category.save();

    if (translations && translations.length > 0) {
      const translationPromises = translations.map(async (translation) => {
        const existingTranslation = await CategoryTrans.findOne({
          where: { categoryId: categoryId, lang: translation.lang }
        });

        if (existingTranslation) {
          existingTranslation.name = translation.name;
          await existingTranslation.save();
        } else {
          return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
            msg: i18n.__("Category.CATEGORY_TRANSLATIONS_NOT_FOUND"),
            data: "",
            err: null
          });
        }
      });

      await Promise.all(translationPromises);
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("Category.CATEGORY_UPDATED"),
      data: { category, translations },
      err: null
    });
  } catch (error) {
    console.error("Error in updating category:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("Category.CATEGORY_NOT_FOUND"),
        data: "",
        err: null
      });
    }
    
    const accountsWithCategory = await Account.count({
      where: {
        categoryId: categoryId,
      }
    });

    if (accountsWithCategory > 0) {
      return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({
        msg: i18n.__("Category.CATEGORY_ASSIGNED_TO_ACCOUNT"),
        data: "",
        err: null
      });
    }

    await CategoryTrans.destroy({
      where: {
        categoryId: categoryId
      }
    });

    await Category.destroy({
      where: {
        id: categoryId
      }
    });

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("Category.CATEGORY_DELETED"),
      data: "",
      err: null
    });
  } catch (error) {
    console.error("Error in deleting category:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: CategoryTrans,
          as: "translations"
        }
      ]
    });

    if (categories.length === 0) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("Category.CATEGORIES_NOT_FOUND"),
        data: "",
        err: null
      });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("Category.CATEGORIES_FETCHED"),
      data: categories,
      err: null
    });
  } catch (error) {
    console.error("Error in getting all categories:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: error.message,
      err: null,
    });
  }
};


module.exports = {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory
};
