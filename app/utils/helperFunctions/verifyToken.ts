import 'dotenv/config';
import env from '../validateEnv.ts'
import jwt from "jsonwebtoken";

export default function verifyToken(authHeader:string|null) {
    if (!authHeader) {
        //return NextResponse.json({ message: 'Unauthorized' },{status:401});
        return false
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        //return NextResponse.json({ message: 'Unauthorized' },{status:401});
        return false;
    }

    jwt.verify(token, env.SECRET, (err: any, decodedToken: any) => {
        if (err) {
            //return NextResponse.json({ message: 'Invalid token' },{status:401});
            return false; 
        }
    });

    return token;
}