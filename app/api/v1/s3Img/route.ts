import "dotenv/config";
import User from "@/app/(models)/user.ts";
import { NextResponse, NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";
import { wallPostZodSchema } from "@/app/utils/helperFunctions/zodSchemas.ts";
import {Wall} from "@/app/(models)/wall.ts";
import {uploadToS3} from "../../../utils/helperFunctions/s3ImgUpload.ts"

interface DecodedToken {
  id: string;
  email: string;
  username:string;
}


export async function POST(req: NextRequest, res: NextResponse) { 
    try {
    const token = verifyToken(req.headers.get("authorization"));
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" },{status:401});
    }

    const decodedToken = jwtDecode(token) as DecodedToken; //id username email
    const user = await User.findById(decodedToken.id);

    if(!user) {
        return NextResponse.json({ message: "User not found" },{status:404});
    }
    const body = await req.json();
    let validation;
    let sanitizedData;
    if (body.post !== '') {
      validation = wallPostZodSchema.safeParse(body);
      
      if (!validation.success) {
        console.log(validation.error)
        return NextResponse.json(validation.error.errors, { status: 400 });
      }
      sanitizedData = sanitizeData(validation); 
      if (!sanitizedData) {
        return NextResponse.json(
            { message: "Issue with validating data" },
            { status: 400 }
          );
      } 
    }
    console.log(sanitizedData); // posts work 
    const newWall = new Wall({
        user:decodedToken.id,
        content:sanitizedData?.post,
    })

    newWall.save();
    user.wall.push(newWall._id);
    user.save();
    
    console.log(body.hasImage)
    if(!body.hasImage) {
        return NextResponse.json({ url:null,wallId:newWall._id },{status:200});
    }
   // const url = await generateUploadURL(newWall._id.toString(),'wallImages');
    const url = await uploadToS3(body.image, 'wallImages', newWall._id.toString());
    
    console.log(url);
    return NextResponse.json({ url,wallId:newWall._id },{status:200});
    } catch(error) {
        console.log(error);
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
}