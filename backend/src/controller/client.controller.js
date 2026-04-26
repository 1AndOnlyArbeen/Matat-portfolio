import { Client } from '../models/client.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary.js';

const createClient = asyncHandler(async (req, res) => {
  const { clientName,heading,subtitle, clientNameHe, headingHe, subtitleHe} = req.body;
  if (!clientName || !heading || !subtitle) {
    throw new apiError(400, 'all field are required ');
  }
  const logoPath = req.file?.path;
  if (!logoPath) {
    throw new apiError(400, 'logo is required ');
  }
  const logo = await uploadOnCloudinary(logoPath);
  if (!logo) {
    throw new apiError(400, ' Logo upload Failed to cloudinary');
  }
  let clientDetails;
  try {
    clientDetails = await Client.create({
      clientName,
      heading,
      subtitle,
      clientNameHe,
      headingHe,
      subtitleHe,
      logo: logo.secure_url,
      logoId: logo.public_id,
    });
  } catch (error) {
    if (logo.public_id) {
      await deleteFromCloudinary(logo.public_id);
    }
    throw new apiError(500, 'Failed to create clientDetails ');
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        clientDetails,
        ' Client details created into db successfully',
      ),
    );
});

// fetch the clientDetails with pagination for the admin pannel

const getAllClient = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;
  const hasLimit = limit > 0;
  const skip = hasLimit ? (page - 1) * limit : 0;

  let query = Client.find().sort({ createdAt: -1 });
  if (hasLimit) {
    query = query.skip(skip).limit(limit);
  }
  const clients = await query;
  const total = await Client.countDocuments();

  return res.status(200).json(
    new apiResponse(
      200,
      {
        clients,
        pagination: {
          currentPage: hasLimit ? page : 1,
          totalPages: hasLimit ? Math.ceil(total / limit) : 1,
          totalItems: total,
          limit: hasLimit ? limit : total,
        },
      },
      'clientDetails fetched successfully',
    ),
  );
});

//editing the client details

const editClientDetails = asyncHandler(async (req, res) => {
  const { clientName,heading,subtitle, clientNameHe, headingHe, subtitleHe } = req.body;
  const client = await Client.findById(req.params.id);
  if (!client) {
    throw new apiError(404, ' Client didnt exits in db');
  }
  client.clientName = clientName || client.clientName;
  client.heading = heading || client.heading;
  client.subtitle = subtitle || client.subtitle;
  if (clientNameHe !== undefined) client.clientNameHe = clientNameHe;
  if (headingHe !== undefined) client.headingHe = headingHe;
  if (subtitleHe !== undefined) client.subtitleHe = subtitleHe;

  // if the new imag is being uplaod e dthen replace it and delete the old one

  if (req.file) {
    if (client.logoId) {
      await deleteFromCloudinary(client.logoId);
    }

    // now upload the new one into the cloudinaryu and update into the db

    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    console.log(cloudinaryResponse);
    if (!cloudinaryResponse) {
      throw new apiError(
        500,
        ' Failed while uplaoding image into cloudianary ',
      );
    }
    client.logo = cloudinaryResponse.secure_url;
    client.logoId = cloudinaryResponse.public_id;
  }
  await client.save();
  console.log(client);
  return res
    .status(200)
    .json(new apiResponse(200, client, ' Updated Successfully '));
});

// for the deleting
const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);
  if (!client) {
    throw new apiError(404, {}, 'Client DEtails didint exits ');
  }
  if (client.logoId) {
    await deleteFromCloudinary(client.logoId);
  }
  return res
    .status(200)
    .json(new apiResponse(200, {}, ' Client details deleted successfully'));
});

export { createClient, getAllClient, editClientDetails, deleteClient };
