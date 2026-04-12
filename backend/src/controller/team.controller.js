import { Team } from '../models/team.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

const createTeam = asyncHandler(async (req, res) => {
    const { name, role, linkedinUrl, githubUrl, twitterUrl } = req.body;
    if (!name || !role) {
        throw new apiError(400, ' All field are required !');
    }
    const teamImagePath = req.file?.path;
    if (!teamImagePath) {
        throw new apiError(400, 'Team image is required !');
    }

    // upload in cloudainary

    const teamImage = await uploadOnCloudinary(teamImagePath);
    if (!teamImage) {
        throw new apiError(400, ' team image upload failed to cloudinary ');
    }
    let teamDetails;
    try {
        teamDetails = await Team.create({
            name,
            role,
            linkedinUrl,
            githubUrl,
            twitterUrl,
            teamImage: teamImage.secure_url,
            teamImageId: teamImage.public_id,
        });
    } catch (error) {
        if (teamImage.public_id) await deleteFromCloudinary(teamImage.public_id);
        throw new apiError(400, 'failed to create teamDetails ');
    }
    return res
        .status(200)
        .json(new apiResponse(200, teamDetails, 'Team Details created Successfully !'));
});

// fetch with paginatin for amdin pannel

const getAllteam = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const hasLimit = limit > 0;
    const skip = hasLimit ? (page - 1) * limit : 0;

    let query = Team.find().sort({ createdAt: -1 });
    if (hasLimit) {
        query = query.skip(skip).limit(limit);
    }
    const teams = await query;
    const total = await Team.countDocuments();

    return res.status(200).json(
        new apiResponse(
            200,
            {
                teams,
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

//editing the team

const editTeamDetails = asyncHandler(async (req, res) => {
    const { name, role, linkedinUrl, githubUrl, twitterUrl } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) {
        throw new apiError(404, ' Team details didint exits ');
    }
    team.name = name || team.name;
    team.role = role || team.role;
    team.linkedinUrl = linkedinUrl || team.linkedinUrl;
    team.githubUrl = githubUrl || team.githubUrl;
    team.twitterUrl = twitterUrl || team.twitterUrl;

    // if the new image is uploaded then
    if (req.file) {
        if (team.teamImageId) {
            await deleteFromCloudinary(team.teamImageId);
        }
        // now uplad the new image into the cloudainary and save its url into the db
        const cloudinaryresponse = await uploadOnCloudinary(req.file.path);
        console.log(cloudinaryresponse);
        if (!cloudinaryresponse) {
            throw new apiError(400, ' failed while uplodaing into the cloudainary ');
        }
        team.teamImage = cloudinaryresponse.secure_url;
        team.teamImageId = cloudinaryresponse.public_id;
    }
    await team.save();
    console.log(Team);
    return res.status(200).json(new apiResponse(200, team, 'Team Details updated successfully !'));
});

// for deleting

const deleteTeamDetails = asyncHandler(async (req, res) => {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
        throw new apiError(404, 'team details not found ');
    }
    if (team.teamImageId) {
        await deleteFromCloudinary(team.teamImageId);
    }
    return res.status(200).json(new apiResponse(200, {}, 'Team details deleted successfully '));
});

export { createTeam, getAllteam, editTeamDetails, deleteTeamDetails };
