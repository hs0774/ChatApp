import User from "../../../../../(models)/user.ts";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";
import Chat from "@/app/(models)/chat.ts";

//add users
export async function PATCH(req: NextRequest, res: NextResponse) {
  try {
    const token = verifyToken(req.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect(); // Ensure database connection
    const body = await req.json(); // 'chatid' + {_id:'',username:''}

    const chat = await Chat.findById(body.id);

    if (!chat) {
      return NextResponse.json({ message: `Chat not found` }, { status: 404 });
    }

    if (chat.leftChatCopy) {
      return NextResponse.json(
        { message: "Chat already left" },
        { status: 401 }
      );
    }

    for (const user of body.addedUsers) {
      let existingUser = await User.findById(user._id);
      if (existingUser) {
        chat.participants.push(user._id);
        await chat.save();
        existingUser.chats.push(chat._id);
        await existingUser.save(); // Save changes to the user
      }
    }
    return NextResponse.json({ message: `Friends Added!` }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}
