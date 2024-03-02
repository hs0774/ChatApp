import mongoose, { Model, Schema, Document } from "mongoose";

interface IChat extends Document {
    participants: mongoose.Types.ObjectId[];
    messages: mongoose.Types.ObjectId[]; 
}

const ChatSchema: Schema<IChat> = new Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], 
});

const Chat: Model<IChat> = mongoose.model<IChat>('Chat', ChatSchema);

export default Chat;