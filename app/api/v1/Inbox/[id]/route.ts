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
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";
import { jwtDecode } from "jwt-decode";

//get inbox page 
export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const token = verifyToken(req.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();

    //const body = await req.json();
    //const body = req.url.slice(req.url.lastIndexOf('/') + 1);
    const decodedToken = jwtDecode(token); //token.id
    // console.log('requestor',decodedToken.id);
    const inbox = await Inbox;
    const user = await User.findById(decodedToken.id)
      .populate({ path: "friends", select: "username" })
      .populate({
        path: "inbox",
        populate: {
          path: "sender receiver",
          select: "username _id",
        },
      })
      .exec();

    if (!user) {
      return NextResponse.json({ message: `Error:` }, { status: 500 });
    }

    console.log(user.friends);

    return NextResponse.json(
      { message: user.inbox, friends: user.friends },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 400 });
  }
}

//to accept request on inbox message 
// export async function PATCH(req:Request,res:Response) {
//     try {
//         await dbConnect();
//         const body = await req.json();
//         console.log(body);
//         const [user1,user2] = await Promise.all([
//             User.find({username:body.sender}),
//             User.find({username:body.receiver})
//         ])
//         if(!user1 || !user2) {
//             return NextResponse.json({message:'User doesnt exist'}, {status:400});
//         }
//         const friendSchema = await Friendship.find({sender:user1._id,receiver:user2._id})

//         return NextResponse.json({message:'success'}, {status:200});
//     } catch (error) {
//         console.log(error)
//         return NextResponse.json({ message: `Error: ${error}`}, {status:500});
//     }
// }
//change document to accepted and add users to respective friend arrays,first
//make create friend req so  we know which user is user and which is user2 in friendship
//schema

//to deny request on inbox message 
export async function POST(req: Request, res: Response) {
  try {
    const token = verifyToken(req.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    await dbConnect();
    const body = await req.json(); //sender, reciver, action(accept,deny) 
    console.log(body);
    
    const [user,user2] = await Promise.all([
      User.findOne({username:body.sender}),
      User.findOne({username:body.receiver}),
    ])

    if(!user || !user2) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    const friendship = await Friendship.findOne({
      $or: [
          { $and: [{ user: user }, { user2: user2 }] },
          { $and: [{ user: user2 }, { user2: user }] }
      ]
    })

    if(!friendship || friendship.status !== 'pending') {
      return NextResponse.json({ message: "Request has already been handled" }, { status: 400 });
    }

    if(body.action === 'accept') {
      friendship.status = 'accepted';
      await friendship.save();
      
      user.friends.push(user2._id);
      user2.friends.push(user._id); // Add reciprocal friendship
      await Promise.all([user.save(), user2.save()]);
    }

    if(body.action === 'deny') {
      Friendship.findByIdAndDelete(friendship._id);
    }

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
} //delete document but same thing with PATCH

//so we find the friendship schema and remove it and then on the front end we 
// have to delete the message. also on the server see what it the friendship schema status is 
// if the friendship schema says accepted, do not do anything,since the users are friends already,
// if it doesnt exist do nothing because it was denied already, 
//if its pending then change it to accepted or delete it and the other two conditions works
// because of this even old requests from the same user can be answered but i think thats
// ok because the its the same person requesting. 