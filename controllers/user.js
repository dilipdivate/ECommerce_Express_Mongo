import ErrorHandler from '../utils/errorHandler.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import User from '../models/user.js';
import sendToken from '../utils/jwtToken.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

//Register a User

export const RegisterUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: 'test',
      url: 'pics',
    },
  });

  // const token = user.getJWTToken();

  // res.status(201).json({
  //   success: true,
  //   token,
  // });

  sendToken(user, 201, res);
});

// Login User

export const LoginUser = catchAsyncErrors(async (req, res, next) => {
  // console.log(req.body);
  const { email, password } = req.body;

  // checking if user has given both email and password

  if (!email || !password) {
    return next(new ErrorHandler('Please Enter Email and Password ', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  // const token = user.getJWTToken();

  // res.status(201).json({
  //   success: true,
  //   token,
  // });
  sendToken(user, 200, res);
});

export const LogoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie('token', null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(200).json({
    success: true,
    message: 'Logged Out',
  });
});

export const ForgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return next(new Error('User not found', 404));
  }

  // Get ResetPassword token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is: -  \n\n ${resetPasswordUrl} \n\n Ignore if not rquested to reset`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset your password',
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to user ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//Reset Password

export const ResetPassword = catchAsyncErrors(async (req, res, next) => {
  //Creating token hash
  const resetPasswordToken = crypto
    .createHash('SHA256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new Error('Reset password token is invalid or has been expired', 404)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new Error('Password doesnot match', 404));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});

// Get User details
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// Get User Password
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // console.log('Update Password para1:', req.body.oldPassword);

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  // console.log('Update Password para2:', isPasswordMatched);

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Old password is incorrect', 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match', 400));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

// Update user profile
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  // if (req.body.avatar !== '') {
  //   const user = await User.findById(req.user.id);
  //   const imageId = user.avatar.public_id;
  //   await cloudinary.v2.uploader.destroy(imageId);

  //   const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //     folder: 'avatars',
  //     width: 150,
  //     crop: 'scale',
  //   });

  //   newUserData.avatar = {
  //     public_id: myCloud.public_id,
  //     url: myCloud.secure_url,
  //   };
  // }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Get all Users - {Admin}

export const getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get Single User - {Admin}

export const getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with ID: ${req.params.id}`, 401)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update Role
export const updateRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(new ErrorHandler('Not valid User', 401));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

// Delete User
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User doesnot exist with ${req.params.id}`, 401)
    );
  }

  await user.remove();
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});
