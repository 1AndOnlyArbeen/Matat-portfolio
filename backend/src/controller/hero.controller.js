import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Hero } from '../models/hero.model.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';

{
  /*
    title, subtitile, button text, button link, ncakground image url    

    1. get the title from the admin , if didit inpur throw error
    2. get the subtitle from the admin, if didint input then throw error
    3. button text too same, 
    4, background image (upload the image in the cloudinarry )
    
*/
}

// create the hero and save in the db
const createHero = asyncHandler(async (req, res) => {
  const { title, subtitle, buttonText, buttonLink, titleHe, subtitleHe, buttonTextHe } = req.body;

  if (!title || !subtitle || !buttonText || !buttonLink) {
    throw new apiError(400, 'All fields are required');
  }

  // pull each image file out of req.files (upload.fields returns an object keyed by field name)
  const backgroundImagePath = req.files?.backgroundImage?.[0]?.path;
  const badgeImage1Path = req.files?.badgeImage1?.[0]?.path;
  const badgeImage2Path = req.files?.badgeImage2?.[0]?.path;

  if (!backgroundImagePath) {
    throw new apiError(400, 'Background image is required');
  }
  const backgroundImage = await uploadOnCloudinary(backgroundImagePath);
  if (!backgroundImage) {
    throw new apiError(400, 'Background image upload failed');
  }

  // optional badges
  const badgeImage1 = badgeImage1Path ? await uploadOnCloudinary(badgeImage1Path) : null;
  const badgeImage2 = badgeImage2Path ? await uploadOnCloudinary(badgeImage2Path) : null;

  let heroDetails;
  try {
    heroDetails = await Hero.create({
      title,
      subtitle,
      buttonText,
      buttonLink,
      titleHe,
      subtitleHe,
      buttonTextHe,
      backgroundImage: backgroundImage.url,
      badgeImage1: badgeImage1?.url || '',
      badgeImage2: badgeImage2?.url || '',
    });
  } catch (err) {
    // cleanup cloudinary uploads if db save fails
    if (backgroundImage.public_id) await deleteFromCloudinary(backgroundImage.public_id);
    if (badgeImage1?.public_id) await deleteFromCloudinary(badgeImage1.public_id);
    if (badgeImage2?.public_id) await deleteFromCloudinary(badgeImage2.public_id);
    throw new apiError(500, 'Failed to create heroDetails');
  }

  return res
    .status(201)
    .json(
      new apiResponse(201, heroDetails, 'Hero banner created successfully'),
    );
});

// fetch the hero banner and give to router so the frontend can call it and save with the proper pagination
const getAllHero = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;
  const hasLimit = limit > 0;
  const skip = hasLimit ? (page - 1) * limit : 0;

  let query = Hero.find().sort({ createdAt: -1 });
  if (hasLimit) {
    query = query.skip(skip).limit(limit);
  }
  const heroes = await query;
  const total = await Hero.countDocuments();

  return res.status(200).json(
    new apiResponse(
      200,
      {
        heroes,
        pagination: {
          currentPage: hasLimit ? page : 1,
          totalPages: hasLimit ? Math.ceil(total / limit) : 1,
          totalItems: total,
          limit: hasLimit ? limit : total,
        },
      },
      'Hero Banners fetched successfully',
    ),
  );
});

// get the active data of the hero banner
const getActiveHero = asyncHandler(async (req, res) => {
  const activeHero = await Hero.findOne({ isActive: true });
  if (!activeHero) {
    throw new apiError(
      404,
      ' Hero Banner which status is active didint found  ',
    );
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        activeHero,
        'Active hero banner fetched successfully',
      ),
    );
});

// toggle the active user into inactive and incative into the active

const toggleHeroDetail = asyncHandler(async (req, res) => {
  const hero = await Hero.findById(req.params.id);
  if (!hero) throw new apiError(400, 'Banner not found !');

  // chek is the banner on ?
  if (hero.isActive) {
    // if on then make it off

    hero.isActive = false;
    await hero.save();
  } else {
    // if off then first turn off every banner in db
    await Hero.updateMany({}, { isActive: false });
    // then trun on only this one
    hero.isActive = true;
    await hero.save();
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, hero, ' Hero banner status update successfull '),
    );
});

//editing th hero banner and details after the upload:

const editHeroDetails = asyncHandler(async (req, res) => {
  const { title, subtitle, buttonText, buttonLink, titleHe, subtitleHe, buttonTextHe } = req.body;

  const hero = await Hero.findById(req.params.id);

  if (!hero) {
    throw new apiError(404, ' banner didint exits');
  }
  hero.title = title || hero.title;
  hero.subtitle = subtitle || hero.subtitle;
  hero.buttonText = buttonText || hero.buttonText;
  hero.buttonLink = buttonLink || hero.buttonLink;
  if (titleHe !== undefined) hero.titleHe = titleHe;
  if (subtitleHe !== undefined) hero.subtitleHe = subtitleHe;
  if (buttonTextHe !== undefined) hero.buttonTextHe = buttonTextHe;

  // helper: replace an image field if a new file was uploaded
  const replaceImage = async (fileField, currentUrl) => {
    const newFile = req.files?.[fileField]?.[0];
    if (!newFile) return currentUrl;
    if (currentUrl) {
      const publicId = currentUrl.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId);
    }
    const uploaded = await uploadOnCloudinary(newFile.path);
    if (!uploaded) throw new apiError(500, `${fileField} upload failed`);
    return uploaded.secure_url || uploaded.url;
  };

  hero.backgroundImage = await replaceImage('backgroundImage', hero.backgroundImage);
  hero.badgeImage1 = await replaceImage('badgeImage1', hero.badgeImage1);
  hero.badgeImage2 = await replaceImage('badgeImage2', hero.badgeImage2);

  await hero.save();
  return res
    .status(200)
    .json(new apiResponse(200, hero, 'Details updated successfully'));
});

//delete hero

const deleteHero = asyncHandler(async (req, res) => {
  const hero = await Hero.findByIdAndDelete(req.params.id);
  if (!hero) {
    throw new apiError(404, ' Banner didit Exist ');
  }
  return res
    .status(200)
    .json(new apiResponse(200, hero, ' Banner deleted successfully'));
});

export {
  createHero,
  getAllHero,
  getActiveHero,
  toggleHeroDetail,
  deleteHero,
  editHeroDetails,
};
