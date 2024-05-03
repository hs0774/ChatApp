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
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";

//DONE
//GET chats for user who is logged in 
  // o basically get the token info and return the user chats array but populated


//TODO:
export async function POST(req: NextRequest, res: NextResponse) {
    //receive token, verify it, get the id, 
    //also receieve the usernames of the new chat members
    //see if the chat exists if its jsut one user like we verified on client
    // if exist return with error,
    // if not exist create the chat document, add the participants
    // and add the chat doucment reference to the creators chat only
}

//POST create a new chat //POST save messages to chat might be able to be PUT/UPDATE
//so the way i have it in the chat will be i dont save a chat unless the creator sends 
//message, so that means when the user presses submit i take {currentChat} and the message,
// i find currentchat by id, if no exist create it and add the message, then add the ref
// to all the users 
//this might be one post req and we can first check if there is one message in chat, 
//when in the client side a user creates a new chat,after the first message is sent
//create the chat document and add the reference to each user in the chat 
//the initial creation of the chat will be here in post and then it will be put 
//when the first message from the creator of the chat sends a message. 
//first at least just start with the chat creation one step at a time 

//so i just made the skeleton for creating a chat, what else do i need?
// for now skip the add users to chat when the first message is sent since 
//this might be a websocket thing as the chat is created and is running actively
//so next we have is add more members and to leave the chat
//adding more members is an update thing 

//  LEAVE CHAT and leaving would be deleting, we 
//should also consider the document copying so the user has the chat unless they delete it
//leave can be you leave the chat a copy is made and has left on as true,so you cant sned
//more messages, also the chat would lose all its participants, with only a reference to the
//messages, yeah sure they can add you back but for my app it will be a new chat
//

//TLDR 
// FINISH CREATE CHAT DOCUMENT, 
// NEXT WORK ON ADD MEMBERS, 
// NEXT LEARN WEBSOCKETS,
//NEXT SEND REAL TIME MESSAGES TO CHAT AND PUSH CHAT TO USERS INBOX IF FIRST MESSAGE,
//LEAVE UPDATES CHAT I GUESS AND CREATES COPY WITH NO MEMBERS AND LEFT:TRUE SO NO MESSAGES,
//ADDS OR LEAVES. X WILL DELETE CHAT DOCUMENT WHETHER COPY OR NOT. FLESH OUT LEFT:T/F MORE