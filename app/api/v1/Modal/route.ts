import User from "../../../(models)/user.ts";
import Friendship from "@/app/(models)/friendship.ts";
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/utils/dbConnect";
import { jwtDecode } from "jwt-decode";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";

//friend request
interface DecodedToken {
  id: string;
  email: string;
  username:string;
}
export async function POST(req: Request, res: Response) {
  try {
    const token = verifyToken(req.headers.get("authorization"));

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect(); // Ensure database connection
    const body = await req.json(); //requested users id
    console.log(body);
    const decodedToken = jwtDecode(token) as DecodedToken; //id username email
    const user = await User.findById(decodedToken.id);
    if (!user) {
        return NextResponse.json({ message: "User not found" });
    }
      
    for (const like of body) {
            const friendDocCheck = await Friendship.findOne({
        $or: [
          { $and: [{ user: user._id }, { user2: like._id }] }, // Check if user is requestor and user2 is requestee
          { $and: [{ user: like._id }, { user2: user._id }] }, // Check if user is requestee and user2 is requestor
        ],
      });
    if(friendDocCheck) {
       like.status = friendDocCheck.status;
    }
    }
    console.log(body);

    return NextResponse.json({ likes:body }, { status: 200 });
    }  catch(error) {
        console.error("Error:", error);
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
    }
}