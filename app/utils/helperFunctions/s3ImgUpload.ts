import "dotenv/config";
import env from "../validateEnv.ts";
import AWS from "aws-sdk";
import * as stream from "stream";
import { v4 as uuidv4 } from "uuid";

AWS.config.update({
  accessKeyId: env.AWS_ACCESS_KEY,
  secretAccessKey: env.AWS_SECRET_KEY,
  region: env.AWS_BUCKET_REGION,
});
export const s3 = new AWS.S3({ signatureVersion: "v4" });

export async function uploadToS3(
  base64: string,
  keyPrefix: string,
  _id: string
) {
  try {
    // Remove the "data:image/jpeg;base64," part from the base64 string
    const base64Data = base64.replace(/^data:image\/jpeg;base64,/, "");

    // Decode the base64 data into a buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Create a readable stream from the buffer
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    // Construct parameters for S3 upload
    const key = `${keyPrefix}/${uuidv4()}`; // Ensure the key has .jpg extension
    const params = {
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
      Body: bufferStream,
      ContentType: "image/jpeg", // Set content type to JPEG
    };

    // Upload to S3
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // Return the S3 URL
  } catch (error) {
    console.error("Failed to upload: ", error);
    throw error;
  }
}

//pre signed url
export async function generateUploadURL(userId: string, location: string) {
  const key = `${location}/${userId}`;

  const params = {
    Bucket: env.AWS_BUCKET_NAME,
    Key: key,
    Expires: 120,
  };
  const uploadURL = await s3.getSignedUrlPromise("putObject", params);
  return uploadURL;
}
