import User from "@/app/(models)/user.ts";
import Details from "../../../(models)/details.ts";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import validator from "validator";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";
import Friendship from "@/app/(models)/friendship.ts";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";
import { commentZodSchema, profileZodSchema } from "@/app/utils/helperFunctions/zodSchemas.ts";
import {Wall,Comment} from "@/app/(models)/wall.ts";
import { generateUploadURL } from "@/app/utils/helperFunctions/s3ImgUpload.ts";
import mongoose from "mongoose";

interface DecodedToken {
  id: string;
  email: string;
  username:string;
} 

export async function GET(req: NextRequest, res: NextResponse) {
    try {

        const token = verifyToken(req.headers.get("authorization"));
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" });
        }
        
        await dbConnect(); // Ensure database connection
        const decodedToken = jwtDecode(token) as DecodedToken; //id username email
        const wall = await Wall;
        const user = await User.findById(decodedToken.id).select('friends username wall profilePic').populate('friends', 'username wall profilePic');
        //populate wall posts, populate friends post
        
        if (!user) {
            throw new Error('User not found');
        }
        let allWalls = [...user.wall];

        user.friends.forEach(friend => {
          allWalls = allWalls.concat(friend.wall);
        });
       // console.log(allWalls)
        let allWallDetails = await Wall.find(
            { _id: { $in: allWalls } },
            // { image: 0 } // Exclude the image f
          ).sort({ createdAt: -1 })
          .populate('user','username profilePic').populate({ 
            path: "likes", 
            select: "username _id profilePic"
        }).populate({ 
            path: "replies", 
            populate: {
                path: "sender",
                select: "username _id profilePic", // Select only username and _id for participants
            },
        })
       
        //console.log(allWallDetails)

        return NextResponse.json({ allWallDetails }, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
}


export async function POST(req: NextRequest, res: NextResponse) { //this is for comments
    try {
        const token = verifyToken(req.headers.get("authorization"));
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" },{status:401});
        }
    
        const decodedToken = jwtDecode(token) as DecodedToken; //id username email
        const user = await User.findById(decodedToken.id);
    
        if(!user) {
            return NextResponse.json({ message: "User not found" },{status:404});
        }
        const body = await req.json();
        console.log(body);
        let validation;
        let sanitizedData;
        if (body.comment !== '') {
          validation = commentZodSchema.safeParse(body);
          
          if (!validation.success) {
            console.log(validation.error)
            return NextResponse.json(validation.error.errors, { status: 400 });
          }
          sanitizedData = sanitizeData(validation); 
          if (!sanitizedData) {
            return NextResponse.json(
                { message: "Issue with validating data" },
                { status: 400 }
              );
          } 
        }
        console.log(sanitizedData); // posts work 
        const wall = await Wall.findById(body.wallId);
        if(!wall) {
            return NextResponse.json(
                { message: "cannot find post" },
                { status: 404 }
              );
        }
        // const newWall = new Wall({
        //     user:decodedToken.id,
        //     content:sanitizedData?.post,
        // })
        let comment = new Comment({
            _id: new mongoose.Types.ObjectId(),
            sender: new mongoose.Types.ObjectId(decodedToken.id),
            message: sanitizedData?.comment as string,
            time: new Date(),
          });

        wall.replies.push(comment);
        await wall.save();

        console.log(body.hasImage)
        if(!body.hasImage) {
            return NextResponse.json({ url:null,comment,wallId:wall._id},{status:200});
        }
        const url = await generateUploadURL(comment._id.toString(),'replyImages');
        console.log(url);
        return NextResponse.json({ url,comment,wallId:wall._id},{status:200});
        } catch(error) {
            console.log(error);
            return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
        }
}
