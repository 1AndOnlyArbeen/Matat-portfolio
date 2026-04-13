import { Gallery } from '../models/gallery.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

{
  /*
    caption, place, date, thumbnail (cover), images[] (album contents up to 12)

    1. createGallery     → make a new album (caption + place + date + thumbnail + optional images)
    2. getAllGallery     → admin paginated list
    3. getGallery        → public read all (no auth)
    4. editGallery       → update fields + optionally swap thumbnail
    5. deleteGallery     → remove album + cleanup cloudinary thumbnail and all images

    image-only helpers (separate functions, same controller):
    6. addGalleryImages     → append images to album
    7. replaceGalleryImages → wipe old and upload fresh
    8. removeGalleryImage   → delete one image by its publicId
    9. getGalleryImagesById → return only the images array of one album

    multer setup on routes:
      createGallery  →  upload.fields([thumbnail, images])
      editGallery    →  upload.single('thumbnail')   (just for swapping cover)
      add/replace    →  upload.array('images', 12)
  */
}

// create a new gallery album — thumbnail is the cover, images are the inside photos
const createGallery = asyncHandler(async (req, res) => {
  const { caption, place, date } = req.body;

  if (!caption) {
    throw new apiError(400, ' Caption is required ');
  }

  // pull files from upload.fields — thumbnail (single) + images (multi)
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;
  const imageFiles = req.files?.images || [];

  // upload thumbnail (optional but recommended — fall back to first image if missing)
  let thumbnail = null;
  if (thumbnailPath) {
    thumbnail = await uploadOnCloudinary(thumbnailPath);
    if (!thumbnail) throw new apiError(500, ' thumbnail upload failed ');
  }

  // upload all album images in parallel
  const uploaded = await Promise.all(
    imageFiles.map((f) => uploadOnCloudinary(f.path)),
  );
  const images = uploaded
    .filter(Boolean)
    .map((r) => ({ url: r.secure_url, publicId: r.public_id }));

  // if no thumbnail was uploaded, use the first album image as the cover
  const finalThumbnail = thumbnail
    ? { url: thumbnail.secure_url, publicId: thumbnail.public_id }
    : images[0]
    ? { url: images[0].url, publicId: '' } // empty publicId so we don't double-delete on cleanup
    : { url: '', publicId: '' };

  let albumDetails;
  try {
    albumDetails = await Gallery.create({
      caption,
      place,
      date: date || undefined,
      thumbnail: finalThumbnail.url,
      thumbnailId: finalThumbnail.publicId,
      images,
    });
  } catch (err) {
    // cleanup everything if db save fails
    if (thumbnail?.public_id) await deleteFromCloudinary(thumbnail.public_id);
    for (const i of images) {
      if (i.publicId) await deleteFromCloudinary(i.publicId);
    }
    throw new apiError(500, ' Failed to create gallery album ');
  }

  return res
    .status(201)
    .json(new apiResponse(201, albumDetails, ' Gallery album created successfully !'));
});

// admin list — paginated
const getAllGallery = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 14;
  const hasLimit = limit > 0;
  const skip = hasLimit ? (page - 1) * limit : 0;

  let query = Gallery.find().sort({ createdAt: -1 });
  if (hasLimit) query = query.skip(skip).limit(limit);
  const albums = await query;
  const total = await Gallery.countDocuments();

  return res.status(200).json(
    new apiResponse(
      200,
      {
        albums,
        pagination: {
          currentPage: hasLimit ? page : 1,
          totalPages: hasLimit ? Math.ceil(total / limit) : 1,
          totalItems: total,
          limit: hasLimit ? limit : total,
        },
      },
      ' Gallery list fetched successfully ',
    ),
  );
});

// public list — return everything for the public site (no pagination)
const getGallery = asyncHandler(async (req, res) => {
  const albums = await Gallery.find().sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new apiResponse(200, albums, ' Gallery fetched successfully '));
});

