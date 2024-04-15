"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/app/(stores)/authContext";
import React from "react";
import "../../(styles)/inbox.css";

//for now use auth but probably switch to params id same with
//inbox page change it to user id

//make fake list of friends will pass list of friends later when load up
//message and friends array from db of user via params id

interface FormData {
  sender: string | null;
  receiver: string;
  message: string;
}

//const friends = ['jim','bob','billy','bill','belle','dan','daniel','xsui','name'];

export default function CreateMessage({ friends, paramName}) {
  const { user } = useAuth();
 //console.log(paramName.username);
  const [formData, setFormData] = useState<FormData>({
    sender: user?.username || null,
    receiver:paramName.username || '',
    message: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        sender: user.username || null,
        receiver:paramName.username || '',
      }));
    }
  }, [paramName.username, user]);

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void {
    //console.log(event)
    const { value, name } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    console.log(user?.username);
    const response = await fetch(`api/v1/Inbox`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ formData }),
    });
    if (!response.ok) {
      throw new Error("Failed to submit message");
    }
    setFormData((prev) => ({
      ...prev,
      receiver: "",
      message: "",
    }));
  }

  return (
    <main>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <p>From {user?.username} (you) </p>

        <div className="nameSearch">
          <div className="nameSearchInner">
            <label htmlFor="receiver">Recipient:</label>
            <input
              type="text"
              id="receiver"
              name="receiver"
              value={formData.receiver}
              onChange={handleChange}
              required
            />
          </div>
          <div className="dropdown">
            {friends &&
              friends
                .filter((item) => {
                  const searchTerm = formData.receiver.toLowerCase();
                  const arrayItemName = item.username.toLowerCase();
                  return (
                    searchTerm &&
                    arrayItemName.startsWith(searchTerm) &&
                    arrayItemName !== searchTerm
                  );
                })
                .slice(0, 10)
                .map((item) => (
                  <div
                    className="dropdown-row"
                    key={item._id}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        receiver: item.username,
                      }))
                    }
                  >
                    {item.username}
                  </div>
                ))}
          </div>
        </div>

        <label htmlFor="message">Send your message!:</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
        ></textarea>
        <button>Submit</button>
      </form>
    </main>
  );
}

//this is where there will be an input form and the sender will be the id/name of the
//logged user using nav and token, verfied in backend
// if a user arrived here via clicking inbox the person they want to send
// will also be populated with their name, i will also try to have a list of users
// they are friends with like a suggestion box on who to inbox
//possibly mass inbox though since this isnt a super robust project
//each message would be individual not groupped
// a check in the backend for both sender and reciever for security purposes
//also check if users exist.
