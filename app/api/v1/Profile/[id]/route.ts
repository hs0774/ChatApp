import "dotenv/config";
import User from "@/app/(models)/user.ts";
import Details from "../../../../(models)/details.ts";
import Chat from "@/app/(models)/chat.ts";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import { jwtDecode } from "jwt-decode";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";
import Friendship from "@/app/(models)/friendship.ts";
import {Wall} from "@/app/(models)/wall.ts";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";
import { profileZodSchema } from "@/app/utils/helperFunctions/zodSchemas.ts";
import { uploadToS3 } from "@/app/utils/helperFunctions/s3ImgUpload.ts";

interface DecodedToken {
  id: string;
  email: string;
  username:string;
} 
//add suggested friends if token matches body 
export async function GET(req: NextRequest, res: NextResponse) {
  try {

    const token = verifyToken(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    await dbConnect(); // Ensure database connection
    const body = req.url.slice(req.url.lastIndexOf("/") + 1);
    const decodedToken = jwtDecode(token) as DecodedToken;

    const wall = await Wall;
    const chat = await Chat;
    const user = await User.findById(body).populate("details").populate({ 
      path: "wall", 
      populate: {
          path: "content likes replies image user replies.sender",
          select: "username _id profilePic",
      },
    }).populate({ 
      path: "friends", 
      select: "username _id profilePic",
    }).populate({ 
      path: "chats", 
      populate: {
        path: "participants",
        select: "username _id",
    },
    }).select("-password");

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
   
    let suggestedFriends;
    if (decodedToken.id === user._id.toString()) {
      // Find details documents with matching hobbies, excluding the current user
      const matchingDetails = await Details.find({
        _id: { $ne: user.details._id },
        // @ts-ignore: Property 'hobbies' does not exist on type 'ObjectId'
        hobbies: { $in: user.details.hobbies },
      })
      .select("_id");

      const matchingDetailIds = matchingDetails.map((detail) => detail._id);

      suggestedFriends = await User.find({
        _id: { $nin: user.friends },
        details: { $in: matchingDetailIds },
      })
      .populate({
        path: "details",
        select: "hobbies",
      }).select("profilePic _id username");

      console.log(suggestedFriends);
      let allSuggestedFriends = suggestedFriends.sort(() => Math.random() - 0.5);

      suggestedFriends = allSuggestedFriends.slice(0, 5);
    }
    
    return NextResponse.json(
      { status,user,suggestedFriends },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}

//add an multikey index  to hobbies 
export async function PUT(req: NextRequest, res: NextResponse) {
  try {
    const token = verifyToken(req.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" });
    }

    await dbConnect();
    const body = await req.json();
    console.log(body);
    const validation = profileZodSchema.safeParse(body.updatedDetails);

    if (!validation.success) {
      console.log(validation.error)
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
    console.log(sanitizedData.hobbies);
    user.username = sanitizedData.username as string;
    details.age = sanitizedData.age as number;
    details.bio = sanitizedData.bio as string;
    details.hobbies = sanitizedData.hobbies as unknown as string[];
    details.job = sanitizedData.occupation as string;
    details.location = sanitizedData.location as string;
    details.sex = sanitizedData.sex as "Male" | "Female" | "Other";
    
    if (body.updatedDetails.profilePic && !body.updatedDetails.profilePic.startsWith('https')) {
       //console.log(body.editDetails.profilePic);
       const s3Url = await uploadToS3(body.updatedDetails.profilePic, 'profilePics', user._id);
       console.log(s3Url);
       user.profilePic = s3Url;
       await user.save();
    }
    
   // await user.save();
    //await details.save();
   const newlyEditedData = {
    username:user.username,
    age:details.age,
    bio:details.bio,
    job:details.job,
    hobbies:details.hobbies,
    location:details.location,
    sex:details.sex,
    profilePic:user.profilePic,
   }
    await user.save();
    await details.save();
    return NextResponse.json({ newlyEditedData }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}

