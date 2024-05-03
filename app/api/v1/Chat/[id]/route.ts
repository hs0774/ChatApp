import "dotenv/config";
import env from "../../../../utils/validateEnv.ts";
import User from "../../../../(models)/user.ts";
import Details from "../../../../(models)/details.ts";
import Inbox from "../../../../(models)/inbox.ts";
import Friendship from "@/app/(models)/friendship.ts";
import { z } from "zod";
import validator from "validator";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";
import Chat from "@/app/(models)/chat.ts";

//GET chats for user who is logged in 
  // o basically get the token info and return the user chats array but populated
 
export async function GET(req: NextRequest, res: NextResponse) {
    try {
        //we use our token function, get the id, find and pass back the users
        //chat array populated, plus the users in the chat schemas username and id populated,
        //also pass the users friends array back but the same thing id and username. 
        const token = verifyToken(req.headers.get("authorization"));

        if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const decodedToken = jwtDecode(token); 

        const chat = await Chat;
        const user = await User.findById(decodedToken.id)
        .populate({ 
            path: "friends", 
            select: "username _id" // Select only username and _id
        })
        .populate({ 
            path: "chats",
            populate: {
                path: "participants",
                select: "username _id" // Select only username and _id for participants
            }
        })
        .populate({ 
            path: "chats",
            populate: {
                path: "messages.sender",
                select: "username _id" // Select only username and _id for participants
            } // Select only username and _id for the sender of each message
        })
        .select("username _id") // Select only username and _id for the main user
        .exec();


        console.log(user);
        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
}


//PUT LEAVE CHAT OR NEW MEMBER 
// remove the user from the chat schema and remove the reference. 
//or if a user is added find the user and add them to the participants property
//and add the chat reference to their chat array in the user document
//