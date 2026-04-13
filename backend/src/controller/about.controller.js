import { About } from '../models/about.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';

{
  /*
    title, description, mission, stats[{ value, label, order }]

    1. get title from admin, if didint input throw error
    2. get description from admin, if didint input throw error
    3. get mission from admin, same
    4. stats come as an array of objects, clean empty rows and assign order
  */
}

// small helper to clean incoming stats — drops empty rows, trims fields, adds order by position
const cleanStats = (stats) => {
  if (!Array.isArray(stats)) return [];
  return stats
    .filter((s) => (s?.value || '').trim() || (s?.label || '').trim())
    .map((s, i) => ({
      value: (s.value || '').trim(),
      label: (s.label || '').trim(),
      order: typeof s?.order === 'number' ? s.order : i + 1,
    }));
};

// create the about and save in the db
const createAbout = asyncHandler(async (req, res) => {
  const { title, description, mission, stats } = req.body;

  if (!title || !description || !mission) {
    throw new apiError(400, 'All fields are required');
  }

  const cleanedStats = cleanStats(stats);

  let about;
  try {
    about = await About.create({
      title,
      description,
      mission,
      stats: cleanedStats,
    });
  } catch (err) {
    throw new apiError(500, 'Failed to create about');
  }

  return res
    .status(201)
    .json(new apiResponse(201, about, 'About created successfully'));
});

// fetch all about docs for admin pannel with proper pagination
const getAllAbout = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 14;
  const hasLimit = limit > 0;
  const skip = hasLimit ? (page - 1) * limit : 0;

  let query = About.find().sort({ createdAt: -1 });
  if (hasLimit) {
    query = query.skip(skip).limit(limit);
  }
  const abouts = await query;
  const total = await About.countDocuments();

  return res.status(200).json(
    new apiResponse(
      200,
      {
        abouts,
        pagination: {
          currentPage: hasLimit ? page : 1,
          totalPages: hasLimit ? Math.ceil(total / limit) : 1,
          totalItems: total,
          limit: hasLimit ? limit : total,
        },
      },
      'About list fetched successfully',
    ),
  );
});

// get a single about — used by the public site (returns the latest one)
const getAbout = asyncHandler(async (req, res) => {
  const about = await About.findOne().sort({ createdAt: -1 });
  if (!about) {
    throw new apiError(404, 'About didint exits');
  }
  return res
    .status(200)
    .json(new apiResponse(200, about, 'About fetched successfully'));
});

// editing the about details after the save
const editAbout = asyncHandler(async (req, res) => {
  const { title, description, mission, stats } = req.body;

  const about = await About.findById(req.params.id);
  if (!about) {
    throw new apiError(404, 'About didint exits');
  }

  about.title = title || about.title;
  about.description = description || about.description;
  about.mission = mission || about.mission;

  // stats is a full replace — if admin sent stats, replace the array;
  // if stats is undefined (not sent), keep what was there
  if (stats !== undefined) {
    about.stats = cleanStats(stats);
  }

  await about.save();

  return res
    .status(200)
    .json(new apiResponse(200, about, 'About updated successfully'));
});

// delete about
const deleteAbout = asyncHandler(async (req, res) => {
  const about = await About.findByIdAndDelete(req.params.id);
  if (!about) {
    throw new apiError(404, 'About didint exits');
  }
  return res
    .status(200)
    .json(new apiResponse(200, about, 'About deleted successfully'));
});

export { createAbout, getAllAbout, getAbout, editAbout, deleteAbout };
