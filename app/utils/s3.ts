import "dotenv/config";
import env from "./validateEnv.ts";
import User from "../(models)/user.ts";
import { Wall } from "../(models)/wall.ts";
import fs from "fs";
import path from "path";
import AWS from "aws-sdk";
import mongoose from "mongoose";
import dbConnect from "./dbConnect.ts";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
AWS.config.update({
  accessKeyId: env.AWS_ACCESS_KEY,
  secretAccessKey: env.AWS_SECRET_KEY,
  region: env.AWS_BUCKET_REGION,
});
const s3 = new AWS.S3();

const uploadToS3 = async (filePath: string, keyPrefix: string, _id: any) => {
  try {
    const key = `${keyPrefix}/${_id}`;
    const fileStream = fs.createReadStream(filePath);
    const params = {
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ContentType: "image/jpeg", // Adjust content type if needed
    };
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // Return the S3 URL
  } catch (error) {
    console.error("Failed to upload: ", error);
    throw error;
  }
};

const migrateImages = async () => {
  try {
    await dbConnect();
    let count = 0;
    const imageFilenames = fs.readdirSync(
      path.join(__dirname, "../../public/sampleImgs")
    );
    // replace User Profile Pictures
    const users = await User.find({ profilePic: { $exists: true, $ne: null } });
    for (const user of users) {
      const filePath = path.join(
        __dirname,
        "../../public/sampleImgs",
        imageFilenames[count]
      );
      const s3Url = await uploadToS3(
        filePath,
        "profilePics",
        user._id.toString()
      );
      user.profilePic = s3Url;
      await user.save();
      count++;
    }

    // replace Wall Images
    const walls = await Wall.find({ image: { $exists: true, $ne: null } });
    for (const wall of walls) {
      const filePath = path.join(
        __dirname,
        "../../public/sampleImgs",
        imageFilenames[count]
      );
      const s3Url = await uploadToS3(
        filePath,
        "wallImages",
        wall._id.toString()
      );
      wall.image = s3Url;
      count++;
      // Migrate Reply Images within Wall
      for (const reply of wall.replies) {
        if (reply.image) {
          const filePath = path.join(
            __dirname,
            "../../public/sampleImgs",
            imageFilenames[count]
          );
          const replyS3Url = await uploadToS3(
            filePath,
            "replyImages",
            reply._id.toString()
          );
          reply.image = replyS3Url;
          count++;
        }
      }

      await wall.save();
      // count++;
    }

    console.log("replacement completed successfully.");
  } catch (err) {
    console.error("replacement failed:", err);
  } finally {
    mongoose.disconnect();
  }
};

migrateImages().catch((err) => {
  console.error("replacement script failed:", err);
  mongoose.disconnect();
});
