const express = require('express');
const router = express.Router();
const userControl = require('../../controller/user/userController');

router.post('/signup', userControl.signup);
router.post('/login', userControl.login);
router.post('/logout', userControl.logout);
router.post('/forgotPassword', userControl.forgot);
router.post('/update', userControl.update);
router.get('/getuser', userControl.get);

module.exports = router;