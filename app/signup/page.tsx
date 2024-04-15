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

interface FormData {
  email: string;
  username: string;
  password: string;
  occupation: string;
  hobbies: string[];
  bio: string;
  interests: string;
  location: string;
  sex: string;
  age: number;
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
    age: 0,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(formData);
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
    const { token, username, id } = await res.json();
    localStorage.setItem("token", token);
    localStorage.setItem("id", id);
    login({ token, username, id });
    router.push(`/profile/${id}`);
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void {
    const { value, name } = event.target;
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
        age: isNaN(age) ? 0 : age,
      }));
    } else {
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

        <label htmlFor="age">Age:</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age === 0 ? "" : formData.age}
          onChange={handleChange}
        />

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
