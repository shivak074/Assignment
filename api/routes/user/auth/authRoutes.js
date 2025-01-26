const express = require("express")
const router = express.Router()
const userController = require("../../../controller/user/authController")

router.post("/signup", userController.SignUp)
router.post("/login", userController.login)

module.exports = router
