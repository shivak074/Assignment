const express = require('express');
const adminAuthRoutes = require('./admin/auth/authRoutes');
const userAuthRoutes = require('./user/auth/authRoutes');

const router = express.Router();


router.use('/admin', adminAuthRoutes);
router.use('/user', userAuthRoutes);

module.exports = router;
