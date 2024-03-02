import mongoose, { Model, Schema, Document } from "mongoose";

interface IFriendship extends Document {
    user: mongoose.Types.ObjectId;
    user2: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted';
    createdAt: Date;
}

const FriendshipSchema: Schema<IFriendship> = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

const Friendship: Model<IFriendship> = mongoose.model<IFriendship>('Friendship', FriendshipSchema);

export default Friendship;
