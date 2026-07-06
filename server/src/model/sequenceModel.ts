import mongoose from "mongoose";

const sequenceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 }
});

export const Sequence = mongoose.model("Sequence", sequenceSchema);
