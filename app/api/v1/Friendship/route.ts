import 'dotenv/config';
import env from '../../../utils/validateEnv.ts'
import User from "../../../(models)/user.ts";
import Details from "../../../(models)/details.ts";
import Inbox from "../../../(models)/inbox.ts"
import Friendship from '@/app/(models)/friendship.ts';
import {z} from 'zod';
import validator from 'validator';
import { NextResponse,NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import jwt from "jsonwebtoken";
import { jwtDecode } from 'jwt-decode';
import verifyToken from '@/app/utils/helperFunctions/verifyToken.ts';


export async function POST(req:Request,res:Response) {
    try {
        const token = verifyToken(req.headers.get('authorization'));
        
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' },{status:401});
        }

        await dbConnect(); // Ensure database connection
        const body = await req.json(); //requested users id 
        console.log('requested',body) //
        const decodedToken = jwtDecode(token); //token.id 
        console.log('requestor',decodedToken.id);
        const [requestor,requestee] = await Promise.all([
            User.findById(decodedToken.id),
            User.findById(body),
        ])

        if(!requestor || !requestee) {
            return NextResponse.json({ message: `Error`}, {status:400});
        }

        const friendDocCheck = await Friendship.findOne({
            $or: [
              { $and: [{ user: requestor._id }, { user2: requestee._id }] }, // Check if user is requestor and user2 is requestee
              { $and: [{ user: requestee._id }, { user2: requestor._id }] } // Check if user is requestee and user2 is requestor
            ]
          });

        if(!friendDocCheck) {
            const friendDocument = new Friendship({
                user:requestor._id,
                user2:requestee._id,
                status:'pending',
            })
            await friendDocument.save();
        }  

        const inbox = new Inbox({
            sender: requestor._id,
            receiver: requestee._id,
            message: `${requestor.username} has sent you a friend request`,
            type:'friendRequest', 
        }) //let users send multiple messages 

        await inbox.save();
        requestee.inbox.push(inbox._id);
        requestee.save();

        return NextResponse.json({ message: `Req works`}, {status:200});
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: `Error: ${error}`}, {status:500});
    }
} //get user id, get requested persons id, create a friendship document
//create an inbox and send it to the request persons inbox  

// export async function PATCH(req:Request,res:Response) {
//     try {
//         await dbConnect(); 
//         const body = await req.json();
//         console.log(body);
//         const [user1,user2] = await Promise.all([
//             User.find({username:body.sender}),
//             User.find({username:body.receiver})
//         ])
//         if(!user1 || !user2) {
//             return NextResponse.json({message:'User doesnt exist'}, {status:400}); 
//         }
//         const friendSchema = await Friendship.find({sender:user1._id,receiver:user2._id})

//         return NextResponse.json({message:'success'}, {status:200});
//     } catch (error) {
//         console.log(error)
//         return NextResponse.json({ message: `Error: ${error}`}, {status:500});
//     }
// } 
//change document to accepted and add users to respective friend arrays,first 
//make create friend req so  we know which user is user and which is user2 in friendship
//schema


export async function DELETE(req:Request,res:Response) {
    try {
        await dbConnect(); 
        const body = await req.json();
        console.log(body);

        return NextResponse.json({message:'success'}, {status:200});
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: `Error: ${error}`}, {status:500});
    }
} //delete document but same thing with PATCH