// edit a gallery album — text fields + optionally swap the thumbnail
const editGallery = asyncHandler(async (req, res) => {
  const { caption, place, date } = req.body;

  const album = await Gallery.findById(req.params.id);
  if (!album) throw new apiError(404, ' Gallery album didint exits ');

  if (caption !== undefined) album.caption = caption;
  if (place !== undefined) album.place = place;
  if (date !== undefined) album.date = date || undefined;

  // if a new thumbnail was uploaded, replace the old one in cloudinary
  if (req.file) {
    if (album.thumbnailId) {
      await deleteFromCloudinary(album.thumbnailId);
    }
    const uploaded = await uploadOnCloudinary(req.file.path);
    if (!uploaded) throw new apiError(500, ' Thumbnail upload failed ');
    album.thumbnail = uploaded.secure_url;
    album.thumbnailId = uploaded.public_id;
  }

  await album.save();
  return res
    .status(200)
    .json(new apiResponse(200, album, ' Gallery album updated successfully !'));
});

// delete a gallery album + cleanup all its cloudinary assets
const deleteGallery = asyncHandler(async (req, res) => {
  const album = await Gallery.findByIdAndDelete(req.params.id);
  if (!album) throw new apiError(404, ' Gallery album didint exits ');

  if (album.thumbnailId) await deleteFromCloudinary(album.thumbnailId);
  for (const i of album.images || []) {
    if (i.publicId) await deleteFromCloudinary(i.publicId);
  }

  return res
    .status(200)
    .json(new apiResponse(200, album, ' Gallery album deleted successfully '));
});

// ----- separate image helpers (album content, up to 12) -----

// append new images to an existing album — keeps the old ones
const addGalleryImages = asyncHandler(async (req, res) => {
  const album = await Gallery.findById(req.params.id);
  if (!album) throw new apiError(404, ' Gallery album didint exits ');

  const files = req.files || [];
  if (files.length === 0) throw new apiError(400, ' No image files uploaded ');

  const uploaded = await Promise.all(
    files.map((f) => uploadOnCloudinary(f.path)),
  );
  const newImgs = uploaded
    .filter(Boolean)
    .map((r) => ({ url: r.secure_url, publicId: r.public_id }));

  album.images = [...(album.images || []), ...newImgs];
  await album.save();

  return res
    .status(200)
    .json(new apiResponse(200, album, ' Gallery images added successfully !'));
});

// replace the whole images array — old ones get wiped from cloudinary
const replaceGalleryImages = asyncHandler(async (req, res) => {
  const album = await Gallery.findById(req.params.id);
  if (!album) throw new apiError(404, ' Gallery album didint exits ');

  const files = req.files || [];
  if (files.length === 0) throw new apiError(400, ' No image files uploaded ');

  // delete old ones from cloudinary
  for (const i of album.images || []) {
    if (i.publicId) await deleteFromCloudinary(i.publicId);
  }

  // upload fresh
  const uploaded = await Promise.all(
    files.map((f) => uploadOnCloudinary(f.path)),
  );
  album.images = uploaded
    .filter(Boolean)
    .map((r) => ({ url: r.secure_url, publicId: r.public_id }));

  await album.save();

  return res
    .status(200)
    .json(new apiResponse(200, album, ' Gallery images replaced successfully !'));
});

// delete one image by its publicId
const removeGalleryImage = asyncHandler(async (req, res) => {
  const { id, publicId } = req.params;
  const album = await Gallery.findById(id);
  if (!album) throw new apiError(404, ' Gallery album didint exits ');

  const found = album.images?.find((i) => i.publicId === publicId);
  if (!found) throw new apiError(404, ' Image not found in this album ');

  await deleteFromCloudinary(publicId);
  album.images = album.images.filter((i) => i.publicId !== publicId);
  await album.save();

  return res
    .status(200)
    .json(new apiResponse(200, album, ' Gallery image removed successfully !'));
});

// return just the images for one album (public read)
const getGalleryImagesById = asyncHandler(async (req, res) => {
  const album = await Gallery.findById(req.params.id).select('images');
  if (!album) throw new apiError(404, ' Gallery album didint exits ');

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { images: album.images || [] },
        ' Gallery images fetched successfully ',
      ),
    );
});

export {
  createGallery,
  getAllGallery,
  getGallery,
  editGallery,
  deleteGallery,
  addGalleryImages,
  replaceGalleryImages,
  removeGalleryImage,
  getGalleryImagesById,
};
