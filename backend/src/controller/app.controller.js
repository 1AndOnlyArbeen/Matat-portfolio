import { App } from '../models/app.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';

// making the app

const createApp = asyncHandler(async (req, res) => {
  const { appName, description, platform, link } = req.body;

  if (!appName || !description || !platform || !link) {
    throw new apiError(400, ' All field are required !');
  }
  // for image

  const appIconPath = req.file?.path;
  if (!appIconPath) {
    throw new apiError(400, ' appIcon is required !');
  }
  const appIcon = await uploadOnCloudinary(appIconPath);
  console.log(appIcon);

  if (!appIcon) {
    throw new apiError(400, ' image upload failed to cloduinary');
  }

  let appDetails;

  try {
    appDetails = await App.create({
      appName,
      description,
      platform,
      link,
      appIcon: appIcon.secure_url,
      appIconId: appIcon.public_id,
    });
  } catch (error) {
    // delete the failed image from the cloudinary

    if (appIcon.public_id) await deleteFromCloudinary(appIcon.public_id);
    throw new apiError(500, ' Failed to create App');
  }
  return res
    .status(201)
    .json(
      new apiResponse(
        201,
        appDetails,
        ' AppDetails Created to db successfully !',
      ),
    );
});

// fetch the hero banner and give to router so the frontend can call it and save with the proper pagination
const getAllApp = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;
  const hasLimit = limit > 0;
  const skip = hasLimit ? (page - 1) * limit : 0;

  let query = App.find().sort({ createdAt: -1 });
  if (hasLimit) {
    query = query.skip(skip).limit(limit);
  }
  const apps = await query;
  const total = await App.countDocuments();

  return res.status(200).json(
    new apiResponse(
      200,
      {
        apps,
        pagination: {
          currentPage: hasLimit ? page : 1,
          totalPages: hasLimit ? Math.ceil(total / limit) : 1,
          totalItems: total,
          limit: hasLimit ? limit : total,
        },
      },
      'AppDEtails fetched successfully',
    ),
  );
});

//   edit the apps details

const editApp = asyncHandler(async (req, res) => {
  const { appName, description, platform, link } = req.body;
  const apps = await App.findById(req.params.id);
  if (!apps) {
    throw new apiError(404, ' AppsDetails didint exits into db');
  }
  apps.appName = appName || apps.appName;
  apps.description = description || apps.description;
  apps.platform = platform || apps.platform;
  apps.link = link || apps.link;

  // if the new image is uplodaed then replace with old one first delete the old one
  // if the new one exits when the user hit another file or image then find the public id from the db and delet from the cloudinary using publicID:
  if (req.file) {
    // delete the olda image from the cloundiary
    if (apps.appIcon) {
      const publicId = apps.appIconId;
      await deleteFromCloudinary(publicId);
    }

    // upload the new image into the cloudinary and into the db after that

    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    console.log(cloudinaryResponse);

    if (!cloudinaryResponse) {
      throw new apiError(500, ' Failed while uplaoding image into cloudianary');
    }

    apps.appIcon = cloudinaryResponse.secure_url;
    apps.appIconId = cloudinaryResponse.public_id;
  }
  await apps.save();
  console.debug(apps);
  return res
    .status(200)
    .json(new apiResponse(200, apps, ' Updated sucessfully'));
});

// delete the entire

const deleteApp = asyncHandler(async (req, res) => {
  const app = await App.findByIdAndDelete(req.params.id);
  if (!app) {
    throw new apiError(404, ' AppDetails didnt exits in the db');
  }
  // delete the image also from the cloudianry

  if (app.appIconId) {
    await deleteFromCloudinary(app.appIconId);
  }
  return res
    .status(200)
    .json(new apiResponse(200, app, 'Apps details deleted successfully '));
});

export { createApp, getAllApp, editApp, deleteApp };
