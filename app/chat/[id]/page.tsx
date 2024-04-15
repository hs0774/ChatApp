"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import "../../(styles)/chat.css";

interface chatParams {
  params: {
    id: string;
  };
}

const eyeD: String = "doesnt matter";
const friends = [
  { id: 1, name: "Friend 1" },
  { id: 2, name: "Friend 2" },
  { id: 3, name: "Friend 3" },
  { id: 4, name: "Friend 4" },
  { id: 5, name: "Friend 5" },
];

const exampleChat = [
  { id: 1, name: "Friend 1", message: "message 1" },
  { id: 2, name: "Friend 2", message: "message 2" },
  { id: 3, name: "Friend 3", message: "message 3" },
  { id: 4, name: "Friend 4", message: "message 4" },
  { id: 5, name: "Friend 5", message: "message 5" },
];

export default function Chat({ params }: chatParams) {
  const [count, setCount] = useState(6);
  const [message, setMessage] = useState({
    id: count,
    name: "doesnt matter",
    message: "",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    exampleChat.push(message);
    setCount((count) => count + 1);
    setMessage((prev) => ({
      id: count + 1,
      name: "doesnt matter",
      message: "",
    }));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const { value, name } = event.target;
    setMessage((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <div className="chatpage">
      <div className="friendslist">
        <h3>Friends List</h3>
        {friends.map((friend) => (
          <li key={friend.id}>{friend.name}</li>
        ))}
      </div>
      <div className="currentChat">
        <h3>Chat Title</h3>
        <div className="actualChat">
          {exampleChat.map((messages) =>
            messages.name !== "doesnt matter" ? (
              <li className="friendMessages" key={messages.id}>
                {messages.name} : {messages.message}
              </li>
            ) : (
              <li className="userMessages" key={messages.id}>
                {messages.name} : {messages.message}
              </li>
            )
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="messageSubmit"></label>
          <input
            type="text"
            id="messageSubmit"
            name="message"
            onChange={handleChange}
            value={message.message || ""}
          />
          <button>Send</button>
        </form>
      </div>
    </div>
  );
}
