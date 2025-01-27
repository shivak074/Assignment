const express = require("express")
const router = express.Router()
const cityController = require('../../../controller/admin/master/cityController')

router.post("/add", cityController.createCity)
router.get("/get/:cityId", cityController.getCityById)
router.post("/update/:cityId", cityController.updateCity)
router.delete("/delete/:cityId", cityController. deleteCity)
module.exports = router