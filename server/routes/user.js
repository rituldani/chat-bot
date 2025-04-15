import express from 'express';
import {
  register,
  login,
  validUser,
  googleAuth,
  logout,
  searchUsers,
  updateInfo,
  getUserById,
  // authenticate,
} from '../controllers/user.js';
import { Auth } from '../middleware/user.js';
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/valid', Auth, validUser);
router.get('/logout', Auth, logout);
router.post('/api/google', googleAuth);
router.get('/user', Auth, searchUsers);
router.get('/api/users/:id', Auth, getUserById);
router.patch('/api/users/update/:id', Auth, updateInfo);
export default router;
