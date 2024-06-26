"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "../(stores)/authContext";
import '../(styles)/nav.css'

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleClick = () => {
    logout();
  };
  return (
    <nav>
      <div className="Navleft">
        <Link href="/">
          <h1>ChatApp</h1>
        </Link>
      </div>
      <div className="NavRight">
        {!user ? (
          <>
            <Link href="/login">
              <p>Log In</p>{" "}
            </Link>
            <Link href="/signup">
              <p>Sign up</p>
            </Link>
          </>
        ) : (
          <>
            <Link href="/chat">
              <p>Chat!</p>
            </Link>
            <Link href="/inbox">
              <p>Inbox</p>
            </Link>
              <Link href={`/profile/${user.id}`}>
              <div className="navProfileHolder">
              <p>Hello, {user.username}</p>
                {user.profilePic && (
                    <img className="navProfilePic"
                      src={user.profilePic}
                    />
                  )}
                  {/* {user.profilePic && (
                    <img className="navProfilePic"
                      src={user.profilePic}
                      // `data:image/jpeg;base64,${base64Image}`
                    />
                  )} */}
                </div>
              </Link>

            <Link href="/post">
              <p>Wall</p>
            </Link>
            <button onClick={handleClick}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

//fix /profile/jim to get name/id
//fix /chat/3 to chat/id
//logout is going to be a post request and nav back to home page
//this might solve easily when logged works/auth
