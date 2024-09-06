"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "../(stores)/authContext";
import Image from "next/image";
import "../(styles)/nav.css";

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
              <p>Log In</p>
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
            <Link href="/post">
              <p>Wall</p>
            </Link>
            <Link href={`/profile/${user.id}`}>
              <div className="navProfileHolder">
                <p>{user.username}</p>
                {user.profilePic && (
                  <Image
                    className="navProfilePic"
                    src={user.profilePic}
                    alt={`${user.username}'s profile picture`}
                    width={32}
                    height={32}
                  />
                )}
              </div>
            </Link>

            <button className="navButton" onClick={handleClick}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
