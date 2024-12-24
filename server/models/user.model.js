import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  AccountStatusEnum,
  RESET_PASSWORD_TOKEN_EXPIRY,
  USER_TEMPORARY_TOKEN_EXPIRY,
  UserLoginType,
  UserRolesEnum,
} from "../constant.js";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, "Username is required"],
      minLength: [3, "Username must "],
      maxlength: [50, "Username can't be more then 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      unique: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be 8 characters"],
      trim: true,
      select: false,
    },

    avatar: {
      type: String,
      default: "https://via.placeholder.com/200x200.png",
    },

    role: {
      type: String,
      enum: UserRolesEnum,
      default: UserRolesEnum.USER,
    },

    loginType: {
      type: String,
      enum: UserLoginType,
      default: UserLoginType.EMAIL_PASSWORD,
    },

    accountStats: {
      type: String,
      enum: AccountStatusEnum,
      default: AccountStatusEnum.UNVERIFIED,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    createdUrl: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tinyurl",
      },
    ],

    createdImages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },

    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Encrypt Password Before Saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare Password function

userSchema.methods.comparePassword = async function (enterdPassword) {
  return await bcrypt.compare(enterdPassword, this.password);
};

// genrate AccessToken
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// genrate refresh password token

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + RESET_PASSWORD_TOKEN_EXPIRY; // 10 minutes valid
  return resetToken;
};

// genrate token for email verification

userSchema.methods.generateTemporaryToken = function () {
  // this token should go to the user email
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // this will save in db to comapre at the time of verification
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  // This is the expiry time for the token (20 minutes)
  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY;

  this.emailVerificationToken = hashedToken;
  this.emailVerificationExpiry = tokenExpiry;

  return { unHashedToken, hashedToken, tokenExpiry };
};

// Virtual field for total tinyUrl Created

userSchema.virtual("totalTinyUrlCreated").get(function () {
  return this.createdUrl?.length;
});

// Virtual field for total image Created

userSchema.virtual("totalImageCreated").get(function () {
  return this.createdImages?.length;
});

export const User = mongoose.model("User", userSchema);
