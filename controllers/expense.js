const Expense = require("../models/expense");
const User = require("../models/users");
const Sequelize = require("../util/database");
const UserServices = require('../services/userservices');
const S3Services = require('../services/S3Services');


exports.downloadExpense = async (req, res) => {
  try{
  const expenses = await UserServices.getExpenses(req);
  console.log(expenses);
  const stringifiedExpenses = JSON.stringify(expenses);
  // It should depend upon the userid
  const userId = req.user.id;

  const filename = `Expense${userId}/${new Date()}.txt`;
  const fileUrl = await S3Services.uploadToS3(stringifiedExpenses, filename);
  console.log(fileUrl);
  res.status(200).json({ fileUrl, success: true })
  }
  catch(err) {
    res.status(500).json({fileUrl: '', success: false, err: err})
  }
  
}


exports.addExpense = async (req, res, next) => {
  let t = await Sequelize.transaction();

  try {
    const { expenseAmount, description, category } = req.body;

    // Input validation
    if (!expenseAmount || expenseAmount <= 0 || !description || !category) {
      return res.status(400).json({ success: false, error: "Invalid parameters" });
    }

    const newExpense = await Expense.create(
      {
        expenseAmount,
        description,
        category,
        userId: req.user.id, // Assuming you associate the expense with a user
      },
      { transaction: t }
    );

    const totalExpense = Number(req.user.totalExpenses) + Number(expenseAmount);
    console.log(totalExpense);
    await User.update(
      {
        totalExpenses: totalExpense,
      },
      {
        where: { id: req.user.id },
        transaction: t,
      }
    );

    await t.commit();
    return res.status(201).json({ success: true, expense: newExpense });
  } catch (err) {
    if (t) await t.rollback(); // Rollback the transaction if an error occurs
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error", errorMessage: err.message });
  }
};



exports.getExpenses = async (req, res, next) => {
  try {
    // const expenses = await Expense.findAll();
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    // const expenses = await req.user.getExpenses();

    return res.status(200).json({ success: true, expenses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.deleteExpense = async (req, res) => {
  const expenseId = req.params.expenseId;

  if (!expenseId || isNaN(expenseId)) {
    return res.status(400).json({ success: false, message: "Invalid expense ID" });
  }

  try {
    const deletedExpense = await Expense.destroy({ where: { id: expenseId, userId: req.user.id } });

    if (deletedExpense === 0) {
      return res.status(404).json({ success: false, message: "Expense doesn't belong to the user" });
    }

    return res.status(200).json({ success: true, message: "Expense deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
