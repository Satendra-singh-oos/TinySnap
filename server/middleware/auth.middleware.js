import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(404).json(new ApiError(404, "Not Authorized"));
    }

    const verifyedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const userId = verifyedToken?.id;

    if (!userId) {
      return res.status(404).json(new ApiError(404, "Not Authorized "));
    }

    const user = await User.findById(userId).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if (!user) {
      return res.status(404).json(new ApiError(404, "Not Authorized"));
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          "Something Went Wrong During Verify Your Token Please login again",
          []
        )
      );
  }
});

export const verifyPermission = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user?._id) {
      throw new ApiError(401, "Unauthorized request");
    }
    if (roles.includes(req.user?.role)) {
      next();
    } else {
      throw new ApiError(403, "You are not allowed to perform this action");
    }
  });
