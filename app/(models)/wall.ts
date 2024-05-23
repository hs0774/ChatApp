import mongoose, { Model, Schema, Document, Types } from "mongoose";

    interface IComment extends Document {
        sender:mongoose.Types.ObjectId;
        message:string;
        image?:Buffer;
        time:Date;
    }

    interface IWall extends Document {
        user:mongoose.Types.ObjectId;
        content:string;
        likes: mongoose.Types.ObjectId[];
        replies:IComment[],
        image?: Buffer;
        createdAt:Date;
    }

    const CommentSchema :Schema<IComment> = new Schema({
            sender: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
            message: { type: String, required: true },
            image: { type: Buffer },
            time: { type: Date, default: Date.now },
    })

    const WallSchema: Schema<IWall> = new Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true  }, 
        content: {type: String,default: ''},
        image: { type: Buffer },
        replies: [CommentSchema],
        likes:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdAt:{type:Date, default:Date.now}
    });
    
    const Wall: Model<IWall> =
        mongoose.models.Wall || mongoose.model<IWall>("Wall", WallSchema);
    
    export default Wall;
