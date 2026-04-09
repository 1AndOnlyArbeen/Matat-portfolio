import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Hero } from "../models/hero.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

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
  const { title, subtitle, buttonText, buttonLink } = req.body;

  if (!title || !subtitle || !buttonText || !buttonLink) {
    throw new apiError(400, "All fields are required");
  }

  const backgroundImagePath = req.file?.path;
  if (!backgroundImagePath) {
    throw new apiError(400, "Background image is required");
  }
  const backgroundImage = await uploadOnCloudinary(backgroundImagePath);
  if (!backgroundImage) {
    throw new apiError(400, "Background image upload failed");
  }

  let heroDetails;
  try {
    heroDetails = await Hero.create({
      title,
      subtitle,
      buttonText,
      buttonLink,
      backgroundImage: backgroundImage.url,
    });
  } catch (err) {
    // cleanup cloudinary image if db save fails
    const publicId = backgroundImage.public_id;
    if (publicId) await deleteFromCloudinary(publicId);
    throw new apiError(500, "Failed to create hero banner");
  }

  return res
    .status(201)
    .json(new apiResponse(201, heroDetails, "Hero banner created successfully"));
});

// fetch the hero banner and give to router so the frontend can call it and save with the proper pagination 
const getAllHero = asyncHandler(async (req, res) => {                                                                                                    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) ||7;
    const hasLimit = limit > 0;
    const skip = hasLimit ? (page - 1) * limit : 0;

    let query = Hero.find().sort({ createdAt: -1 });
    if (hasLimit) {
      query = query.skip(skip).limit(limit);
    }
    const heroes = await query;
    const total = await Hero.countDocuments();

    return res.status(200).json(
      new apiResponse(200, {
        heroes,
        pagination: {
          currentPage: hasLimit ? page : 1,
          totalPages: hasLimit ? Math.ceil(total / limit) : 1,
          totalItems: total,
          limit: hasLimit ? limit : total,
        },
      }, "Hero Banners fetched successfully")               
    );
  });
 

// get the active data of the hero banner
const getActiveHero = asyncHandler(async (req, res) => {
  const activeHero = await Hero.findOne({ isActive: true });
  if (!activeHero) {
    throw new apiError(
      404,
      " Hero Banner which status is active didint found  ",
    );
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, activeHero, "Active hero banner fetched successfully"),
    );
});

// toggle the active user into inactive and incative into the active

const toggleHeroDetail = asyncHandler(async (req, res) => {
  const hero = await Hero.findById(req.params.id);
  if (!hero) throw new apiError(400, "Banner not found !");

  // chek is the banner on ?
  if (hero.isActive) {
    // if on then make it off 

    hero.isActive = false 
    await hero.save()
    
    
  } else {
    // if off then first turn off every banner in db 
    await Hero.updateMany({},{isActive:false})
    // then trun on only this one 
    hero.isActive = true
    await hero.save()
    
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, hero, " Hero banner status update successfull "),
    );
});

//editing th hero banner and details after the upload:

const editHeroDetails = asyncHandler(async (req, res) => {
  const { title, subtitle, buttonText, buttonLink } = req.body;
  if (!title || !subtitle || !buttonText || !buttonLink) {
    throw new apiError(400, " all field are required ");
  }
  const hero = await Hero.findById(req.params.id);

  if (!hero) {
    throw new apiError(404, " banner didint exits");
  }
  hero.title = title || hero.title;
  hero.subtitle = subtitle || hero.subtitle;
  hero.buttonText = buttonText || hero.buttonText;
  hero.buttonLink = buttonLink || hero.buttonLink;

  // if a new image was uploaded, replace the old one on cloudinary
  if (req.file) {
    // delete old image from cloudinary
    if (hero.backgroundImage) {
      const publicId = hero.backgroundImage.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }

    // upload the new image
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse) {
      throw new apiError(500, "Image upload failed");
    }
    hero.backgroundImage = cloudinaryResponse.secure_url;
  }

  await hero.save();
  return res
    .status(200)
    .json(new apiResponse(200, hero, "Details updated successfully"));
});

//delete hero


const deleteHero = asyncHandler(async (req, res) => {
  const hero = await Hero.findByIdAndDelete(req.params.id);
  if (!hero) {
    throw new apiError(404, " Banner didit Exist ");
  }
  return res
    .status(200)
    .json(new apiResponse(200, hero, " Banner deleted successfully"));
});

export {
  createHero,
  getAllHero,
  getActiveHero,
  toggleHeroDetail,
  deleteHero,
  editHeroDetails,
};
