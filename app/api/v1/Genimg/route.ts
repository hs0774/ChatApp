import "dotenv/config";
import env from "../../../utils/validateEnv.ts";
import { NextResponse, NextRequest } from "next/server";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";
import { promptZodSchema } from "@/app/utils/helperFunctions/zodSchemas.ts";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";
import OpenAI from "openai";

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
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: sanitizedData.prompt as string,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });
    return NextResponse.json(response.data[0].b64_json);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}
