import "dotenv/config";
import env from "../../../utils/validateEnv.ts";
import User from "../../../(models)/user";
import Details from "../../../(models)/details";
import bcrypt from "bcryptjs";
import { signupZodSchema } from "@/app/utils/helperFunctions/zodSchemas.ts";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import jwt from "jsonwebtoken";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";
import {uploadToS3} from '../../../utils/helperFunctions/s3ImgUpload.ts'

const createToken = (email: string | number) => {
  return jwt.sign({ email: email }, env.SECRET);
};



export async function POST(req: Request, res: Response) {
  try {
    await dbConnect();
    const body = await req.json();
    console.log(body);
    const validation = signupZodSchema.safeParse(body);

    //we can make this a function
    if (!validation.success) {
      console.log(validation.error);
      return NextResponse.json(validation.error.errors, { status: 400 });
    }
    const sanitizedData = sanitizeData(validation);

    if (!sanitizedData) {
      return NextResponse.json(
        { message: "Issue with validating data" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      username: sanitizedData.username,
      email: sanitizedData.email,
    });
    if (user) {
      return NextResponse.json(
        { message: `User already exists` },
        { status: 400 }
      );
    }
    const hash = await bcrypt.hash(sanitizedData.password as string, 10);
    //console.log(sanitizedData)
    const details = new Details({
      hobbies: sanitizedData.hobbies,
      job: sanitizedData.occupation,
      interests: sanitizedData.interests,
      bio: sanitizedData.bio,
      age: sanitizedData.age,
      sex: sanitizedData.sex,
      location: sanitizedData.location,
    });
    await details.save();

    const newUser = new User({
      email: sanitizedData.email,
      username: sanitizedData.username,
      password: hash,
      details: details._id,
    });
    await newUser.save();

    if(body.image) {

      const s3Url = await uploadToS3(body.image, 'profilePics', newUser._id);
      newUser.profilePic=s3Url;
      console.log(s3Url);
      await newUser.save();
    } else {
      newUser.profilePic='https://newchatapp.s3.amazonaws.com/profilePics/background2.jpg';
      await newUser.save();
    }
    
    const token = createToken(sanitizedData.email as string);
    return NextResponse.json(
      {
        message: `User Created`,
        token,
        username: sanitizedData.username,
        email: sanitizedData.email,
        id: newUser._id,
        profilePic:newUser.profilePic,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}