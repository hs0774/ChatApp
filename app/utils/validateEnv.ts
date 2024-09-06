import { cleanEnv } from "envalid";
import { str } from "envalid";

export default cleanEnv(process.env, {
  MONGODB_URI: str(),
  SECRET: str(),
  AWS_BUCKET_NAME: str(),
  AWS_BUCKET_REGION: str(),
  AWS_ACCESS_KEY: str(),
  AWS_SECRET_KEY: str(),
  OPEN_AI_SECRET_KEY: str(),
});
