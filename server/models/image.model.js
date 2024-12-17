import mongoose, { Schema } from "mongoose";

const imageSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: [true, "Imaeg Uploaded Url Needed"],
    },

    allowed: {
      type: Number,
      default: 10,
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
