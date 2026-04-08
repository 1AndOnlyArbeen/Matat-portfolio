import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Hero } from "../models/hero.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  const { title, subtitle, buttonText } = req.body;

  if (!title || !subtitle || !buttonText) {
    throw new apiError(400, " All the field are required");
  }
  // for image handeling

  const backgroundImagePath = req.file?.path;
  if (!backgroundImagePath) {
    throw new apiError(400, "invalid background image ");
  }
  const backgroundImage = await uploadOnCloudinary(backgroundImagePath);
  console.log("uplaod backgroundImage result : ", backgroundImage);
  if (!backgroundImage) {
    throw new apiError(400, " backgroundImageFailed");
  }

  //create the object and save into the db .

  const heroDetails = await Hero.create({
    title,
    subtitle,
    buttonText,
    backgroundImage: backgroundImage.url,
  });

  if (!heroDetails) {
    throw new apiError(
      500,
      "something went wrong while creating creating the heroBanner fields!",
    );
  }
  return res
    .status(201)
    .json(new apiResponse(201, " hero added and created successfully "));
});

// fetch the hero banner and give to router so the frontend can call it and save
const getAllHero = asyncHandler(async (req, res) => {
  const hero = await Hero.find();
  if (!hero) {
    throw new apiError(404, " Hero Banner detials didint found ");
  }
  console.debug('----------------------sanoke',hero)
  return res
    .status(200)
    .json(new apiResponse(200, " Hero Banner fethced successfully ",hero));
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
      new apiResponse(200, " Active Hero Banner detils fetched successfully !"),
    );
});

// toggle the active user into inactive and incative into the active

const toggleHeroDetail = asyncHandler(async (req, res) => {
  const hero = await Hero.findbyId(req.param.id);
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
  .json((new apiResponse(200, " Hero banner status update successfull ")))

});

//delete hero 

const deleteHero = asyncHandler(async(req,res)=>{
    const hero = await Hero.findByIdAndDelete(req.param.id)
    if (!hero) {
        throw new apiError(404, " Banner didit Exist ")
        
    }
    return res
    .status(200)
    .json((new apiResponse(200, " Banner deleted successfully")))
    
})

export {createHero,getAllHero,getActiveHero,toggleHeroDetail,deleteHero}

