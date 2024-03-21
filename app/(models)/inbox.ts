import mongoose, { Model, Schema, Document } from "mongoose";


interface IInbox extends Document {
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    message: string;
    type: 'message' | 'friendRequest'; 
    read: boolean;
    createdAt: Date;
}

const InboxSchema:Schema<IInbox> = new Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['message', 'friendRequest'], required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const Inbox: Model<IInbox> = mongoose.model<IInbox>('Inbox', InboxSchema);

export default Inbox;