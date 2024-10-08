"use client";
import { useAuth } from "@/app/(stores)/authContext";

interface User {
  username: string;
}

interface Message {
  _id: string;
  id: string;
  sender: User;
  receiver: User;
  createdAt: number;
  message: string;
  type: string;
}

interface InboxMessageProps {
  message: Message;
}

export default function InboxMessage({ message }: InboxMessageProps) {
  const { user } = useAuth();
  console.log(user?.id);

  async function handleFriendReq(
    action: string,
    sender: string,
    receiver: string
  ) {
    if (action === "accept") {
      console.log("hi");
      const response = await fetch(`/api/v1/Inbox/${user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ sender, receiver, action }),
      });
    } else if (action === "deny") {
      console.log("bye");
      const response = await fetch(`/api/v1/Inbox/${user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ sender, receiver, action }),
      });
    }
  }

  return (
    <div>
      <h2>{`${message.sender.username}'s message`}</h2>
      <ul>
        <li className="clickedOnMessage" key={message.id}>
          <p>From: {message.sender.username}</p>
          <p>To: {message.receiver.username} (you) </p>
          <p>{new Date(message.createdAt).toLocaleString()}</p>
          <p>{message.message}</p>
          {message.type === "friendRequest" && (
            <div className="buttons">
              <button
                className="buttonA"
                onClick={() =>
                  handleFriendReq(
                    "accept",
                    message.sender.username,
                    message.receiver.username
                  )
                }
              >
                Accept
              </button>
              <button
                className="buttonA"
                onClick={() =>
                  handleFriendReq(
                    "deny",
                    message.sender.username,
                    message.receiver.username
                  )
                }
              >
                Deny
              </button>
            </div>
          )}
        </li>
      </ul>
    </div>
  );
}
