import mongoose, { Model, Schema, Document,Types } from "mongoose";

interface IDetails extends Document {
        hobbies: string[];
        job: string;
        interests:string;
        bio: string;
        age: number;
        sex: 'male' | 'female' | 'other';
        location?: string;
}

const DetailsSchema:Schema<IDetails> = new Schema({
        hobbies: [{ type: String }],
        job: { type: String },
        interests: { type: String },
        bio: { type: String },
        age: { type: Number },
        sex: { type: String, enum: ['male', 'female', 'other'] },
        location: { type: String },
});

const Details: Model<IDetails> = mongoose.model<IDetails>('Details', DetailsSchema);

export default Details;