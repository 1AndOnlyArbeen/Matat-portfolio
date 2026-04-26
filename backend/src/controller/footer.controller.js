import { Footer } from '../models/footer.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';

// public — return footer (auto-create with defaults if none)
const getFooter = asyncHandler(async (_req, res) => {
  let footer = await Footer.findOne();
  if (!footer) footer = await Footer.create({});
  return res.status(200).json(new apiResponse(200, footer, 'Footer fetched'));
});

// admin — upsert footer fields
const updateFooter = asyncHandler(async (req, res) => {
  const {
    tagline, taglineHe, email, phone,
    location, locationHe, copyright, copyrightHe,
    githubUrl, linkedinUrl, twitterUrl,
    facebookUrl, instagramUrl, tiktokUrl,
  } = req.body;

  let footer = await Footer.findOne();
  if (!footer) {
    footer = await Footer.create(req.body);
  } else {
    if (tagline !== undefined) footer.tagline = tagline;
    if (taglineHe !== undefined) footer.taglineHe = taglineHe;
    if (email !== undefined) footer.email = email;
    if (phone !== undefined) footer.phone = phone;
    if (location !== undefined) footer.location = location;
    if (locationHe !== undefined) footer.locationHe = locationHe;
    if (copyright !== undefined) footer.copyright = copyright;
    if (copyrightHe !== undefined) footer.copyrightHe = copyrightHe;
    if (githubUrl !== undefined) footer.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) footer.linkedinUrl = linkedinUrl;
    if (twitterUrl !== undefined) footer.twitterUrl = twitterUrl;
    if (facebookUrl !== undefined) footer.facebookUrl = facebookUrl;
    if (instagramUrl !== undefined) footer.instagramUrl = instagramUrl;
    if (tiktokUrl !== undefined) footer.tiktokUrl = tiktokUrl;
    await footer.save();
  }
  return res.status(200).json(new apiResponse(200, footer, 'Footer updated'));
});

export { getFooter, updateFooter };
