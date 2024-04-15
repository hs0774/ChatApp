import "dotenv/config";
import env from "../../../utils/validateEnv.ts";
import User from "../../../(models)/user";
import Details from "../../../(models)/details";
import bcrypt from "bcryptjs";
import { z } from "zod";
import validator from "validator";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import jwt from "jsonwebtoken";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";

const createToken = (email: string | number, id: string) => {
  return jwt.sign({ email: email, id: id }, env.SECRET);
};

const zodschema = z.object({
  userDetail: z
    .string()
    .min(2, "Name is required")
    .max(50)
    .refine((value) => {
      return (
        validator.isEmail(value) ||
        (typeof value === "string" && value.length <= 50)
      );
    }, "Must be a valid email address or a string with max length 50"),
  password: z.string().min(8, "Password must be at least 8 characters").max(50),
});

export async function POST(req: Request, res: Response) {
  try {
    await dbConnect();
    const body = await req.json();
    const validation = zodschema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.errors, { status: 400 });
    }

    const sanitizedData = sanitizeData(validation);
    // const sanitizedData : { [key: string]: string | number } = {};
    // for (const [key, value] of Object.entries(validation.data)) {
    //     if (typeof value === 'string') {
    //         sanitizedData[key] = validator.escape(value.trim());
    //     } else {
    //         sanitizedData[key] = validator.escape(String(value).trim());
    //     }
    // }
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

    const token = createToken(user.email, user._id);
    return NextResponse.json(
      {
        message: `User Created`,
        token,
        username: user.username,
        email: user.email,
        id: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}
