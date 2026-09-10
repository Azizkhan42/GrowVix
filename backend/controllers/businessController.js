import BusinessProfile from '../models/BusinessProfile.js';

export const getBusinessProfile = async (req, res) => {
  try {
    let profile = await BusinessProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = await BusinessProfile.create({ userId: req.user.id });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBusinessProfile = async (req, res) => {
  try {
    const { businessName, industry, location, website, description, targetAudience, brandTone, goals } = req.body;

    let profile = await BusinessProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = await BusinessProfile.create({ userId: req.user.id });
    }

    if (businessName !== undefined) profile.businessName = businessName;
    if (industry !== undefined) profile.industry = industry;
    if (location !== undefined) profile.location = location;
    if (website !== undefined) profile.website = website;
    if (description !== undefined) profile.description = description;
    if (targetAudience !== undefined) profile.targetAudience = targetAudience;
    if (brandTone !== undefined) profile.brandTone = brandTone;
    if (goals !== undefined) profile.goals = goals;

    profile.updatedAt = new Date();
    await profile.save();

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
