import { Admin } from "../models/admin.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

/*
Login the admin 
1. get the {email,name,password,phoneNumber,avatar} from the admin,
2. check if the email and password matched or not ?? 
3. call the accesstoken and refresh token by passing the admin,_Id to the genereateaccestoken and refresh token
4. refresh token get store into the db 
5. send the access token and refresh token to the cookie with the securd only

*/
/*first make the generateaccesstokenandrefreshtoken helper  */

const generateAccessTokenAndRefreshToken = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();
    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "something went wrong while genereting the accessToken and refreshToken ",
    );
  }
};

const adminLogin = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;
  console.log("adminEmail", email);
  console.log("adminPassword", password);
  console.log("adminName", name);

  if (!email) {
    throw new apiError(400, " admin email is required");
  }
  // find the admin based on the email or phone number

  const admin = await Admin.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  // if the admin email is not found say this email didint exits
  if (!admin) {
    throw new apiError(400, " admin with this email didit exist");
  }
  // if found the admin then go and check the admin password (first check if the admin has enter the password or not )
  if (!password) {
    throw new apiError(400, "please enter the password");
  }

  // here the plain text password is being hased and checking if the hashed password of the admin match or not ?
  const isPasswordValid = await admin.isPasswordCorrect(password);
  // if not matched then say didint matched

  if (!isPasswordValid) {
    throw new apiError(400, "entered Password or email didnt matched!");
  }

  //accesstoken and refreshtoken

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(admin._id);

  // i created the accesstoken and refresh token now i have to send it into the cookie using the

  // selecting the detils form the admin document and excluding password and refreshtoken to give respone becaue we dont give them back
  const loggedAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken",
  );

  const option = {
    httpOnly: true,
    secure: true,
  };
  // return the response
  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new apiResponse(
        200,
        {
          admin: loggedAdmin,
          accessToken,
          refreshToken,
        },
        "Admin Logged in successfully ",
      ),
    );
});

// refreshToken roatation

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) {
    throw new apiError(401, "unauthorized request");
  }
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );
  if (!decodedToken) {
    throw new apiError(401, "invalid refresh token");
  }

  const admin = await Admin.findById(decodedToken?._id);
  if (!admin) {
    throw new apiError(401, " invalid refresh Token ");
  }

  if (incomingRefreshToken !== admin?.refreshToken) {
    throw new apiError(401, "refresh token expired or invalid");
  }
  const option = {
    httpOnly: true,
    secure: true,
  };
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(admin._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new apiResponse(
        200,
        { accessToken, refreshToken },
        "access token refreshed successfully ",
      ),
    );
});

// logout  the admin
{
  /*

  delete the refreshtoken from the db and sent it to cookies 
  
*/
}

const logoutAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },

   
  );

   const option ={
      httpOnly:true,
      secure:true,
    };
    return res
    .status(200)
    .clearCookie('accessToken',option)
    .clearCookie('refreshToken',option)
    .json(new apiResponse(200, {}, "Admin loggedout Successfully"))
});

export { adminLogin, refreshAccessToken,logoutAdmin };
