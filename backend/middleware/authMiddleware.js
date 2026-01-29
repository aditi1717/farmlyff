import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      
      if (decoded.id === 'admin_01') {
          req.user = {
              _id: 'admin_01',
              id: 'admin_01',
              name: 'Super Admin',
              email: 'admin@farmlyf.com',
              role: 'admin'
          };
      } else {
          req.user = await User.findOne({ id: decoded.id }).select('-password');
      }
      
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else if (req.user && req.user.email === 'admin@farmlyf.com') {
    // Handling the backdoor admin for now
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};
