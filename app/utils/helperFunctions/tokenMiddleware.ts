import { NextResponse, NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import verifyToken from "@/app/utils/helperFunctions/verifyToken.ts";

interface DecodedToken {
    id: string;
    email: string;
    username:string;
}

export async function verifyAuthToken(req: NextRequest) {
  const token = req.headers.get("authorization");

  if (!token) {
    return { valid: false, response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const verifiedToken = verifyToken(token);
  if (!verifiedToken) {
    return { valid: false, response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const decodedToken = jwtDecode(token) as DecodedToken;
  return { valid: true, decodedToken };
}