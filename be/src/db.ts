import mongoose, { Schema, Types } from "mongoose";


const userSchema = new mongoose.Schema({
  username: { type: String, Required: true, unique: true },
  password: { type: String, Required: true },
});
const tagSchema = new mongoose.Schema({
  title: { type: String, Required: true, unique: true },
});
const contentTypes = ["documents", "tweet", "youtube", "link"];

const contentSchema = new Schema({
  link: { type: String, required: true },
  type: { type: String, enum: contentTypes, required: true },
  title: { type: String, required: true },
  tags: [{ type: Types.ObjectId, ref: "Tag" }],
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
    validate: async function (value: any) {
      const user = await mongoose.model("User").findById(value);
      if (!user) {
        throw new Error("User does not exist");
      }
    },
  },
});

const linkSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

export const User = mongoose.model("User", userSchema);
export const Tag = mongoose.model("Tag", tagSchema);
export const Content = mongoose.model("Content", contentSchema);
export const Link = mongoose.model("Link", linkSchema);
