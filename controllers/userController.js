const User = require('../models/User')
const jwt = require('jsonwebtoken');
const { resolveConfig } = require('prettier');
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
// module.exports.findUsersByName = async (req, res) => {
//   const {name} = req.body;
//   try {
//     let user = await User.find({name: name});
//     if (user) {
//       res.status(200).json({
//         message: 'User found',
//         user,
//       })
//     } else {
//       res.status(400).json({errors: 'User not found'})
//     }
//   }catch (err) {
//     res.status(400).json({errors: err.message})
//   }
  
// }
