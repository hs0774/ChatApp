import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors'; // Import cors package
import "dotenv/config";
import env from "../../../utils/validateEnv.ts";
 import User from '../../../(models)/user.ts';
// import Details from "../../../(models)/details.ts";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "../../../utils/dbConnect.ts";

import { jwtDecode } from "jwt-decode";
import verifyToken from "../../../utils/helperFunctions/verifyToken.ts";
// import Friendship from "@/app/(models)/friendship.ts";
import sanitizeData from "../../../utils/helperFunctions/sanitizeData.ts";
import { messageZodSchema } from "../../../utils/helperFunctions/zodSchemas.ts"
import Chat from '../../../(models)/chat.ts';
import mongoose, { ObjectId } from 'mongoose';


interface DecodedToken {
    id: string;
    email: string;
    username:string;
}

const server = http.createServer((req, res) => {
  // Handle HTTP requests if needed
});

// Enable CORS for WebSocket server


const io = new Server(server, {
    cors: {
        origin:'http://localhost:3000',
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }
});
// io.on('request', cors());
io.on('connection', (socket) => {
  console.log('A user connected',socket.id);

  // Handle chat messages
  socket.on('joinChat',({chatId,userId}) => {
    socket.join(chatId);
   // socket.userId=userId;
    console.log('hoi')
    console.log(`${userId} joined chat ${chatId}`)
  })

  socket.on('get-message',async ({message,currentChatId,token}) => {
    console.log('hiii')


    const verifiedToken = verifyToken(token);
   
    if (!verifiedToken) {
        console.log('unverified')
      return; 
      //NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    } //verify token 

    await dbConnect(); // Ensure database connection
    const decodedToken = jwtDecode(verifiedToken) as DecodedToken; //extract token
    const chat = await Chat.findById(currentChatId)
    console.log(decodedToken)
    if (!chat) {
        return;
        //NextResponse.json({ message: "Chat not found" }, { status: 404 });
    } // find chat or return 
    //console.log({message:message});
    const validation = messageZodSchema.safeParse({message});
    
    if (!validation.success) {
        console.log(validation.error)
      return;
      //NextResponse.json(validation.error.errors, { status: 400 });
    }
    
    const sanitizedData = sanitizeData(validation); 

    if (!sanitizedData) {
      return;
    //   NextResponse.json(
    //     { message: "Issue with validating data" },
    //     { status: 400 }
    //   );
    } //validate data sanitizedData.message
    
    if(chat.messages.length === 0) {
        for (const participantId of chat.participants) {
            if (participantId.toString() !== decodedToken.id) {
                const user = await User.findById(participantId);
                if (user) {
                    user.chats.push(chat._id);
                    await user.save();
                }
            }
        }
    }
    const senderObjectId = new mongoose.Types.ObjectId(decodedToken.id);

    const newMessage = {
        sender: senderObjectId ,
        content: sanitizedData.message as string,
        createdAt: new Date(),
    } //make sure to modify after creation and add user name to sender 
    chat.messages.push(newMessage);
    await chat.save();
    
    const newlySavedMessage = {
        //_id:chat.messages[chat.messages.length-1]._id,
        sender: {_id:senderObjectId.toString(),username:decodedToken.username},
        content: sanitizedData.message as string,
        createdAt: chat.messages[chat.messages.length-1].createdAt,
    }

    
   // console.log(username)
    io.to(currentChatId).emit('get-message', newlySavedMessage,currentChatId); // Broadcast the message to all connected clients
  });

  
  //socket.on('',() => {})

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3001, () => {
  console.log('WebSocket server listening on port 3001');
});
