import Return from '../models/Return.js';

export const getReturns = async (req, res) => {
  try {
    const returns = await Return.find();
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReturn = async (req, res) => {
  try {
    const newReturn = new Return(req.body);
    const savedReturn = await newReturn.save();
    res.status(201).json(savedReturn);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

