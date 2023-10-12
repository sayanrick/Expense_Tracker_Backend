const User = require("../models/users");
const Expense = require("../models/expense");
const Sequelize = require("../util/database");
const sequelize = require("../util/database");

exports.getUserLeaderBoard = async (req, res) => {
  try {
    const leaderBoardOfUsers = await User.findAll({
        order:[['totalExpenses', 'DESC']]
    });
    
    res.status(200).json(leaderBoardOfUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
