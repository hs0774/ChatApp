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
import { profileZodSchema } from "@/app/utils/helperFunctions/zodSchemas.ts";
import Wall from "@/app/(models)/wall.ts";

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
        
        const userWallposts = await User.findById(decodedToken.id)
        //populate wall posts, populate friends post
        return NextResponse.json({ success: `success` }, { status: 200 });
    } catch (error) {
        console.error("Error: ", error);
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
}

// { 
//     _id: uuidv4(),
//     user: {_id: uuidv4(),username:'Name 3'},
//     content: 'This is a content for name 3 with some id',
//     image:'image: could be blank',
//     createdAt: fixedDate,
//     likes: [
//       { _id: uuidv4(), username: "Name 10" },
//       { _id: uuidv4(), username: "Name 11" },
//       { _id: uuidv4(), username: "Name 12" },
//       { _id: uuidv4(), username: "Name 13" },
//     ],
//     replies: [
//       { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 10"}, content: "message 10", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
//       { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 11"}, content: "message 11", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
//       { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 12"}, content: "message 12", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
//       { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 13"}, content: "message 13", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
//     ]
//   },