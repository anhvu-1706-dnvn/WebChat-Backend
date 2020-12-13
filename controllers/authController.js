const User = require('../models/User')
const jwt = require('jsonwebtoken');
const { resolveConfig } = require('prettier');
//handle errors
const handleError = (err) => {
  console.log(err.message, err.code);
  let errors = {email: '' , password: ''};

  //Incorrect email
  if (err.message === 'Incorrect Email') {
    errors.email = 'That email is not registered'
  }
  if (err.message === 'Incorrect password') {
    errors.password = 'That password is incorrect'
  }

  // Duplicate error code
  if (err.code === 11000) {
    errors.email = "That email is already registered"
    return errors;
  }
  //Validation errors
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({properties}) => {
      errors[properties.path] = properties.message;
    })
  }
  return errors;
}
const maxAge = 3 * 24 * 60 * 60
const createToken = (id) => {
  return jwt.sign({id},'net ninja secret', {
    expiresIn: maxAge,
  })
}
module.exports.signup_get = (req, res, next) => {
  res.render('signup')
}
module.exports.login_get = (req, res, next) => {
  res.render('login')
}
module.exports.signup_post = async (req, res, next) => {
  const {email, password,name} = req.body;
  try {
    const user = await User.create({email, password,name})
    const token = createToken(user._id)
    res.cookie('jwt',token, {httpOnly: true, maxAge: maxAge * 1000});
    res.status(201).json({
      message: 'Signup Successfully',
    });
  } catch (err) {
    const errors = handleError(err);
    res.status(400).json({errors})
  }
}
module.exports.login_post = async (req, res, next) => {
  const {email, password} = req.body;
  try {
    const user = await User.login(email, password);
    // console.log(user);
    const token = createToken(user._id);
    res.cookie('jwt',token, {httpOnly: true, maxAge:maxAge * 1000});
    res.status(200).json({
      token: token,
      message: 'Login Successfully',
      name: user.name,
      email: user.email
    });
  } catch (err) {
    const errors = handleError(err);
    res.status(400).json({errors})
  }
}
module.exports.logout = (req, res, next) => {
  res.cookie('jwt','',{maxAge: 1});
  res.redirect('/')
}
