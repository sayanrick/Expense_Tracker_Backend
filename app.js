const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require("express");
require("dotenv").config();
const sequelize = require("./util/database");
const cors = require("cors");
 // Load environment variables from .env file
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

const userRoutes = require("./routes/user");
const expenseRoutes = require("./routes/expense");
const purchaseRoutes = require("./routes/purchase");
const premiumFeatureRoutes = require("./routes/premiumFeature");
const resetPasswordRoutes = require("./routes/resetPassword");

const Expense = require("./models/expense");
const User = require("./models/users");
const Order = require("./models/orders");
const Forgotpassword = require("./models/forgotpassword");

app.use(express.json());
app.use(cors());
app.use("/user", userRoutes);
app.use("/expense", expenseRoutes);
app.use("/purchase", purchaseRoutes);
app.use("/premium", premiumFeatureRoutes);
app.use('/password', resetPasswordRoutes);

app.use((req, res) => {
  console.log('url ', req.url);
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});

// Specify your desired log directory
const logDirectory = path.join(__dirname, 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Create a rotating write stream for morgan logs
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, 'access.log'),
  { flags: 'a' }
);

app.use(helmet());
app.use(compression());

// Use morgan for logging and specify the log stream
app.use(morgan('combined', { stream: accessLogStream }));

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

sequelize
  .sync()
  // .sync( { force : true } )
  .then(() => {
    app.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  })
  .catch((err) => {
    console.error("Error syncing with the database:", err);
  });
