import { Schema, model } from "mongoose";

const urlSchema = new Schema({
  url_id: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  expiry: {
    type: Date,
    default: null,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  isSingleValid: {
    type: Boolean,
    default: false,
  },
  linkCntLimit: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isvarified: {
    type: Boolean,
    default: false,
  },
  qr: String,

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

export const Url = model("Url", urlSchema);
