import 'dotenv/config';
import env from '../../../../utils/validateEnv.ts'
//import User from "../../../../(models)/user.ts";
import User from '@/app/(models)/user.ts';
import Details from "../../../../(models)/details.ts";
import { NextResponse,NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import {z} from 'zod';
import validator from 'validator';
import jwt from "jsonwebtoken";
import { jwtDecode } from 'jwt-decode';
import verifyToken from '@/app/utils/helperFunctions/verifyToken.ts';
import Friendship from '@/app/(models)/friendship.ts';
import sanitizeData from '@/app/utils/helperFunctions/sanitizeData.ts';

export async function GET(req:NextRequest,res:NextResponse) {

    try {
        const token = verifyToken(req.headers.get('authorization'));
        
        // if (!authHeader) {
        //     return NextResponse.json({ message: 'Unauthorized' });
        // }

        // const token = authHeader.split(' ')[1];

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' });
        }

        // jwt.verify(token, env.SECRET, (err: any, decodedToken: any) => {
        //     if (err) {
        //         return NextResponse.json({ message: 'Invalid token' });
        //     }
        // });

        await dbConnect(); // Ensure database connection
        const body = req.url.slice(req.url.lastIndexOf('/') + 1);
        console.log(body)
        const decodedToken = jwtDecode(token);
        console.log
        console.log(decodedToken);
        const user = await User.findById(body).populate('details').exec();

        let status;
        if(body !== decodedToken.id){
            const friendDocCheck = await Friendship.findOne({
                $or: [
                  { $and: [{ user: body }, { user2: decodedToken.id }] }, // Check if user is requestor and user2 is requestee
                  { $and: [{ user: decodedToken.id }, { user2: body }] } // Check if user is requestee and user2 is requestor
                ]
              });
            status = friendDocCheck?.status;
        }
        if (!user) {
            return NextResponse.json({ message: 'User not found' });
        }

        const binaryData = Buffer.from(user.profilePic);

        // Convert binary data into Base64 string
        const base64Image = binaryData.toString('base64');
        const imageDataURL = `data:image/jpeg;base64,${base64Image}`;
        const populatedFriends = await Promise.all(user.friends.map(async (friend) => {
            const friendUser = await User.findById(friend).exec();
            return {
                username: friendUser?.username, 
                url: `/profile/${friendUser?._id}`
            };
        }));
        const filteredUser = {
            _id: user._id,
            username: user.username,
            chats:user.chats,
            details:user.details,
            email:user.email,
            friends:user.friends,
            inbox:user.inbox,
            nonFriendsChat:user.nonFriendsChat,
            status:user.status
        };

    return NextResponse.json({filteredUser,imageDataURL,populatedFriends,status},{status:200});

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: `Error: ${error}`}, {status:500});
    }
}

const zodschema = z.object({
    username: z.string().min(2,"Name is required").max(50).trim(),
    age: z.number().int().min(18).max(120),
    bio: z.string().max(50),
    occupation: z.string().max(50),
    location: z.string().max(100),
    sex: z.string().max(7),    
})

export async function PUT(req:NextRequest,res:NextResponse) {
    try {

        const token = verifyToken(req.headers.get('authorization'));
        
        // if (!authHeader) {
        //     return NextResponse.json({ message: 'Unauthorized' });
        // }

        // const token = authHeader.split(' ')[1];

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' });
        }

        // jwt.verify(token, env.SECRET, (err: any, decodedToken: any) => {
        //     if (err) {
        //         return NextResponse.json({ message: 'Invalid token' });
        //     }
        // });

        await dbConnect();
        const body = await req.json();
        //console.log(body.editDetails)
        const validation = zodschema.safeParse(body.editDetails);

        if(!validation.success) {
            return NextResponse.json(validation.error.errors, {status:404});
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
            if(!sanitizedData) {
                return NextResponse.json({message:'Issue with validating data'},{status:400});
            }
            //console.log(sanitizedData)
            const user = await User.findById(body.id);
            if (!user) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }

            const details = await Details.findById(user.details);

            if (!details) {
                return NextResponse.json({ message: 'Details not found' }, { status: 404 });
            }

            const usernameCheck = await User.findOne({ 
                username: { $regex: new RegExp(`^${sanitizedData.username}$`, 'i') },
                _id: { $ne: user._id } // Exclude the current user's ID
            });
            
            if (usernameCheck) {
                return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
            }
            

            user.username = sanitizedData.username as string;
            details.age = sanitizedData.age as number;
            details.bio = sanitizedData.bio as string;
            details.job = sanitizedData.occupation as string;
            details.location = sanitizedData.location as string;
            details.sex = sanitizedData.sex as "Male" | "Female" | "Other";

            await user.save();
            await details.save();
            return NextResponse.json({ message: 'Success' }, { status: 200 });      
        
    } catch(error) {
        console.error('Error:', error);
        return NextResponse.json({ message: `Error: ${error}`}, {status:500});
    }
}


//         const authHeader = req.headers['authorization']
//         const token = authHeader && authHeader.split(' ')[1];

//         if(!token) {
//             return res.status(401).json({message:'Unauthorized'});
//         }

//         jwt.verify(token, process.env.SECRET, (err,decodedToken) => {
//             if(err) {
//             return res.status(403).json({message: "Invalid token"});
//             }
//             req.user = decodedToken;
//         });
