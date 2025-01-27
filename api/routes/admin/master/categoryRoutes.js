const express = require("express")
const router = express.Router()
const categoryController = require('../../../controller/admin/master/categoryController')

router.post("/add", categoryController.createCategory)
router.get("/get/:categoryId", categoryController.getCategoryById)
router.get("/get", categoryController.getAllCategories)
router.post("/update/:categoryId", categoryController.updateCategory)
router.delete("/delete/:categoryId", categoryController.deleteCategory)
module.exports = router