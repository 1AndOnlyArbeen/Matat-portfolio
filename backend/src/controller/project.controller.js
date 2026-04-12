import { Project } from '../models/project.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from '../utils/cloudinary.js';

{
  /*

i have to get the title, descritption, tag, project link , image 

i have to get it and save in db first , 
make the point that fetch the all saved one , with 5 pagination limit 
make edit , the all into db, 
delete it 

*/
}
//getting the form and saving into the db

const createProject = asyncHandler(async (req, res) => {
  const { title, description, tags, projectLink } = req.body;

  if (!title || !description || !tags || !projectLink) {
    throw new apiError(400, 'All fields are required !');
  }
  const projectImagePath = req.file?.path;
  if (!projectImagePath) {
    throw new apiError(400, ' Please image field is required');
  }
  const projectImage = await uploadOnCloudinary(projectImagePath);
  if (!projectImage) {
    throw new apiError(500, ' Failed while uploading image ');
  }

  let projectDetails;
  try {
    projectDetails = await Project.create({
      title,
      description,
      tags,
      projectLink,
      projectImage: projectImage.secure_url,
    });
  } catch (error) {
    //clean the cloudinary image if the upload is failed
    const publicId = projectImage.public_id;
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }
    throw new apiError(500, error, ' Failed to create project Details');
  }
  return res
    .status(201)
    .json(
      new apiResponse(
        201,
        projectDetails,
        ' ProjectDetails created Successfully ',
      ),
    );
});

// fetch and show them into list in frontend but in pagination
const getAllProject = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit);
  const hasLimit = limit > 0;
  const skip = hasLimit ? (page - 1) * limit : 0;

  let query = Project.find().sort({ createdAt: -1 });
  if (hasLimit) {
    query = query.skip(skip).limit(limit);
  }
  const project = await query;
  const total = await Project.countDocuments();
  return res.status(200).json(
    new apiResponse(
      200,
      {
        project,
        pagination: {
          currentPage: hasLimit ? page : 1,
          totalPage: hasLimit ? Math.ceil(total / limit) : 1,
          totalItems: total,
          limit: hasLimit ? limit : total,
        },
      },
      ' Project Details Fetched Successfully',
    ),
  );
});

// edit the file if admin edit it

const projectEdit = asyncHandler(async (req, res) => {
  const { title, description, tags, projectLink } = req.body;

  const project = await Project.findById(req.params.id);
  if (!project) {
    throw new apiError(404, ' Project didint exits ');
  }
  project.title = title || project.title;
  project.description = description || project.description;
  project.tags = tags || project.tags;
  project.projectLink = projectLink || project.projectLink;

  // if the new image is uploaded then replac the old one
  if (req.file) {
    if (project.projectImage) {
      const publicId = project.projectImage.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId);
    }

    // upload the new image
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse) {
      throw new apiError(500, 'image upload failed ');
    }
    project.projectImage = cloudinaryResponse.secure_url;
  }
  await project.save();

  return res
    .status(200)
    .json(
      new apiResponse(200, project, ' Project Details updated successfully !'),
    );
});

// delete the details if the admin hit the delete

const deleteProject = asyncHandler(async (req, res) => {
  const deletedProject = await Project.findByIdAndDelete(req.params.id);
  if (!deletedProject) {
    throw new apiError(404, ' project details didint exists ');
  }
  // also deleting from the cloudianry
  if (deletedProject.projectImage) {
    const publicId = deletedProject.projectImage.split('/').pop().split('.')[0];
    await deleteFromCloudinary(publicId);
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        deletedProject,
        ' ProjectDetails deleted Successfully ',
      ),
    );
});
export { createProject, getAllProject, projectEdit, deleteProject };
