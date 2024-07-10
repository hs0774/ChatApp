"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../(stores)/authContext";
import "../(styles)/modal.css";

export default function Modal({ likes, setOpenModal }) {
  const { user } = useAuth();
 // console.log(friendsList)

  const [data,setData] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/v1/Modal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(likes),
        });
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }

        const userData = await res.json();
        console.log(userData.likes);
        setData(userData.likes);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [likes]);
  

    async function handleAddFriend(_id: string) {
        //automatic inbox request to the user, friendship schema created,
        //in the inbox it would confirm the adding and add both ids to respective
        //array
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/Friendship", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(_id),
        });
    
        if (!response.ok) {
          throw new Error("Failed to handle friend request");
        }
        setData((prev) =>
            prev?.map((like) => {
            if (like._id === _id) {
                return { ...like, status: 'pending' };
            }
            return like;
            })
        );
      }

  return (
    <div className="modalOverlay" onClick={() => setOpenModal(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setOpenModal(false)}>&times;</button>
        {data?.map((like) => (
          <div className="modalList" key={like._id}>
            <div className="modalReplyImg modalPicAndName">
                <img  className='modalProfilePic' src={like.profilePic} alt="" />
                <p className="modalItem">
                    <Link href={`/profile/${like._id}`}>{like.username}</Link>
                </p>
            </div>
            {like.username === user?.username ? (
              <p>You</p>
            ) : like?.status === 'pending' ? (
              <p>Requested</p>
            ) : like.status === 'accepted' ? (
              <p>Friends</p>
            ) : <p onClick={() => handleAddFriend(like._id)} className="addFriend">Add Friend</p>}
          </div>
        ))}
      </div>
    </div>
  );
}



