const User = require('../models/User')
const jwt = require('jsonwebtoken');
module.exports.findUsersExceptMe = async (req, res, next) => {
  const {token} = req.body;
  //console.log(token);
  if (token) {
    jwt.verify(token,'net ninja secret', async (err, decodedToken) => {
      if (err) {
        res.status(400).json({err})
      }else {
        let users = await User.find({ _id: { $ne: decodedToken.id } });
        res.status(200).json({
          users,
          total: users.length
        });
      }
    })
  } else {
    res.status(400).json({errors: 'Must login'})
  }
}

