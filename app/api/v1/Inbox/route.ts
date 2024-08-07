import User from "../../../(models)/user.ts";
import Inbox from "../../../(models)/inbox.ts";
import { inboxZodSchema } from "@/app/utils/helperFunctions/zodSchemas.ts";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import sanitizeData from "@/app/utils/helperFunctions/sanitizeData.ts";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";

export async function DELETE(req: NextRequest, res: NextResponse) {
  try {
    await dbConnect();
    const body = await req.json();

    const deleteInbox = body.messagesToDelete.map(async (item: string) => {
      const inbox = await Inbox.deleteOne({ _id: item });
    });

    const user = await User.findByIdAndUpdate(
      body.id,
      { $pull: { inbox: { $in: body.messagesToDelete } } },
      { new: true }
    );

    console.log(body);
    return NextResponse.json(
      { message: "Messages deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}

//this is the post that creates a message for a user
export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const token = verifyToken(req.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    console.log(body);
    const validation = inboxZodSchema.safeParse(body.formData);

    if (!validation.success) {
      console.log(validation.error.errors);
      return NextResponse.json(validation.error.errors, { status: 400 });
    }
    const sanitizedData = sanitizeData(validation);

    if (!sanitizedData) {
      return NextResponse.json(
        { message: "Issue with validating data" },
        { status: 400 }
      );
    }
    console.log(sanitizedData);
    const [user, user2] = await Promise.all([
      User.findOne({ username: sanitizedData.sender }),
      User.findOne({ username: sanitizedData.receiver }),
    ]);
    if (!user || !user2) {
      return NextResponse.json({ message: `user not found` }, { status: 400 });
    }
    const newInbox = new Inbox({
      sender: user.id,
      receiver: user2.id,
      message: sanitizedData.message,
      type: "message",
    });
    await newInbox.save();
    user2.inbox.push(newInbox._id);
    await user2.save();
    //use this data to create an inbox message and place in recipients inbox
    return NextResponse.json({ message: `ok` }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}
