import mongoose, { Schema } from "mongoose";
import { DEFAULT_URL_EXPIRY } from "../constant.js";

const tinyUrlSchema = await Schema(
  {
    shortName: {
      type: String,
      minLength: [8, "Short name must be of 8 characters"],
      maxLength: [50, "Short Name can't be more then 50 characters"],
      requried: [true, "Original url required"],
      trim: true,
      unique: true,
    },

    originalUrl: {
      type: String,
      requried: [true, "Original url required"],
      trim: true,
    },

    tinyUrl: {
      type: String,
      requried: [true, "Tiny url required"],
      trim: true,
    },

    urlValidity: {
      type: Date,
      default: Date.now() + DEFAULT_URL_EXPIRY,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Tinyurl = mongoose.model("Tinyurl", tinyUrlSchema);
