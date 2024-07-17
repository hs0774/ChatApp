import "dotenv/config";
import env from "../validateEnv.ts";
import jwt from "jsonwebtoken";

export default function verifyToken(authHeader: string | null) {
  if (!authHeader) {
    return false;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return false;
  }

  jwt.verify(token, env.SECRET, (err: any, decodedToken: any) => {
    if (err) {
      return false;
    }
  });

  return token;
}
