import "dotenv/config";
import env from "../../../utils/validateEnv.ts";
import User from "../../../(models)/user";
import Details from "../../../(models)/details";
import bcrypt from "bcryptjs";
import { loginZodSchema } from "@/app/utils/helperFunctions/zodSchemas.ts";
import validator from "validator";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import jwt from "jsonwebtoken";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";

const createToken = (email: string | number, id: string,username:string) => {
  return jwt.sign({ email: email, id: id,username:username }, env.SECRET);
};


export async function POST(req: Request, res: Response) {
  try {
    await dbConnect();
    const body = await req.json();
    const validation = loginZodSchema.safeParse(body);

    if (!validation.success) {
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
      $or: [
        { username: sanitizedData.userDetail },
        { email: sanitizedData.userDetail },
      ],
    });

    if (
      !user ||
      !(await bcrypt.compare(sanitizedData.password as string, user.password))
    ) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = createToken(user.email, user._id,user.username);
    // const imageBuffer = Buffer.from(user.profilePic.buffer);
    // const base64Image = imageBuffer.toString('base64');
    // const imageDataURL = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json(
      {
        message: `User Created`,
        token,
        username: user.username,
        email: user.email,
        id: user._id,
        profilePic:user.profilePic,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}
