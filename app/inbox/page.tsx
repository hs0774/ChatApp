"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import "../../app/(styles)/inbox.css";
import CreateMessage from "./create/page";
import InboxMessage from "./[userid]/page";
import { useAuth } from "../(stores)/authContext";

const getData = async () => {
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/v1/Inbox/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // body: JSON.stringify(id), // Pass id as part of an object
  });
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};

export default function Inbox({searchParams}) {
  const { user } = useAuth();
 //console.log(paramName);
  const [messages, setMessages] = useState();
  const [paramName,setParamName] = useState('');
  //console.log(paramName);
  const [openInboxMessage, setOpenInboxMessage] = useState(false);
  const [openMessage, setOpenMessage] = useState(true);
  const [displayedMessage, setDisplayedMessage] = useState({});
  const [deleteAllChecked, setDeleteAllChecked] = useState(false);
  const [friends, setFriends] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getData();
        setMessages(userData);
        setMessages({ ...messages, message: userData.message });
        setFriends(userData.friends);
        //console.log(userData.friends);
        setParamName(searchParams);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, [messages, searchParams, user]);

  function openInbox(message: React.SetStateAction<{}>) {
    setOpenMessage(false);
    setOpenInboxMessage(true);
    setDisplayedMessage(message);
  }

  async function handleDelete() {
    try {
      const id = localStorage.getItem("id");
      const messagesToDelete = messages?.message
        .filter(
          (message) =>
            document.getElementById(`message-${message._id}`)?.checked
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

      const updatedMessages = messages?.message.filter(
        (message) => !document.getElementById(`message-${message._id}`)?.checked
      );
      console.log(updatedMessages);
      setMessages({ ...messages, message: updatedMessages });

      setOpenMessage(true);
      setOpenInboxMessage(false);
      setDeleteAllChecked(false);
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  }

  function handleDeleteAll(event) {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"][name^="message-"]'
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
    setDeleteAllChecked(isChecked); // Update state of "Delete All" checkbox
  }

  function checkIfUnchecked() {
    const checkboxes = document.querySelectorAll(
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
    <div>
      <div className="inboxCommands">
        <h2>Message List</h2>
        <button
          onClick={() => {
            setOpenInboxMessage(false);
            setOpenMessage(true);
          }}
        >
          Create Message
        </button>
        <button onClick={handleDelete}>Delete</button>
      </div>
      <br />
      <div className="inboxAndMessage">
        <div className="inboxLeftSide">
          <label htmlFor="deleteAll">Delete All</label>
          <input
            type="checkbox"
            name="deleteAll"
            onChange={handleDeleteAll}
            checked={deleteAllChecked}
          />
          {messages?.message.map((message: React.SetStateAction<{}>) => (
            <div className="inbox" key={message._id}>
              <div>
                <li className="inboxMessages">
                  <div className="inboxLeft">
                    <input
                      type="checkbox"
                      id={`message-${message._id}`}
                      name={`message-${message._id}`}
                      onChange={checkIfUnchecked}
                    />
                  </div>
                  <div onClick={() => openInbox(message)}>
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
        <div className="inboxRightSide">
          
          {openMessage && <CreateMessage friends={friends} paramName={paramName}/>}
          {openInboxMessage && <InboxMessage message={displayedMessage}  />}
        </div>
      </div>
    </div>
  );
}

// done:

// so we first call the api and we get the users inbox and set it to
// the const [messages, setMessages] = useState(initialMessages); state
// if delete button is pressed update users inbox and delete message
// create more items in the inbox so you can delete them
//delete actually deletes item in db

//todo:

//  CREATE inbox messages

// find sender and reciever id, create inbox schema property and place reference
// in recievers array

// might change api for user to get inbox schema within user array. same with chat

// READ AND UPDATE inbox messages (DO AFTER PROFILE PAGE FRIEND REQUESTS)

// then we have to get the friendship schema for any friend requests
// i find the ids since each message has a sender and receiver id
// and i find the schema and make sure it says pending and then update it
// to friends and add users to respective friendship array
// or delete the friendship schema if denied

// DELETE inbox messages pt2

//if a friendrequest message is deleted it should be the same as denying it
//and delete friendship schemas created by friend requests
