import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import asyncHandler from 'express-async-handler';
import { sendOTP, verifyOTP } from '../utils/smsService.js';

const getJwtCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

// @desc    Register new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        id: 'user_' + Date.now(),
        name,
        email,
        password: hashedPassword,
        addresses: [],
        wishlist: [],
        usedCoupons: []
    });

    if (user) {
      const token = generateToken(user.id);
      res.cookie('jwt', token, getJwtCookieOptions());

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: 'user',
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Admin Backdoor
  if (email === 'admin@farmlyf.com' && password === 'admin') {
      const token = generateToken('admin_01');
      res.cookie('jwt', token, getJwtCookieOptions());
      return res.json({
          _id: 'admin_01',
          name: 'Super Admin',
          email: 'admin@farmlyf.com',
          role: 'admin',
          token
      });
  }

  try {
    const user = await User.findOne({ email });
    
    if (user && user.isBanned) {
        return res.status(401).json({ message: 'Your account has been banned.' });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user.id);
      res.cookie('jwt', token, getJwtCookieOptions());

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.email === 'admin@farmlyf.com' ? 'admin' : 'user',
        token
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  // Use the user already attached by 'protect' middleware
  const user = req.user;

  if (user) {
    res.json({
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        birthDate: user.birthDate,
        addresses: user.addresses,
        accountType: user.accountType,
        gstNumber: user.gstNumber,
        role: user.email === 'admin@farmlyf.com' ? 'admin' : 'user'
    });
  } else {
    // This case is actually handled by 'protect' middleware now, 
    // but kept as a safety fallback.
    res.status(401).json({ message: 'Not authorized, profile unavailable' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findOne({ id: req.user.id });

    if (user) {
        if (req.body.name !== undefined) user.name = req.body.name;
        if (req.body.email !== undefined) user.email = req.body.email;
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        if (req.body.gender !== undefined) user.gender = req.body.gender;
        if (req.body.birthDate !== undefined) user.birthDate = req.body.birthDate;
        if (req.body.accountType !== undefined) user.accountType = req.body.accountType;
        if (req.body.gstNumber !== undefined) user.gstNumber = req.body.gstNumber;
        
        if (req.body.addresses) {
            user.addresses = req.body.addresses;
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            id: updatedUser.id,
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            gender: updatedUser.gender,
            birthDate: updatedUser.birthDate,
            addresses: updatedUser.addresses,
            accountType: updatedUser.accountType,
            gstNumber: updatedUser.gstNumber,
            role: updatedUser.email === 'admin@farmlyf.com' ? 'admin' : 'user'
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin only)
// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id }); 
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status; // 'Active' or 'Blocked'

    const query = {};
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    
    if (status === 'Active') {
        query.isBlocked = { $ne: true }; // undefined or false
    } else if (status === 'Blocked') {
        query.isBlocked = true;
    }

    const count = await User.countDocuments(query);
    const users = await User.find(query)
        .limit(limit)
        .skip(limit * (page - 1))
        .sort({ createdAt: -1 });

    res.json({
        users,
        page,
        pages: Math.ceil(count / limit),
        total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ban/Unban user
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
export const toggleBanUser = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id }); 
        if (user) {
            user.isBanned = !user.isBanned;
            await user.save();
            res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}`, isBanned: user.isBanned });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update FCM token for push notifications
// @route   PUT /api/users/fcm-token
// @access  Private
export const updateFcmToken = asyncHandler(async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        res.status(400);
        throw new Error('FCM token is required');
    }

    // Skip FCM token storage for backdoor admin (they send notifications, not receive)
    if (req.user.id === 'admin_01') {
        return res.json({ message: 'Admin FCM token acknowledged (not stored)' });
    }

    const user = await User.findOne({ id: req.user.id });

    if (user) {
        user.fcmToken = token;
        await user.save();
        res.json({ message: 'FCM token updated successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @desc    Send OTP for login
 * @route   POST /api/users/send-otp-login
 * @access  Public
 */
export const sendOtpForLogin = asyncHandler(async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        res.status(400);
        throw new Error('Please provide a mobile number');
    }

    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    const result = await sendOTP(normalizedPhone, 'Customer');
    res.json(result);
});

/**
 * @desc    Verify OTP for login
 * @route   POST /api/users/verify-otp-login
 * @access  Public
 */
export const verifyOtpForLogin = asyncHandler(async (req, res) => {
    const { phone, otp, name, email, accountType, gstNumber } = req.body;

    if (!phone || !otp) {
        res.status(400);
        throw new Error('Please provide phone and OTP');
    }

    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);

    // First, check if user exists to decide whether to delete OTP on success
    let user = await User.findOne({ phone: normalizedPhone });
    const deleteOnSuccess = !!user || (!!name && !!email);

    const isValid = await verifyOTP(normalizedPhone, otp, 'Customer', deleteOnSuccess);

    if (!isValid) {
        res.status(401);
        throw new Error('Invalid or expired OTP');
    }

    if (!user) {
        // If user doesn't exist and name/email are not provided, signal that it's a new user
        if (!name || !email) {
            return res.json({ isNewUser: true, phone });
        }

        // Check if email is already taken by another account (without this phone)
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            res.status(400);
            throw new Error('Email is already registered with another account');
        }

        // Create new user
        user = await User.create({
            id: 'user_' + Date.now(),
            name,
            email,
            phone: normalizedPhone,
            accountType: accountType || 'Individual',
            gstNumber: gstNumber || undefined,
            addresses: [],
            wishlist: [],
            usedCoupons: []
        });
    }

    if (user && user.isBanned) {
        res.status(401);
        throw new Error('Your account has been banned');
    }

    // Login successful
    const token = generateToken(user.id);
    res.cookie('jwt', token, getJwtCookieOptions());

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        accountType: user.accountType,
        role: user.email === 'admin@farmlyf.com' ? 'admin' : 'user',
        token
    });
});
