const { Category, CategoryTrans } = require("../../../models/index");
const { HTTP_STATUS_CODE,VALIDATOR } = require("../../../../config/constants");
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
      msg: i18n.__("messages.CATEGORY_CREATED"),
      data: { category: newCategory, translations },
      err: null
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("General.INTERNAL_ERROR"),
      data: "",
      err: error.message
    });
  }
};


const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    
    const validation = new VALIDATOR(req.params, { categoryId: "required|string" });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

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
        msg: i18n.__("messages.CATEGORY_NOT_FOUND"),
        data: "",
        err: null
      });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.CATEGORY_FETCHED"),
      data: category,
      err: null
    });
  } catch (error) {
    console.error("Error getting category:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message
    });
  }
};


const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { translations } = req.body;
    
    const validation = new VALIDATOR(req.body, validationRules.TransController);
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    
    const categoryValidation = new VALIDATOR(req.params, { categoryId: "required|string" });
    if (categoryValidation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: categoryValidation.errors.all(),
        err: null,
      });
    }

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("messages.CATEGORY_NOT_FOUND"),
        data: "",
        err: null
      });
    }

    category.updatedAt =  Math.floor(Date.now() / 1000);
    await category.save();

    if (translations && translations.length > 0) {
      const translationPromises = translations.map(async (translation) => {
        const existingTranslation = await CategoryTrans.findOne({
          where: { categoryId: category.id, lang: translation.lang }
        });

        if (existingTranslation) {
          existingTranslation.name = translation.name;
          await existingTranslation.save();
        } else {
          await CategoryTrans.create({
            id: uuidv4(),
            name: translation.name,
            lang: translation.lang,
            categoryId: category.id
          });
        }
      });

      await Promise.all(translationPromises);
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.CATEGORY_UPDATED"),
      data: { category, translations },
      err: null
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message
    });
  }
};


const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const validation = new VALIDATOR(req.params, { categoryId: "required|string" });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("messages.CATEGORY_NOT_FOUND"),
        data: "",
        err: null
      });
    }

    category.isDeleted = true;
    await category.save();

    await CategoryTrans.update(
      { isDeleted: true },
      { where: { categoryId: category.id } }
    );

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.CATEGORY_DELETED"),
      data: "",
      err: null
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message
    });
  }
};

module.exports = {
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory
};
