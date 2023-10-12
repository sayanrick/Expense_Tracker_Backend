const express = require('express');

const userController = require('../controllers/users');
const expenseController = require('../controllers/expense');

const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.post("/signup", userController.signup);

router.post("/login", userController.login);

router.get("/download", userAuthentication.authenticate, expenseController.downloadExpense)

module.exports = router;