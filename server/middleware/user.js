import jwt from 'jsonwebtoken';
import user from '../models/userModel.js';

// export const Auth = async (req, res, next) => {
//   try {
//     let token = req.headers.authorization.split(' ')[0]; //when using browser this line
//     // let token = req.headers.authorization.split(' ')[1]; //when using postman this line
//     if (token.length < 500) {
//       const verifiedUser = jwt.verify(token, process.env.SECRET);
//       const rootUser = await user
//         .findOne({ _id: verifiedUser.id })
//         .select('-password');
//       req.token = token;
//       req.rootUser = rootUser;
//       req.rootUserId = rootUser._id;
//     } else {
//       let data = jwt.decode(token);
//       req.rootUserEmail = data.email;
//       const googleUser = await user
//         .findOne({ email: req.rootUserEmail })
//         .select('-password');
//       req.rootUser = googleUser;
//       req.token = token;
//       req.rootUserId = googleUser._id;
//     }
//     next();
//   } catch (error) {
//     // console.log(error);
//     res.json({ error: 'Invalid Token' });
//   }
// };

export const Auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Token received:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Token missing" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ use consistent variable

    const rootUser = await user.findById(decoded._id).select('-password');
    if (!rootUser) {
      return res.status(401).json({ error: 'User not found or token invalid' });
    }

    req.token = token;
    req.rootUser = rootUser;
    req.rootUserId = rootUser._id;
    next();
  } catch (err) {
    console.log('Error in Auth middleware:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
