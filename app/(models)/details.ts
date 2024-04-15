import mongoose, { Model, Schema, Document, Types } from "mongoose";

interface IDetails extends Document {
  hobbies: string[];
  job: string;
  interests: string;
  bio: string;
  age: number;
  sex: "Male" | "Female" | "Other";
  location: string;
}

const DetailsSchema: Schema<IDetails> = new Schema({
  hobbies: [{ type: String }],
  job: { type: String },
  interests: { type: String },
  bio: { type: String },
  age: { type: Number },
  sex: { type: String, enum: ["Male", "Female", "Other"] },
  location: { type: String },
});

const Details: Model<IDetails> =
  mongoose.models.Details || mongoose.model<IDetails>("Details", DetailsSchema);

export default Details;
