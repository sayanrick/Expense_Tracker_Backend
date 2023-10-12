const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  dialect: 'mysql',
  host: process.env.DB_HOST,
});

// Attempt to authenticate with the database
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);

    // Log the Sequelize error details
    console.error('Sequelize Error:', err.message);
    console.error('Sequelize Code:', err.original ? err.original.code : 'N/A');
  });

  module.exports = sequelize;