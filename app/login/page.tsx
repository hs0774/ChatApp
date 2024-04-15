"use client";
import Link from "next/link";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { useAuth } from "../(stores)/authContext";
import { useRouter } from "next/navigation";

interface FormData {
  userDetail: string;
  password: string;
}
export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    userDetail: "",
    password: "",
  });

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void {
    const { value, name } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(formData);
    const res = await fetch("/api/v1/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error("failed to Login");
    }
    const { token, username, id } = await res.json();
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("id", id);
    login({ token, username, id });
    router.push(`/profile/${id}`);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Enter Username or Email:</label>
        <input
          type="text"
          id="username"
          name="userDetail"
          value={formData.userDetail}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Log in!</button>
      </form>
      <p>
        Don&apos;t have an acount? <Link href="/signup">Sign up</Link>
      </p>
    </div>
  );
}
