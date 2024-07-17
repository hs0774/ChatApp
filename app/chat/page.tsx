"use client";
import { ChangeEvent, FormEvent, SetStateAction, useEffect, useState } from "react";
import "../(styles)/chat.css";
import OpenChat from "./[id]/page";
import { useAuth } from "../(stores)/authContext";

interface Chat {
  _id: string;
  id: number | string;
  title: string;
  participants: { _id: string; username: string; }[];
  messages: {
    image?: string; id: number|string; sender:{ _id: string; username: string; }; content: string; createdAt: number; 
}[];
}

interface UserFriend {
  _id: string | null | undefined;
  id: string;
  username: string;
}

interface NewChatParticipant {
  _id: string;
  id: string;
  username: string;
}

const getData = async () => {
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/v1/Chat/${id}`, {
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

export default function Chat({ searchParams }: { searchParams: { username: string } }) {
  const { user } = useAuth();

  const [exampleChat, setExampleChat] = useState<Chat[]>([]);
  const [userFriends, setUserFriends] = useState<UserFriend[] | undefined>(undefined);
  const [currentChat, setCurrentChat] = useState<Chat | undefined>(undefined);
  const [chatIsOpen, setChatIsOpen] = useState<boolean>(false);
  const [chatCreateOpen, setCreateChatOpen] = useState<boolean>(false);
  const [currentFriendSelected, setCurrentFriendSelected] = useState<string | undefined>(undefined);
  const [newChat, setNewChat] = useState<NewChatParticipant[]>([]);
  const [chatTitle, setChatTitle] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getData();
        console.log(userData);
        console.log(userData.friends);

        setExampleChat(userData.user.chats);
        setUserFriends(userData.user.friends);
        console.log(searchParams);
        const existingChat = userData.user.chats.filter((chat: Chat) =>
          chat.participants.length === 2 &&
          chat.participants.some(participant => participant.username === searchParams.username) &&
          chat.participants.some(participant => participant.username === user?.username)
        );
        if (existingChat.length === 1) {
          console.log(existingChat);
          setCurrentChat(existingChat[0]);
          setChatIsOpen(true);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, [searchParams, user]);

  function openChat(obj: Chat | SetStateAction<undefined>) {
    setCurrentChat(obj as Chat);
    setChatIsOpen(true);
    console.log(obj);
  }

  function addFriend() {
    console.log(currentFriendSelected);
    if (currentFriendSelected) {
      const friendObject = JSON.parse(currentFriendSelected) as NewChatParticipant;
      console.log(friendObject);
      const alreadyAdded = newChat.find(friend => friend.username === friendObject.username);
      if (!alreadyAdded) {
        setNewChat(prev => [...prev, friendObject]);
      }
    }
  }

  function removeChatFriend(friend: NewChatParticipant) {
    setNewChat(prev => prev.filter(friendName => friendName.username !== friend.username));
  }

  async function removeChat(id: string) {
    console.log(id);
    const res = await fetch(`/api/v1/Chat`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify(id),
    });
    if (res.ok) {
      const removeChat = exampleChat.filter(chat => chat.id !== id);
      setExampleChat(removeChat);
      if (currentChat?.id === id) {
        setChatIsOpen(false);
      }
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
    const { value, name } = event.target;
    if (event.target instanceof HTMLSelectElement) {
      // Handle select element change
      setCurrentFriendSelected(value);
    } else if (event.target instanceof HTMLInputElement) {
      // Handle input element change
      if (name === 'title') {
        setChatTitle(value);
      }
    }
  }
  
  async function createChat() {
    if (newChat.length < 2) {
      const singleUserName = newChat[0].username;
      const existingChat = exampleChat.find(chat =>
        chat.participants.length === 2 &&
        chat.participants.some(participant => participant.username === singleUserName) &&
        chat.participants.some(participant => participant.username === user?.username)
      );
      if (existingChat) {
        setCurrentChat(existingChat);
        setChatIsOpen(true);
      } else {
        setErrorMessage("Need to add at least 2 users to create a new chat.");
      }
    } else {
      const res = await fetch(`/api/v1/Chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ title: chatTitle, participants: newChat }),
      });
      if (res.ok) {
        const chatData = await res.json();
        setExampleChat(prev => [...prev, chatData]);
        setChatIsOpen(true);
        setCreateChatOpen(false);
        setChatTitle('');
        setNewChat([]);
      }
    }
  }

  return (
    <main>
      <h1>Welcome to your chats</h1>
      <div className="Chat">
        <div className="chatpage">
          <div className="friendslist">
            <h3>Your chats and Group Chats</h3>
            {exampleChat?.map((obj) => (
              <div key={obj._id}>
                <div className={`groups ${obj._id}`} onClick={() => openChat(obj)}>
                  <h3>{obj.title}</h3>
                  <div className="chatMembers">
                    {obj.participants.map((participant) => (
                      <li className="listItem" key={participant._id}>
                        {participant.username !== user?.username ? `${participant.username},` : null}
                      </li> 
                    ))}
                  </div>
                </div>
                <button onClick={() => removeChat(obj._id)}>&times;</button>
              </div>
            ))}
            <button onClick={() => setCreateChatOpen(true)}>Create a new Chat</button>
            {chatCreateOpen && (
              <>
                <select id="chatCreate" onChange={handleChange} value={currentFriendSelected} name="chatCreate">
                  <option value="">Select a friend</option>
                  {userFriends?.map((friend) => (
                    <option key={friend._id} value={JSON.stringify(friend)}>
                      {friend.username}
                    </option>
                  ))}
                </select> 
                <button onClick={addFriend}>Add</button> 
                {newChat.map(friend => (
                  <li key={friend._id}>
                    {friend.username} <button onClick={() => removeChatFriend(friend)}>&times;</button>
                  </li>
                ))}
              </>
            )}
            {newChat.length > 0 && (
              <>
                <label htmlFor="title">Chat Name:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={chatTitle}
                  onChange={handleChange}
                  required
                /> 
                <button onClick={createChat}>Create Chat</button>
              </>
            )}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div> 
        </div>
        <div className="openChat">
          {chatIsOpen && <OpenChat userFriends={userFriends} exampleChat={exampleChat} setExampleChat={setExampleChat} setCurrentChat={setCurrentChat} currentChat={currentChat} />}
        </div>
      </div>
    </main>
  );
}