import { Message } from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

const createMessageDetails = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
        throw new apiError(400, "All fields are required!");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new apiError(400, "Invalid email format");
    }

    const messageDetails = await Message.create({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
    });

    return res
        .status(201)
        .json(new apiResponse(201, messageDetails, "Message created successfully!"));
});




// fetch the message details 




const getMessageDetails = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 7;
  const hasLimit = limit > 0;
  const skip = hasLimit ? (page - 1) * limit : 0;

  let query = Message.find().sort({ createdAt: -1 });
  if (hasLimit) {
    query = query.skip(skip).limit(limit);
  }
  const message = await query;
  const total = await Message.countDocuments();

  return res.status(200).json(
    new apiResponse(
      200,
      {
        message,
        pagination: {
          currentPage: hasLimit ? page : 1,
          totalPages: hasLimit ? Math.ceil(total / limit) : 1,
          totalItems: total,
          limit: hasLimit ? limit : total,
        },
      },
      'MessageDetails fetched successfully',
    ),
  );
});



//  delete
const deleteMessageDetails = asyncHandler(async(req,res)=>{
    const message =  await Message.findByIdAndDelete(req.params.id)
    if(!message){
        throw new apiError(404, " Message not found ")
    }
    return res
    .status(200)
    .json((new apiResponse(200, {}," Message deleted Successfully !")))

})


export {createMessageDetails,getMessageDetails,deleteMessageDetails}