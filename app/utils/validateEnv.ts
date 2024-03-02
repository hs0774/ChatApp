import { cleanEnv } from "envalid";
import { str } from "envalid";

export default cleanEnv(process.env, {
    MONGODB_URI:str()
})