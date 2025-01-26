const { SubCategory, SubCategoryTrans, Category } = require("../../../models/index");
const { HTTP_STATUS_CODE,VALIDATOR } = require("../../../../config/constants");
const i18n = require("../../../../config/i18n");
const { uuidv4 } = require("../../../../config/constants");
const { validationRules } = require("../../../../config/validationRules");


const createSubCategory = async (req, res) => {
  try {
    const { categoryId, translations } = req.body;

    const validation = new VALIDATOR(req.body, validationRules.SubCategory);
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
        err: null,
      });
    }

    const newSubCategory = await SubCategory.create({
      id: uuidv4(),
      categoryId,
      isActive: true,
      createdAt: Math.floor(Date.now() / 1000),
    });

    const translationPromises = translations.map(async (translation) => {
      return await SubCategoryTrans.create({
        id: uuidv4(),
        name: translation.name,
        lang: translation.lang,
        subcategoryId: newSubCategory.id,
      });
    });

    await Promise.all(translationPromises);

    return res.status(HTTP_STATUS_CODE.CREATED).json({
      msg: i18n.__("messages.SUBCATEGORY_CREATED"),
      data: { subCategory: newSubCategory, translations },
      err: null,
    });
  } catch (error) {
    console.error("Error in creating subcategory:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const getSubCategoryById = async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    const validation = new VALIDATOR(req.params, { subCategoryId: "required|string" });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const subCategory = await SubCategory.findByPk(subCategoryId, {
      include: [
        {
          model: SubCategoryTrans,
          as: "translations",
        },
        {
          model: Category,
          as: "category",
        },
      ],
    });

    if (!subCategory) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("messages.SUBCATEGORY_NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.SUBCATEGORY_FETCHED"),
      data: subCategory,
      err: null,
    });
  } catch (error) {
    console.error("Error in getting subcategory:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const updateSubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const { categoryId, translations } = req.body;

    const paramValidation = new VALIDATOR(req.params, { subCategoryId: "required|string" });
    const bodyValidation = new VALIDATOR(req.body, validationRules.SubCategory);
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

    const subCategory = await SubCategory.findByPk(subCategoryId);

    if (!subCategory) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("messages.SUBCATEGORY_NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    subCategory.categoryId = categoryId || subCategory.categoryId;
    subCategory.updatedAt =  Math.floor(Date.now() / 1000);
    await subCategory.save();

    if (translations && translations.length > 0) {
      const translationPromises = translations.map(async (translation) => {
        const existingTranslation = await SubCategoryTrans.findOne({
          where: { subcategoryId: subCategory.id, lang: translation.lang },
        });

        if (existingTranslation) {
          existingTranslation.name = translation.name;
          await existingTranslation.save();
        } else {
          await SubCategoryTrans.create({
            id: uuidv4(),
            name: translation.name,
            lang: translation.lang,
            subcategoryId: subCategory.id,
          });
        }
      });

      await Promise.all(translationPromises);
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.SUBCATEGORY_UPDATED"),
      data: { subCategory, translations },
      err: null,
    });
  } catch (error) {
    console.error("Error in updating subcategory:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    const validation = new VALIDATOR(req.params, { subCategoryId: "required|string" });
    if (validation.fails()) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        msg: i18n.__("messages.INVALID_INPUT"),
        data: validation.errors.all(),
        err: null,
      });
    }

    const subCategory = await SubCategory.findByPk(subCategoryId);

    if (!subCategory) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        msg: i18n.__("messages.SUBCATEGORY_NOT_FOUND"),
        data: "",
        err: null,
      });
    }

    subCategory.isDeleted = true;
    await subCategory.save();

    await SubCategoryTrans.update(
      { isDeleted: true },
      { where: { subcategoryId: subCategory.id } }
    );

    return res.status(HTTP_STATUS_CODE.OK).json({
      msg: i18n.__("messages.SUBCATEGORY_DELETED"),
      data: "",
      err: null,
    });
  } catch (error) {
    console.error("Error in deleting subcategory:", error);
    return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
      msg: i18n.__("messages.INTERNAL_ERROR"),
      data: "",
      err: error.message,
    });
  }
};

module.exports = {
  createSubCategory,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
};
