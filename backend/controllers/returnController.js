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


// @desc    Update return status
// @route   PUT /api/returns/:id
// @access  Private/Admin
export const updateReturn = async (req, res) => {
  try {
    const { status } = req.body;
    const returnReq = await Return.findById(req.params.id);

    if (returnReq) {
      returnReq.status = status;
      const updatedReturn = await returnReq.save();
      res.json(updatedReturn);
    } else {
      res.status(404).json({ message: 'Return request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
