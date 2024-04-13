import mongoose, { Model, Schema, Document } from "mongoose";


interface IChat extends Document {
    participants: mongoose.Types.ObjectId[];
    messages: {
        sender: mongoose.Types.ObjectId;
        content: string;
        image?: Buffer;
        createdAt: Date;
    }[];
}

const ChatSchema: Schema<IChat> = new Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        image: { type: Buffer },
        createdAt: { type: Date, default: Date.now },
    }], 
});

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

export default Chat;