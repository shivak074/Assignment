const express = require("express")
const router = express.Router()
const searchCategoryController = require('../../../controller/admin/master/searchCategoryController')

router.get("/get",  searchCategoryController.listCategoriesWithSubcategories);
router.get("/getUsersWithFilters",  searchCategoryController.getUsersWithFilters);

module.exports = router