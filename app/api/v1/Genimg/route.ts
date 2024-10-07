import "dotenv/config";
import env from "../../../utils/validateEnv.ts";
import { NextResponse, NextRequest } from "next/server";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";
import { promptZodSchema } from "@/app/utils/helperFunctions/zodSchemas.ts";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";
import OpenAI from "openai";
import FormData from "form-data";
import axios from "axios";

export async function POST(req: NextRequest, res: NextResponse) {
  const token = verifyToken(req.headers.get("authorization"));
  
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const openai = new OpenAI({
    apiKey: env.OPEN_AI_SECRET_KEY,
  });

  try {
    const body = await req.json();
    const validation = promptZodSchema.safeParse(body);

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
    if(sanitizedData.model === "dalle3") {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: sanitizedData.prompt as string,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });
    return NextResponse.json(response.data[0].b64_json, { status: 200 });
    } else if (sanitizedData.model === "stability") {
      const payload = {
        prompt: sanitizedData.prompt,
        output_format: "jpeg"
      };
      
      const response = await axios.postForm(
        `https://api.stability.ai/v2beta/stable-image/generate/ultra`,
        axios.toFormData(payload, new FormData()),
        {
          validateStatus: undefined,
          responseType: "arraybuffer",
          headers: { 
            Authorization: `Bearer ${env.STABLE_DIFFUSION_KEY}`, 
            Accept: "image/*" 
          },
        },
      );
      const arrayBuffer = await response.data;
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString('base64');

  // Send back the base64 string with the correct data URL prefix
  return NextResponse.json(base64Image ,{status:200});
    
    } else {
       console.log('hi')
    }
    return NextResponse.json({ message: `Something went wrong` }, { status: 400 });
   
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}

