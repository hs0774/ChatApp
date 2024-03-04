// import mongoose, { Model, Schema, Document } from "mongoose";

// interface IMessage extends Document {
//     sender: mongoose.Types.ObjectId;
//     receiver: mongoose.Types.ObjectId[];
//     content: string;
//     image?:Buffer;
//     createdAt: Date;
// }

// const MessageSchema: Schema<IMessage> = new Schema({
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     content: { type: String, required: true },
//     image: { type: Buffer },
//     createdAt: { type: Date, default: Date.now },
// });

// const Message: Model<IMessage> = mongoose.model<IMessage>('Message', MessageSchema);

// export default Message;
