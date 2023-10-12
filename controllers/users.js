const bcrypt = require('bcrypt');
const User = require("../models/users");
const jwt = require('jsonwebtoken');

function generateAccessToken (id, name, isPremiumUser) {
  return jwt.sign({userId: id, name: name, isPremiumUser}, 'secretkey');
}

exports.generateAccessToken = generateAccessToken;

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log('email', email);

    if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password)) {
      return res.status(400).json({ err: 'Bad Parameters Something is missing' });
    }

    const saltrounds = 10;

    // Hash the password
    bcrypt.hash(password, saltrounds, async (err, hash) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ err: 'Error hashing password' });
      }

      // Create the user with the hashed password
      await User.create({ name, email, password: hash });
      res.status(201).json({ message: 'Successfully created new user' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: 'Error Signing up' });
  }
};


function isStringInvalid(string) {
  if (string == undefined || string.length === 0) return true;
  else return false;
}


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (isStringInvalid(email) || isStringInvalid(password)) {
      return res
        .status(400)
        .json({ message: "Email Id or Password is missing", success: false });
    }
    console.log(password);
    const user = await User.findAll({ where: { email } });
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, (err, result) => {
        if(err) {
          throw new error('Something went wrong');
        } 
        if(result === true) {
          return res.status(200).json({success: true, message: 'User logged in successfully', token: generateAccessToken(user[0].id, user[0].name, user[0].isPremiumUser)});
        }
        else {
          return res.status(400).json({success: false, message: 'Password is incorrect'});
        }
      });
    }
    else {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

