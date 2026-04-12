import { Team } from '../models/team.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { Testimonial } from '../models/testimonial.model.js';

const createTestimonial = asyncHandler(async (req, res) => {
    const { name, company, reviewText, rating } = req.body;
    if (!name || !company || !reviewText || !rating) {
        throw new apiError(400, ' All field are required !');
    }
    if (rating < 1 || rating > 5) {
        throw new apiError(400, ' Rating must me between 1 and 5 ');
    }
    const avatarImagePath = req.file?.path;
    if (!avatarImagePath) {
        throw new apiError(400, 'avatar image is required !');
    }
    // upload on cloudianary
    const avatar = await uploadOnCloudinary(avatarImagePath);
    if (!avatar) {
        throw new apiError(400, ' avatar upload failed ');
    }
    let testimonial;
    try {
        testimonial = await Testimonial.create({
            name,
            company,
            reviewText,
            rating,
            avatar: avatar.secure_url,
            avatarId: avatar.public_id,
        });
    } catch (error) {
        if (avatar.avatarId) {
            await deleteFromCloudinary(avatar.avatarId);
        }
        throw new apiError(400, ' failed to create testimonial');
    }
    return res
        .status(200)
        .json(new apiResponse(200, testimonial, ' testimonial details created successfully !'));
});

// fetch with paginatin for amdin pannel

const getAlltestiomonail = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const hasLimit = limit > 0;
    const skip = hasLimit ? (page - 1) * limit : 0;

    let query = Testimonial.find().sort({ createdAt: -1 });
    if (hasLimit) {
        query = query.skip(skip).limit(limit);
    }
    const testimonial = await query;
    const total = await Testimonial.countDocuments();

    return res.status(200).json(
        new apiResponse(
            200,
            {
                testimonial,
                pagination: {
                    currentPage: hasLimit ? page : 1,
                    totalPages: hasLimit ? Math.ceil(total / limit) : 1,
                    totalItems: total,
                    limit: hasLimit ? limit : total,
                },
            },
            'clientDetails fetched successfully'
        )
    );
});

// edit the testimonial

const editTestiominial = asyncHandler(async (req, res) => {
    const { name, company, reviewText, rating } = req.body;
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
        throw new apiError(400, ' Testimonial didint exits ');
    }
    testimonial.name = name || testimonial.name;
    testimonial.company = company || testimonial.company;
    testimonial.reviewText = reviewText || testimonial.reviewText;
    testimonial.rating = rating || testimonial.rating;

    // if the avatar is changed then delete the avatar from the lcoudianry

    if (req.file) {
        if (testimonial.avatarId) {
            await deleteFromCloudinary(testimonial.avatarId);
        }

        // after deleting now upload new one
        const cloudinaryResponse = await uploadOnCloudinary(req.file?.path);
        console.log(cloudinaryResponse);
        if (!cloudinaryResponse) {
            throw new apiError(400, ' faile while uploading avatar');
        }
        // change the url of db
        testimonial.avatar = cloudinaryResponse.secure_url;
        testimonial.avatarId = cloudinaryResponse.public_id;
        await testimonial.save();
        console.log(testimonial);
    }
    return res
    .status(200)
    .json((new apiResponse(200, testimonial," Testiomonial details updated successfully !")))
});


// delete the testiomonail 

const deleteTestiomonial = asyncHandler(async(req,res)=>{
	const testimonial = await Testimonial.findByIdAndDelete(req.params.id)
	if(!testimonial){
		throw new apiError(404, " Testimonial didint exits into db")
	}
	// now delete from the cloudinary also 

	if(testimonial.avatarId){
		await deleteFromCloudinary(testimonial.avatarId)

	}

	return res
	.status(200)
	.json((new apiResponse(200, {}," Testiomonial deleted successfylly ")))
})

export {createTestimonial,getAlltestiomonail,editTestiominial,deleteTestiomonial}