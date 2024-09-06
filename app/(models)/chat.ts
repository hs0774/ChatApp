import mongoose, { Model, Schema, Document } from "mongoose";

interface IChat extends Document {
  title: string;
  participants: mongoose.Types.ObjectId[];
  messages: {
    sender: mongoose.Types.ObjectId;
    content: string | null;
    image?: string | null;
    createdAt: Date;
  }[];
  leftChatCopy: boolean;
}

const ChatSchema: Schema<IChat> = new Schema({
  title: { type: String, default: "" },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: { type: String },
      image: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  leftChatCopy: { type: Boolean, default: false },
});

const Chat: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);

export default Chat;
