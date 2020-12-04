const mongoose = require('mongoose');
const {isEmail} = require('validator')
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
  email: {
    type: 'string',
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
    type: 'string',
    required: [true, 'Please enter a password'],
    minlength: [4, 'Password must be at least 4 characters'],  
  },
  name: {
    type: 'string',
    required: [true, 'Please enter a Name'],
    minlength: [4, 'Name must be at least 4 characters'],  
  },
})
//fire a function before doc saved to db *** NEVER USE ARROW FUNCTION HERE OR U WILL BE RAPED
userSchema.pre('save', async function(next){
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  return next();
})
// static methods to login users
userSchema.statics.login = async function(email, password ) {
  const user = await this.findOne({ email});
  if (user) {
    const auth = await bcrypt.compare(password,user.password)
    if (auth) {
      return user;
    }
    throw Error ('Incorrect password');
  }
  throw Error('Incorrect Email')
}
const User = mongoose.model('User', userSchema)
module.exports = User;

