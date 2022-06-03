import express from 'express';
const router = express.Router();
import {
  RegisterUser,
  LoginUser,
  LogoutUser,
  ForgotPassword,
  ResetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateRole,
  deleteUser,
} from '../controllers/user.js';

import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';

router.route('/register').post(RegisterUser);
router.route('/login').post(LoginUser);
router.route('/logout').get(LogoutUser);
router.route('/password/forgot').post(ForgotPassword);
router.route('/password/reset/:token').put(ResetPassword);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);

router.route('/me').get(isAuthenticatedUser, getUserDetails);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);

router
  .route('/admin/users')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllUser);

router
  .route('/admin/user/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateRole)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

export default router;
