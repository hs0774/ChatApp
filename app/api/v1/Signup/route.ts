import User from "../../../(models)/user";
import Details from "../../../(models)/details";
import bcrypt from 'bcryptjs';
import {z} from 'zod';
import validator from 'validator';
import { NextResponse,NextRequest } from "next/server";
import dbConnect from "@/app/utils/DbConnect";

const zodschema = z.object({
  email: z.string().email().max(50),
  username: z.string().min(2,"Name is required").max(50).trim(),
  password: z.string().min(8,"Password must be atleast 8 characters").max(50),
  occupation: z.string().max(50),
  hobbies: z.array(z.string()),
  bio: z.string().max(50),
  interests: z.string().max(240),
  location: z.string().max(100),
  sex: z.string().max(6),
  age: z.number().int().min(18).max(120),
})

export async function POST(req:Request,res:Response) {
    try {
     await dbConnect();
     const body = await req.json();
     const validation = zodschema.safeParse(body);

     if(!validation.success) {
        return NextResponse.json(validation.error.errors, {status:400});
     } else {
        const sanitizedData : { [key: string]: string | number } = {};
        for (const [key, value] of Object.entries(validation.data)) {
            if (typeof value === 'string') {
                sanitizedData[key] = validator.escape(value.trim());
            } else {
                sanitizedData[key] = validator.escape(String(value).trim());
            }
        }
        const user = await User.findOne({ username: sanitizedData.username, email: sanitizedData.email });
        if(user){
            return NextResponse.json({ message: `User already exists`}, {status:400})
        }
        const hash = await bcrypt.hash(sanitizedData.password as string, 10);
        console.log(sanitizedData)
        const details = new Details({
            hobbies:sanitizedData.hobbies,
            job:sanitizedData.occupation,
            interests:sanitizedData.interests,
            bio:sanitizedData.bio,
            age:sanitizedData.age,
            sex:sanitizedData.sex,
            location:sanitizedData.location,
        })
        await details.save();

        const newUser = new User({
            email:sanitizedData.email,
            username:sanitizedData.username,
            password:hash,
            details:details._id,
        })
        await newUser.save();
     }
     return NextResponse.json({ message: `User Created`}, {status:201});
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: `Error: ${error}`}, {status:404});
    }
}
//validate and sanitize the data,
// then we need to check if username,
//or email exists,pass error if it exists, 
// then we encrypt the password with brcrypt,

//create a user with user schema, fill the user details that are also passed,
// use jwt to create a token, and pass it to client