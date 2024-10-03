"use client";
import React, { useState, useEffect } from "react";
import "../../app/(styles)/inbox.css";
import CreateMessage from "../(components)/inboxCreate";
import InboxMessage from "../(components)/inboxMessage";
import { useAuth } from "../(stores)/authContext";

// Define your interfaces here
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

interface Friend {
  _id: string;
  id: string;
  username: string;
}

interface ParamName {
  username: string;
}

const getData = async () => {
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/v1/Inbox/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};

export default function Inbox({ searchParams }: { searchParams: ParamName }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{
    message: Message[];
    friends: Friend[];
  }>({ message: [], friends: [] });
  const [paramName, setParamName] = useState<ParamName>({ username: "" });
  const [openInboxMessage, setOpenInboxMessage] = useState(false);
  const [openMessage, setOpenMessage] = useState(true);
  const [displayedMessage, setDisplayedMessage] = useState<Message | null>(
    null
  );
  const [deleteAllChecked, setDeleteAllChecked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getData();
        if (Array.isArray(userData.message)) {
          userData.message.reverse();
        }
        setMessages(userData);
        setParamName(searchParams);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, [searchParams]);

  function openInbox(message: Message) {
    setOpenMessage(false);
    setOpenInboxMessage(true);
    setDisplayedMessage(message);
  }

  async function handleDelete() {
    try {
      const id = localStorage.getItem("id");
      const messagesToDelete = messages.message
        .filter(
          (message) =>
            document.getElementById(
              `message-${message._id}`
            ) as HTMLInputElement | null
        )
        .map((message) => message._id);

      const response = await fetch(`/api/v1/Inbox`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messagesToDelete, id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete messages");
      }

      const updatedMessages = messages.message.filter((message) => {
        const element = document.getElementById(
          `message-${message._id}`
        ) as HTMLInputElement | null;
        return !(element?.checked ?? false);
      });
      setMessages({ ...messages, message: updatedMessages });

      setOpenMessage(true);
      setOpenInboxMessage(false);
      setDeleteAllChecked(false);
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  }

  function handleDeleteAll(event: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"][name^="message-"]'
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
    setDeleteAllChecked(isChecked);
  }

  function checkIfUnchecked() {
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"][name^="message-"]'
    );
    for (let i = 0; i < checkboxes.length; i++) {
      if (!checkboxes[i].checked) {
        setDeleteAllChecked(false);
        return;
      }
    }
    setDeleteAllChecked(true);
  }

  return (
    <div className="mainInbox">
      <div className="inboxCommands">
        <div className="leftinboxCommands">
          {/* <h2>Message List</h2> */}
          <button onClick={handleDelete}>Delete Clicked Messages</button>
        </div>
        <button
          onClick={() => {
            setOpenInboxMessage(false);
            setOpenMessage(true);
          }}
        >
          Create Message
        </button>
      </div>
      <br />
      <div className="inboxAndMessage">
        <div className="inboxLeftSideWrapper">
          <div className="fixedSelectAll">
            <input
              type="checkbox"
              name="deleteAll"
              onChange={handleDeleteAll}
              checked={deleteAllChecked}
            />
            <label htmlFor="deleteAll">Select All</label>
          </div>
          <div className="inboxLeftSide">
            {messages.message.map((message) => (
              <div className="inbox" key={message._id}>
                <div>
                  <li
                    className="inboxMessages"
                    onClick={() => openInbox(message)}
                  >
                    <div className="inboxLeft">
                      <input
                        type="checkbox"
                        id={`message-${message._id}`}
                        name={`message-${message._id}`}
                        onChange={checkIfUnchecked}
                      />
                    </div>
                    <div>
                      <div className="inboxMiddle">
                        <p>{message.sender.username}</p>
                      </div>
                      <div className="inboxRight">
                        <p>{message.message.slice(0, 50)}</p>
                      </div>
                      <div className="inboxEnd">
                        <p>{new Date(message.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </li>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="inboxRightSide">
          {openMessage && (
            <CreateMessage friends={messages.friends} paramName={paramName} />
          )}
          {openInboxMessage && displayedMessage && (
            <InboxMessage message={displayedMessage} />
          )}
        </div>
      </div>
    </div>
  );
}
