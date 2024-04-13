import 'dotenv/config';
import env from '../../../../utils/validateEnv.ts'
import User from "../../../../(models)/user.ts";
import Details from "../../../../(models)/details.ts";
import Inbox from "../../../../(models)/inbox.ts"
import Friendship from '@/app/(models)/friendship.ts';
import {z} from 'zod';
import validator from 'validator';
import { NextResponse,NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import jwt from "jsonwebtoken";


export async function GET(req:NextRequest,res:NextResponse) {
    try {
        
        await dbConnect(); 

        //const body = await req.json();
        const body = req.url.slice(req.url.lastIndexOf('/') + 1);
        const inbox = await Inbox;
        const user = await User.findById(body).populate({path:'friends',select:'username'})
        .populate({
            path: 'inbox',
            populate: { 
                path: 'sender receiver',
                select: 'username _id' 
            },
        })
        .exec()

        if(!user){
            return NextResponse.json({ message: `Error:`}, {status:500});
        }

        console.log(user.friends);
        
       return NextResponse.json({message:user.inbox,friends:user.friends}, {status:200});

    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: `Error: ${error}`}, {status:400});
    }
}