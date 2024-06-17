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
    console.log(body);
    if(body === '') {
      let num;
      do {
        num = Math.floor(Math.random() * 20) + 1; // Random number between 1 and 20
      } while (num === 1 || num === 9);
      const user = await User.find().skip(1).skip(9).limit(20);
      const token = createToken(user[num].email, user[num]._id,user[num].username);
      return NextResponse.json(
        {
          message: `User Created`,
          token,
          username: user[num].username,
          email: user[num].email,
          id: user[num]._id,
          profilePic:user[num].profilePic,
        },
        { status: 201 }
      );
    }
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

    const token = createToken(user.email, user._id,user.username,);

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
