const express = require('express');

const expenseController = require('../controllers/expense');
const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.post("/addExpense", userAuthentication.authenticate, expenseController.addExpense);

router.get("/getExpenses", userAuthentication.authenticate, expenseController.getExpenses);

router.delete("/deleteExpense/:expenseId", userAuthentication.authenticate, expenseController.deleteExpense);


module.exports = router;