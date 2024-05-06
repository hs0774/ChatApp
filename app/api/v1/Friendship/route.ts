import "dotenv/config";
import env from "../../../utils/validateEnv.ts";
import User from "../../../(models)/user.ts";
import Details from "../../../(models)/details.ts";
import Inbox from "../../../(models)/inbox.ts";
import Friendship from "@/app/(models)/friendship.ts";
import { z } from "zod";
import validator from "validator";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";

//friend request
interface DecodedToken {
  id: string;
  email: string;
  username:string;
}
export async function POST(req: Request, res: Response) {
  try {
    const token = verifyToken(req.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect(); // Ensure database connection
    const body = await req.json(); //requested users id
    console.log("requested", body); //
    const decodedToken = jwtDecode(token) as DecodedToken; //token.id
    console.log("requestor", decodedToken.id);
    const [requestor, requestee] = await Promise.all([
      User.findById(decodedToken.id),
      User.findById(body),
    ]);

    if (!requestor || !requestee) {
      return NextResponse.json({ message: `Error` }, { status: 400 });
    }

    const friendDocCheck = await Friendship.findOne({
      $or: [
        { $and: [{ user: requestor._id }, { user2: requestee._id }] }, // Check if user is requestor and user2 is requestee
        { $and: [{ user: requestee._id }, { user2: requestor._id }] }, // Check if user is requestee and user2 is requestor
      ],
    });

    if (!friendDocCheck) {
      const friendDocument = new Friendship({
        user: requestor._id,
        user2: requestee._id,
        status: "pending",
      });
      await friendDocument.save();
    }

    const inbox = new Inbox({
      sender: requestor._id,
      receiver: requestee._id,
      message: `${requestor.username} has sent you a friend request`,
      type: "friendRequest",
    }); //let users send multiple messages

    await inbox.save();
    requestee.inbox.push(inbox._id);
    requestee.save();

    return NextResponse.json({ message: `Req works` }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
} //get user id, get requested persons id, create a friendship document
//create an inbox and send it to the request persons inbox

//remove friend
export async function DELETE(req: Request, res: Response) {
  try {
    const token = verifyToken(req.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json(); //friend you want to remove id 
    const decodedToken = jwtDecode(token) as DecodedToken; //user who is removing id 
    console.log(decodedToken);

    const user = await User.findById(decodedToken.id);
    const user2 = await User.findById(body);

    if(!user || !user2) {
      return NextResponse.json({ message: "Error: User not found" }, { status: 400 });
    }

    const friendship = await Friendship.findOneAndDelete({
      $or: [
          { $and: [{ user: user._id }, { user2: user2._id}] },
          { $and: [{ user:user2._id }, { user2: user._id }] }
      ]
    })
    
    if(!friendship){
      return NextResponse.json({ message: "Error: Friendship not found" }, { status: 404 });
    }

    await User.updateOne({ _id: user._id }, {
      $pull: {
        friends: user2._id
      }
    });
    
    // Remove user1's ID from user2's friends array
    await User.updateOne({ _id: user2._id }, {
      $pull: {
        friends: user._id
      }
    });

    // Save the updated users
    await Promise.all([user.save(), user2.save()]);

    return NextResponse.json({ message: "success" }, { status: 200 });

  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}
//so we get the id of the friend and we get the id of the user

 //then we search for the friendship schema, 
 //we then delete the schema and then we remove the user 
//from their respective array 
//return the id of the friend you remove or return the array list of friends, whichever
//is used in the client and remove the friend from the front end 
