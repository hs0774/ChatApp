import "dotenv/config";
import env from "../../../utils/validateEnv.ts";
import User from "../../../(models)/user.ts";
import Details from "../../../(models)/details.ts";
import Inbox from "../../../(models)/inbox.ts";
import Friendship from "@/app/(models)/friendship.ts";
import { z } from "zod";
import validator from "validator";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";

import OpenAI from 'openai';

export async function POST(req: NextRequest, res: NextResponse) { 
        const openai = new OpenAI({
            apiKey: env.OPEN_AI_SECRET_KEY,
        });

        try {
            const { prompt } = await req.json();
            const response = await openai.images.generate({
                model: 'dall-e-3',
                prompt,
                n: 1,
                size: '1024x1024',
                response_format: 'b64_json',
            });
            return NextResponse.json(response.data[0].b64_json);
        } catch(error) {
            console.log(error);
            return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
        }
} 
