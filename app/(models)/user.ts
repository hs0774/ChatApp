import mongoose, { Model, Schema, Document, Types } from "mongoose";

interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  details: Types.ObjectId;
  profilePic: Buffer;
  friends: Types.ObjectId[];
  chats: Types.ObjectId[];
  status: boolean;
  inbox: Types.ObjectId[];
  nonFriendsChat: boolean;
  url: string;
}

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  details: { type: Schema.Types.ObjectId, ref: "Details" },
  profilePic: { type: Buffer },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
  status: { type: Boolean, default: false },
  inbox: [{ type: Schema.Types.ObjectId, ref: "Inbox" }],
  nonFriendsChat: { type: Boolean, default: false },
});

UserSchema.virtual("url").get(function (this: IUser) {
  return `/profile/${this._id}`;
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
