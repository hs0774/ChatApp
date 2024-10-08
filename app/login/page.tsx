// "use client";
// import Link from "next/link";
// import React, { ChangeEvent, FormEvent, useState } from "react";
// import { useAuth } from "../(stores)/authContext";
// import { useRouter } from "next/navigation";

// interface FormData {
//   userDetail: string;
//   password: string;
// }
// export default function Login() {
//   const { login } = useAuth();
//   const router = useRouter();
//   const [formData, setFormData] = useState<FormData>({
//     userDetail: "",
//     password: "",
//   });

//   function handleChange(
//     event: ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ): void {
//     const { value, name } = event.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   }

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     console.log(formData);
//     const res = await fetch("/api/v1/Login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     });

//     if (!res.ok) {
//       throw new Error("failed to Login");
//     }
//     const { token, username, id, profilePic } = await res.json();
//     localStorage.setItem("token", token);
//     localStorage.setItem("username", username);
//     localStorage.setItem("id", id);
//     localStorage.setItem("profilePic", profilePic);
//     login({ token, username, id, profilePic });
//     router.push(`/profile/${id}`);
//   }

//   async function handleRandomLogin(event: React.MouseEvent<HTMLButtonElement>) {
//     const res = await fetch("/api/v1/Login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(""),
//     });

//     if (!res.ok) {
//       throw new Error("failed to Login");
//     }

//     const { token, username, id, profilePic } = await res.json();
//     localStorage.setItem("token", token);
//     localStorage.setItem("username", username);
//     localStorage.setItem("id", id);
//     localStorage.setItem("profilePic", profilePic);
//     login({ token, username, id, profilePic });
//     router.push(`/profile/${id}`);
//   }

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <label htmlFor="username">Enter Username or Email:</label>
//         <input
//           type="text"
//           id="username"
//           name="userDetail"
//           value={formData.userDetail}
//           onChange={handleChange}
//           required
//         />

//         <label htmlFor="password">Password:</label>
//         <input
//           type="password"
//           id="password"
//           name="password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />
//         <button type="submit">Log in!</button>
//       </form>
//       <button onClick={handleRandomLogin}>
//         Login from 1 of 20 sample accounts!
//       </button>
//       <p>
//         Don&apos;t have an acount? <Link href="/signup">Sign up</Link>
//       </p>
//     </div>
//   );
// }
"use client";
import Link from "next/link";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { useAuth } from "../(stores)/authContext";
import { useRouter } from "next/navigation";
import "../(styles)/login.css"; // Import the CSS file

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
    const { token, username, id, profilePic } = await res.json();
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("id", id);
    localStorage.setItem("profilePic", profilePic);
    login({ token, username, id, profilePic });
    router.push(`/profile/${id}`);
  }

  async function handleRandomLogin(event: React.MouseEvent<HTMLButtonElement>) {
    const res = await fetch("/api/v1/Login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(""),
    });

    if (!res.ok) {
      throw new Error("failed to Login");
    }

    const { token, username, id, profilePic } = await res.json();
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("id", id);
    localStorage.setItem("profilePic", profilePic);
    login({ token, username, id, profilePic });
    router.push(`/profile/${id}`);
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="form-title">Log In</h2>

        <div className="form-group">
          <label htmlFor="username">Username or Email:</label>
          <input
            type="text"
            id="username"
            name="userDetail"
            value={formData.userDetail}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <button type="submit" className="login-btn">
          Log In
        </button>
      </form>
      <button onClick={handleRandomLogin} className="random-login-btn">
        Login with a Sample Account
      </button>
      <p className="signup-link">
        Don&apos;t have an account? <Link href="/signup">Sign up</Link>
      </p>
    </div>
  );
}
