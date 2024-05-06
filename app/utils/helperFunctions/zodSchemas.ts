import validator from "validator";
import { z } from "zod";

export const signupZodSchema = z.object({
    email: z.string().email().max(50),
    username: z.string().min(2, "Name is required").max(50).trim(),
    password: z.string().min(8, "Password must be atleast 8 characters").max(50),
    occupation: z.string().max(50),
    hobbies: z.array(z.string()),
    bio: z.string().max(50),
    interests: z.string().max(240),
    location: z.string().max(100),
    sex: z.string().max(6),
    age: z.number().int().min(18).max(120),
  });

  export const profileZodSchema = z.object({
    username: z.string().min(2, "Name is required").max(50).trim(),
    age: z.number().int().min(18).max(120),
    bio: z.string().max(50),
    occupation: z.string().max(50),
    location: z.string().max(100),
    sex: z.string().max(7),
  });  

  export const loginZodSchema = z.object({
    userDetail: z
      .string()
      .min(2, "Name is required")
      .max(50)
      .refine((value) => {
        return (
          validator.isEmail(value) ||
          (typeof value === "string" && value.length <= 50)
        );
      }, "Must be a valid email address or a string with max length 50"),
    password: z.string().min(8, "Password must be at least 8 characters").max(50),
  });

  export const inboxZodSchema = z.object({
    sender: z.string().min(2, "Name is required").max(50).trim(),
    receiver: z.string().min(2, "Name is required").max(50).trim(),
    message: z.string().max(300),
  }); 

  export const chatZodSchema = z.object({
    title: z.string().min(2, "Title is required").max(75).trim(),
  });