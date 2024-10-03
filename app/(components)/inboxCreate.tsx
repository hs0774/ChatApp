"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/app/(stores)/authContext";
import React from "react";
import "../(styles)/inbox.css";

interface FormData {
  sender: string | null;
  receiver: string;
  message: string;
}
interface Friend {
  _id: string;
  username: string;
}

interface ParamName {
  username: string;
}

interface CreateMessageProps {
  friends: Friend[];
  paramName: ParamName;
}
//const friends = ['jim','bob','billy','bill','belle','dan','daniel','xsui','name'];

export default function CreateMessage({
  friends,
  paramName,
}: CreateMessageProps) {
  const { user } = useAuth();
  console.log(friends);
  const [formData, setFormData] = useState<FormData>({
    sender: user?.username || null,
    receiver: paramName.username || "",
    message: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        sender: user.username || null,
        receiver: paramName.username,
      }));
    }
  }, [paramName.username, user]); //[paramName.username, user]);

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
      <form className="inboxForm"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <p>From: {user?.username} (you) </p>

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
                .filter((item: { username: string }) => {
                  const searchTerm = formData.receiver?.toLowerCase();
                  const arrayItemName = item.username?.toLowerCase();
                  return (
                    searchTerm &&
                    arrayItemName.startsWith(searchTerm) &&
                    arrayItemName !== searchTerm
                  );
                })
                .slice(0, 10)
                .map((item: { _id: string; username: string }) => (
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
