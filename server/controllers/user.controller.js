import { UserLoginType, UserRolesEnum } from "../constant.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emailVerificationContentHTML, sendEmail } from "../utils/mail.js";
import crypto from "crypto";

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    return { accessToken };
  } catch (error) {
    console.log(error);
    throw new Error(
      500,
      "Something Went Wrong During The genration of AccessToken"
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // check is user already existed
  const existingUser = await User.findOne({
    $and: [{ email }, { isEmailVerified: true }],
  });

  if (existingUser) {
    return res
      .status(409)
      .json(new ApiError(409, "User with email already exist "));
  }

  // now we create user
  const user = await User.create({
    username,
    email,
    password,
    isEmailVerified: false,
    role: UserRolesEnum.USER,
  });

  // genrate token for the user to verified the email

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  await user.save({ validateBeforeSave: false });

  // send hashedToken and to user email

  const sendEmailToUser = await sendEmail({
    email: user?.email,
    subject: "Please Verfiy your Email | By TinySnap",
    htmlContent: emailVerificationContentHTML(
      user?.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });

  // if mail failed to send the user delelte the user from the db and throw error
  if (
    !sendEmailToUser.response.complete ||
    sendEmailToUser.response.statusCode != 201
  ) {
    await User.findByIdAndDelete(user._id);
    return res
      .status(409)
      .json(
        new ApiError(
          409,
          "Uanble to Send the verfication mail to the user. Please Try To Register Again"
        )
      );
  }

  // get the current user
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  if (!createdUser) {
    return res
      .status(500)
      .json(
        new ApiError(500, "Something went wrong while registering the user")
      );
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "Users registered successfully and verification email has been sent on your email."
      )
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    return res
      .status(400)
      .json(new ApiError(400, "Email verification token is missing"));
  }

  // generate a hash from the token that we are receiving
  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // While registering the user, same time when we are sending the verification mail
  // we have saved a hashed value of the original email verification token in the db
  // We will try to find user with the hashed token generated by received token
  // If we find the user another check is if token expiry of that token is greater than current time if not that means it is expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(409)
      .json(new ApiError(409, "Token is invalid or expire"));
  }

  // If we found the user that means the token is valid
  // Now we can remove the associated email token and expiry date as we no  longer need them
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  // Turn the email verified flag to `true`
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isEmailVerified: true }, "Your Email is verified ")
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user) {
    return res
      .status(401)
      .json(new ApiError(401, "This Email is not register with us"));
  }

  if (user.loginType !== UserLoginType.EMAIL_PASSWORD) {
    // If user is registered with some other method, we will ask him/her to use the same method as registered.
    // This shows that if user is registered with methods other than email password, he/she will not be able to login with password. Which makes password field redundant for the SSO
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "You have previously registered using " +
            user.loginType?.toLowerCase() +
            ". Please use the " +
            user.loginType?.toLowerCase() +
            " login option to access your account."
        )
      );
  }

  // now we compare the passowrd

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json(new ApiError(401, "Invalid User Credentials"));
  }

  const { accessToken } = await generateAccessToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)

    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User logged in successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

export const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    return res.status(404).json(new ApiError(404, "User Dose Not Exist", []));
  }

  if (user.isEmailVerified) {
    return res
      .status(409)
      .json(new ApiError(409, "User Email is already verified", []));
  }

  // genrate token for the user to verified the email

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  await user.save({ validateBeforeSave: false });

  // send hashedToken and to user email

  const sendEmailToUser = await sendEmail({
    email: user?.email,
    subject: "Please Verfiy your Email | By TinySnap",
    htmlContent: emailVerificationContentHTML(
      user?.username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    ),
  });

  // if mail failed to send the user delelte the user from the db and throw error
  if (
    !sendEmailToUser.response.complete ||
    sendEmailToUser.response.statusCode != 201
  ) {
    return res
      .status(409)
      .json(
        new ApiError(
          409,
          "Uanble to Send the verfication mail to the user. Please Try  Again"
        )
      );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "Users registered successfully and verification email has been sent on your email."
      )
    );
});