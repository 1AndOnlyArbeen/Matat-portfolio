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
  const { appName, description, platform, link, rating, appNameHe, descriptionHe, platformHe } = req.body;

  if (!appName || !description || !platform || !link) {
    throw new apiError(400, ' All field are required !');
  }
  // for image

  const appIconPath = req.file?.path;
  if (!appIconPath) {
    throw new apiError(400, ' appIcon is required !');
  }
  const appIcon = await uploadOnCloudinary(appIconPath);

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
      appNameHe,
      descriptionHe,
      platformHe,
      rating: rating ? Number(rating) : 0,
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
  const { appName, description, platform, link, rating, appNameHe, descriptionHe, platformHe } = req.body;
  const apps = await App.findById(req.params.id);
  if (!apps) {
    throw new apiError(404, ' AppsDetails didint exits into db');
  }
  apps.appName = appName || apps.appName;
  apps.description = description || apps.description;
  apps.platform = platform || apps.platform;
  apps.link = link || apps.link;
  if (rating !== undefined) apps.rating = Number(rating);
  if (appNameHe !== undefined) apps.appNameHe = appNameHe;
  if (descriptionHe !== undefined) apps.descriptionHe = descriptionHe;
  if (platformHe !== undefined) apps.platformHe = platformHe;

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
  // cleanup extra screenshots from cloudinary too
  for (const s of app.screenshots || []) {
    if (s.publicId) await deleteFromCloudinary(s.publicId);
  }
  return res
    .status(200)
    .json(new apiResponse(200, app, 'Apps details deleted successfully '));
});

{
  /*
    screenshot helpers for apps — separate endpoints so the main create/edit stays clean

    1. addAppScreenshots     → append new screenshots to an existing app
    2. replaceAppScreenshots → wipe old ones and upload fresh
    3. removeAppScreenshot   → delete one screenshot by its publicId
    4. getAppScreenshots     → return just the screenshots array (public read)

    all use upload.array('screenshots', 8) on the route → req.files is an array
  */
}

// append new screenshots — keeps the old ones
const addAppScreenshots = asyncHandler(async (req, res) => {
  const app = await App.findById(req.params.id);
  if (!app) {
    throw new apiError(404, ' AppDetails didnt exits in the db');
  }

  const files = req.files || [];
  if (files.length === 0) {
    throw new apiError(400, ' No screenshot files uploaded ');
  }

  const uploaded = await Promise.all(
    files.map((f) => uploadOnCloudinary(f.path)),
  );
  const newShots = uploaded
    .filter(Boolean)
    .map((r) => ({ url: r.secure_url, publicId: r.public_id }));

  app.screenshots = [...(app.screenshots || []), ...newShots];
  await app.save();

  return res
    .status(200)
    .json(new apiResponse(200, app, ' Screenshots added successfully !'));
});

// replace the whole screenshots array
const replaceAppScreenshots = asyncHandler(async (req, res) => {
  const app = await App.findById(req.params.id);
  if (!app) {
    throw new apiError(404, ' AppDetails didnt exits in the db');
  }

  const files = req.files || [];
  if (files.length === 0) {
    throw new apiError(400, ' No screenshot files uploaded ');
  }

  // delete old ones from cloudinary
  for (const s of app.screenshots || []) {
    if (s.publicId) await deleteFromCloudinary(s.publicId);
  }

  // upload fresh ones
  const uploaded = await Promise.all(
    files.map((f) => uploadOnCloudinary(f.path)),
  );
  app.screenshots = uploaded
    .filter(Boolean)
    .map((r) => ({ url: r.secure_url, publicId: r.public_id }));

  await app.save();

  return res
    .status(200)
    .json(new apiResponse(200, app, ' Screenshots replaced successfully !'));
});

// delete one screenshot by its publicId
const removeAppScreenshot = asyncHandler(async (req, res) => {
  const { id, publicId } = req.params;
  const app = await App.findById(id);
  if (!app) {
    throw new apiError(404, ' AppDetails didnt exits in the db');
  }

  const found = app.screenshots?.find((s) => s.publicId === publicId);
  if (!found) {
    throw new apiError(404, ' Screenshot not found in this app ');
  }

  await deleteFromCloudinary(publicId);
  app.screenshots = app.screenshots.filter((s) => s.publicId !== publicId);
  await app.save();

  return res
    .status(200)
    .json(new apiResponse(200, app, ' Screenshot removed successfully !'));
});

// return just the screenshots for an app (public read)
const getAppScreenshots = asyncHandler(async (req, res) => {
  const app = await App.findById(req.params.id).select('screenshots');
  if (!app) {
    throw new apiError(404, ' AppDetails didnt exits in the db');
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { screenshots: app.screenshots || [] },
        ' Screenshots fetched successfully',
      ),
    );
});

export {
  createApp,
  getAllApp,
  editApp,
  deleteApp,
  addAppScreenshots,
  replaceAppScreenshots,
  removeAppScreenshot,
  getAppScreenshots,
};
