import User from "../../../(models)/user.ts";
import Chat from "@/app/(models)/chat.ts";
import { chatZodSchema } from "@/app/utils/helperFunctions/zodSchemas.ts";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import { jwtDecode } from "jwt-decode";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";

  interface DecodedToken {
    id: string;
    email: string;
    username:string;
}
//TODO:
export async function POST(req: NextRequest, res: NextResponse) {

    try {
        const token = verifyToken(req.headers.get("authorization"));

        if (!token) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
    
        await dbConnect(); // Ensure database connection
        const body = await req.json(); //requested users id
        
        const validation = chatZodSchema.safeParse({title:body.title});
        
        //we can make this a function
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
        const decodedToken = jwtDecode(token) as DecodedToken; //token.id
        const user = await User.findById(decodedToken.id);
        if(!user){
            return NextResponse.json({ message: 'Not logged in ' }, { status: 400 });
        }

        const participantIds = body.newChat.map((user: { _id: string; }) => user._id);
        
        body.newChat.push({_id:user._id.toString(),username:user.username})
        participantIds.push(user._id.toString())
        
        if(body.newChat.length < 2) {
            const existingChat = await Chat.findOne({$and: [{ participants: body.newChat[0]._id }, { participants: body.newChat[1]._id }]});
            if(existingChat) {
                return NextResponse.json({ message: 'Chat exists' }, { status: 401 });
            }
        }                                             
        const newChatCreation = new Chat({
            title:sanitizedData.title,
            participants:participantIds, 
        }); 

        await newChatCreation.save();
        user.chats.push(newChatCreation._id);
        user.save();

        const newChatObj = {
            title:newChatCreation.title,
            participants:body.newChat,
            _id:newChatCreation._id,
            messages:[],
            leftChatCopy: false,
        }    
        
        return NextResponse.json({ newChatObj }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest, res: NextResponse) {
    try {
        const token = verifyToken(req.headers.get("authorization"));

        if (!token) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
    
        await dbConnect(); // Ensure database connection
        const body = await req.json(); //chat id 
        const decodedToken = jwtDecode(token) as DecodedToken; 

        const user = await User.findByIdAndUpdate(decodedToken.id,{$pull:{
            chats:body,
        }}); //user.id
        if(!user){
            return NextResponse.json({ message: 'Not logged in ' }, { status: 400 });
        }
        const chat = await Chat.findByIdAndUpdate(body,{$pull:{
            participants:decodedToken.id,
        }})
        
        if(!chat){
            return NextResponse.json({ message: 'Chat not found' }, { status: 400 });
        }

        if(chat.participants.length === 0 || chat.messages.length === 0) {
            await chat.deleteOne();
            return NextResponse.json({ message: 'Chat deleted successfully' }, { status: 200 });
        }
        return NextResponse.json({ message: 'success' }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
}
