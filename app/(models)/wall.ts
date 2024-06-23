import mongoose, { Model, Schema, Document, Types } from "mongoose";

    interface IComment extends Document {
        _id:Types.ObjectId;
        sender:mongoose.Types.ObjectId;
        message:string;
        image?:string;
        time:Date;
    }

    interface IWall extends Document {
        _id:Types.ObjectId;
        user:mongoose.Types.ObjectId;
        content:string;
        likes: mongoose.Types.ObjectId[];
        replies:IComment[],
        image?: string;
        createdAt:Date;
    }

    const CommentSchema :Schema<IComment> = new Schema({
            sender: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
            message: { type: String },
            image: { type: String },
            time: { type: Date, default: Date.now },
    })


    const WallSchema: Schema<IWall> = new Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true  }, 
        content: {type: String,default: ''},
        image: { type: String },
        replies: [CommentSchema],
        likes:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdAt:{type:Date, default:Date.now}
    });
    
    const Wall: Model<IWall> =
        mongoose.models.Wall || mongoose.model<IWall>("Wall", WallSchema);
    
    const Comment: Model<IComment> = 
        mongoose.models.Comment || mongoose.model<IComment>("Comment",CommentSchema);

        export { Wall, Comment };
