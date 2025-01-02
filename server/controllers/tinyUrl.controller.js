import crypto from "crypto";
import { Tinyurl } from "../models/tinyUrl.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DEFAULT_URL_EXPIRY, UserRolesEnum } from "../constant.js";

async function genrateRandomName() {
  try {
    let shortString = "";
    let hashedString = crypto.randomBytes(100).toString("hex");

    for (let i = 0; i < 8; i++) {
      const ranodonNum = Math.floor(Math.random() * hashedString.length - 1);
      shortString += hashedString.charAt(ranodonNum);
    }

    // check dose it exist or not before in db
    const existUrl = await Tinyurl.findOne({
      shortName: shortString,
    });

    // if present then again call the same
    if (existUrl) {
      const currentDate = new Date();
      if (existUrl.urlValidity > currentDate) {
        await Tinyurl.findByIdAndDelete(existUrl._id);
        return shortString;
      } else {
        genrateRandomName();
      }
    }
    console.log(shortString);

    return shortString;
  } catch (error) {
    throw new ApiError(500, "SomeThing When Wront While create the tinyName ");
  }
}

export const createTinyUrl = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const { shortName, originalUrl, urlValidity } = req.body;

  // if shortName is greater then 3
  // Ensure shortName is a string
  let sanitizedShortName = "";

  // Generate a random short name if `shortName` is empty
  if (!shortName || shortName.trim() === "") {
    sanitizedShortName = await genrateRandomName(); // Await the function properly
  }
  let ServerSideurlValidity = Date.now() + DEFAULT_URL_EXPIRY;

  // now we check dose  urlValidity is valid or not

  const currDate = new Date();
  if (currDate > urlValidity && urlValidity.length > 0) {
    return res
      .status(402)
      .json(new ApiError(402, "Url Validity Wrong It Must Be For Future"));
  }

  // now we create the tinyUrl
  const tinyUrl = `${process.env.SERVER_BASE_URL}/${shortName.length > 3 ? shortName : sanitizedShortName}`;

  const savedTinyUrl = await Tinyurl.create({
    shortName: shortName.length > 3 ? shortName : sanitizedShortName,
    originalUrl,
    tinyUrl,
    urlValidity: urlValidity.length === 0 ? ServerSideurlValidity : urlValidity,
    owner: userId,
  });

  const currentTinyUrl = await Tinyurl.findById(savedTinyUrl._id);

  if (!currentTinyUrl) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          "Something went wrong while creating the tinyUrl please try again"
        )
      );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "TinyUrl Created Successfully", currentTinyUrl));
});

export const delelteTinyUrl = asyncHandler(async (req, res) => {
  const { userId } = req.user?._id;

  const { id } = req.parmas;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid tinyUrlId");
  }

  const tinyUrl = await Tinyurl.findById(id);

  // check dose the userId of this tinyUrl

  if (tinyUrl.owner._id.toString() !== userId.toString()) {
    throw new ApiError(404, "You Are Not Authorized To Delte the video ");
  }

  await Tinyurl.findByIdAndDelete(tinyUrl._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Url Delted Succesfully"));
});

// redirect

export const redirectTinyUrl = asyncHandler(async (req, res) => {
  const { id } = req.parmas;
});

// admin controller

export const delteAllExiperdTinyUrl = asyncHandler(async (req, res) => {
  const { userId } = req.user?._id;

  const user = await User.findById(userId);

  if (user.role !== UserRolesEnum.ADMIN) {
    return res
      .status(404)
      .json(
        new ApiError(404, "You Are not authirized to access here get out ")
      );
  }

  const currentDate = new Date();

  await Tinyurl.deleteMany({ urlValidity: { $lt: currentDate } });

  return res
    .status(200)
    .json(new ApiResponse(200, "All expired URLs deleted successfully"));
});
