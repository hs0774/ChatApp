import "dotenv/config";
import env from "../../../../../utils/validateEnv.ts";
import User from "../../../../../(models)/user.ts";
import Details from "../../../../../(models)/details.ts";
import Inbox from "../../../../../(models)/inbox.ts";
import Friendship from "@/app/(models)/friendship.ts";
import { chatZodSchema } from "@/app/utils/helperFunctions/zodSchemas.ts";
import validator from "validator";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";
import Chat from "@/app/(models)/chat.ts";

// export async function PUT(req: NextRequest, res: NextResponse) {
//     try {
//         const token = verifyToken(req.headers.get("authorization"));

//         if (!token) {
//         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//         }

//         await dbConnect(); // Ensure database connection
//         const body = await req.json(); // 'chatobj'
//         console.log(body.currentChat._id.toString());
//         const decodedToken = jwtDecode(token);
//         const user = await User.findById(decodedToken.id)
//         const chat = await Chat.findByIdAndUpdate(body.currentChat._id, { $pull: { participants: decodedToken.id } });

//         if (!chat) {
//             return NextResponse.json({ message: "Chat not found" }, { status: 404 });
//         }
//         if(!user) {
//             return NextResponse.json({ message: "User not found" }, { status: 404 });
//         }

//         const copyChat = new Chat({
//             title:chat.title,
//             participants:[decodedToken.id],
//             messages:chat.messages,
//             leftChatCopy:true,
//         })

//         const newChatObj = {
//             title:chat.title,
//             participants:[{_id:decodedToken.id,username:user?.username}],
//             messages:body.currentChat.messages,
//             leftChatCopy:true,
//             _id:copyChat._id,
//             __v:copyChat.__v,
//         }

//         await chat.save();
//         await copyChat.save();
//         //so what i want to do after i create a copy chat object, i want to 
//         //find the chat._id reference within user.chats, then i replace 
//         // it with copyChat._id

//         return NextResponse.json({ message: "User removed from chat and copy created", copyChat:newChatObj }, { status: 200 });
//     } catch (error) {
//         console.log(error);
//         return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
//     }
// }
interface DecodedToken {
    id: string;
    email: string;
    username:string;
}

export async function PUT(req: NextRequest, res: NextResponse) {
    try {
        const token = verifyToken(req.headers.get("authorization"));

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect(); // Ensure database connection
        const body = await req.json(); // 'chatobj'
        const decodedToken = jwtDecode(token) as DecodedToken;
        console.log(decodedToken);
        if(body.currentChat.leftChatCopy) {
            return NextResponse.json({ message: "Chat already left" }, { status: 401 });
        }
        const user = await User.findById(decodedToken.id);
        const chat = await Chat.findByIdAndUpdate(body.currentChat._id, { $pull: { participants: decodedToken.id } });

        if (!chat) {
            return NextResponse.json({ message: "Chat not found" }, { status: 404 });
        }
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const copyChat = new Chat({
            title: chat.title,
            participants: [decodedToken.id],
            messages: chat.messages,
            leftChatCopy: true,
        });

        await copyChat.save();

        // Find the index of the original chat ID in the user's chats array
        const chatIndex = user.chats.findIndex(chatId => chatId.equals(body.currentChat._id));

        if (chatIndex !== -1) {
            // Replace the original chat ID with the copy chat ID at the same index
            user.chats.splice(chatIndex, 1, copyChat._id);
        } else {
            // If the original chat ID was not found, just push the copy chat ID
            user.chats.push(copyChat._id);
        }

        // Save the updated user object
        await user.save();

        // Construct the new chat object to include in the response
        const newChatObj = {
            title: chat.title,
            participants: [{ _id: decodedToken.id, username: user.username }],
            messages: body.currentChat.messages,
            leftChatCopy: true,
            _id: copyChat._id,
            __v: copyChat.__v,
        };

        return NextResponse.json({ message: "User removed from chat and copy created", copyChat: newChatObj }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
}
