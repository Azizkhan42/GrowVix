import ContentCalendar from '../models/ContentCalendar.js';

export const getLatestCalendar = async (req, res) => {
  try {
    const calendar = await ContentCalendar.findOne({ userId: req.user.id }).sort({ generatedAt: -1 });
    if (!calendar) return res.status(404).json({ message: 'No calendar found' });
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
