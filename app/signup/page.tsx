"use client";
import Link from "next/link";
import "../(styles)/signup.css";
import React, {
  ChangeEvent,
  FormEvent,
  useState,
  ChangeEventHandler,
} from "react";
import { useAuth } from "../(stores)/authContext";
import { useRouter } from "next/navigation";
import { country_list } from "../utils/countries";
import Image from 'next/image'

interface FormData {
  image: File | null | Buffer;
  email: string;
  username: string;
  password: string;
  occupation: string;
  hobbies: string[];
  bio: string;
  interests: string;
  location: string;
  sex: string;
  age: number|null;
}


export default function Signup() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    password: "",
    occupation: "",
    hobbies: [],
    bio: "",
    interests: "",
    location: "United States of America",
    sex: "Male",
    age: null,
    image:null,
  });
  const [imgURL,setImgURL] = useState<string | undefined>();
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();


    const res = await fetch("/api/v1/Signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error("failed to create");
    }
    const { token, username, id,profilePic } = await res.json();
    localStorage.setItem("token", token);
    localStorage.setItem("id", id);
    
    login({
      token, username, id,
      profilePic,
    });
    router.push(`/profile/${id}`);
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void {
    const { value, name ,files} = event.target;
    if (name === "hobbies") {
      const hobbies = value.split(",").map((hobby) => hobby.trim());

      setFormData((prev) => ({
        ...prev,
        hobbies: hobbies,
      }));
    } else if (name === "age") {
      const age = parseInt(value);
        setFormData((prev) => ({
          ...prev,
          age: isNaN(age) ? null : age,
        }));
    } else if (name === 'image' && files) {
    
    if (imgURL) {
      URL.revokeObjectURL(imgURL);
    }
    const url = URL.createObjectURL(files[0]);
    setImgURL(url);
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      const str = reader.result?.toString();
      if (str) {
        const buffer = Buffer.from(str.split(',')[1], 'base64');
        setFormData((prev) => ({
          ...prev,
          image: buffer,
        }));
      }
    };} else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">*Email Address:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="username">*Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">*Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="occupation">Occupation:</label>
        <input
          type="text"
          id="occupation"
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
        />

        <label htmlFor="hobbies">
          Enter your hobbies (separated by commas):
        </label>
        <textarea
          id="hobbies"
          name="hobbies"
          value={formData.hobbies}
          onChange={handleChange}
        ></textarea>

        <label htmlFor="bio">Tell everyone about yourself:</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
        ></textarea>

        <label htmlFor="interests">Things you are interested in!:</label>
        <textarea
          id="interests"
          name="interests"
          value={formData.interests}
          onChange={handleChange}
        ></textarea>

        <select
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
        >
          <option value="United States of America">
            United States of America
          </option>
          {country_list.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <label htmlFor="sex">Sex:</label>
        <select
          id="sex"
          name="sex"
          value={formData.sex}
          onChange={handleChange}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="age">*Age:</label>
        <input
        type="number"
        id="age"
        name="age"
        value={formData.age === null ? "" : formData.age.toString()}
        onChange={handleChange}
        min="18"
      />

       <label htmlFor="image">Profile Picture:</label>
       <input 
       type="file" 
       id="image" 
       name="image" 
       accept="image/jpeg" 
      //  value={formData.image}
       onChange={handleChange}
       />
       {formData.image && <img className="preview" src={imgURL} alt="Profile Preview" />}
        <button type="submit">Sign up!</button>
        <p>* Required fields</p>
      </form>
      <p>
        Have an account? <Link href="/login">Log In</Link>
      </p>
    </div>
  );
}

//   profilePic: { type: Buffer },
