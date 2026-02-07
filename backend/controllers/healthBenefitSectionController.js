import HealthBenefitSection from '../models/HealthBenefitSection.js';
import fs from 'fs';
import path from 'path';

const logToFile = (data) => {
  const logPath = './api-debug.log';
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${JSON.stringify(data, null, 2)}\n`);
};

export const getHealthBenefitSection = async (req, res) => {
  try {
    const section = await HealthBenefitSection.findOne({ isActive: true });
    res.json(section || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHealthBenefitSection = async (req, res) => {
  try {
    logToFile({ context: 'updateHealthBenefitSection', body: req.body });
    console.log('Update Health Benefit Section called with:', JSON.stringify(req.body, null, 2));

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Explicitly handle benefits array to ensure it's marked as modified
    const section = await HealthBenefitSection.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );
    
    console.log('Successfully saved section:', section._id);
    res.json(section);
  } catch (error) {
    console.error('Update Error:', error);
    res.status(400).json({ message: error.message });
  }
};
