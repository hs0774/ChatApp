import "dotenv/config";
import env from "../../../../utils/validateEnv.ts";
import User from "@/app/(models)/user.ts";
import Details from "../../../../(models)/details.ts";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import validator from "validator";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";
import Friendship from "@/app/(models)/friendship.ts";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";
import { profileZodSchema } from "@/app/utils/helperFunctions/zodSchemas.ts";

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
    const body = req.url.slice(req.url.lastIndexOf("/") + 1);
    console.log(body);
    const decodedToken = jwtDecode(token) as DecodedToken;
    // console.log;
    console.log(decodedToken);
    const user = await User.findById(body).populate("details").exec();

    let status;
    if (body !== decodedToken.id) {
      const friendDocCheck = await Friendship.findOne({
        $or: [
          { $and: [{ user: body }, { user2: decodedToken.id }] }, // Check if user is requestor and user2 is requestee
          { $and: [{ user: decodedToken.id }, { user2: body }] }, // Check if user is requestee and user2 is requestor
        ],
      });
      status = friendDocCheck?.status;
    }
    if (!user) {
      return NextResponse.json({ message: "User not found" });
    }

   // const binaryData = Buffer.from(user.profilePic);

    // Convert binary data into Base64 string
    // const base64Image = binaryData.toString("base64");
    // const imageDataURL = `data:image/jpeg;base64,${base64Image}`;
    const populatedFriends = await Promise.all(
      user.friends.map(async (friend) => {
        const friendUser = await User.findById(friend).exec();
        return {
          username: friendUser?.username,
          url: `/profile/${friendUser?._id}`,
          _id: friendUser?._id,
          profilePic: friendUser?.profilePic,
        };
      })
    );
    const filteredUser = {
      _id: user._id,
      username: user.username,
      chats: user.chats,
      details: user.details,
      email: user.email,
      friends: user.friends,
      inbox: user.inbox,
      nonFriendsChat: user.nonFriendsChat,
      status: user.status,
      profilePic:user.profilePic
    };

    return NextResponse.json(
      { filteredUser, populatedFriends, status },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}


export async function PUT(req: NextRequest, res: NextResponse) {
  try {
    const token = verifyToken(req.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }


    await dbConnect();
    const body = await req.json();
    //console.log(body.editDetails)
    const validation = profileZodSchema.safeParse(body.editDetails);

    if (!validation.success) {
      return NextResponse.json(validation.error.errors, { status: 404 });
    }
    const sanitizedData = sanitizeData(validation);
    
    if (!sanitizedData) {
      return NextResponse.json(
        { message: "Issue with validating data" },
        { status: 400 }
      );
    }
    //console.log(sanitizedData)
    const user = await User.findById(body.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const details = await Details.findById(user.details);

    if (!details) {
      return NextResponse.json(
        { message: "Details not found" },
        { status: 404 }
      );
    }

    const usernameCheck = await User.findOne({
      username: { $regex: new RegExp(`^${sanitizedData.username}$`, "i") },
      _id: { $ne: user._id }, // Exclude the current user's ID
    });

    if (usernameCheck) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    user.username = sanitizedData.username as string;
    details.age = sanitizedData.age as number;
    details.bio = sanitizedData.bio as string;
    details.job = sanitizedData.occupation as string;
    details.location = sanitizedData.location as string;
    details.sex = sanitizedData.sex as "Male" | "Female" | "Other";

    await user.save();
    await details.save();
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}

