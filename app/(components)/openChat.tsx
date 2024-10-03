"use client";
import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import "../(styles)/chat.css"
import { useAuth } from "@/app/(stores)/authContext";
import { v4 as uuidv4 } from "uuid";
import io, { Socket } from "socket.io-client";
import Resizer from "react-image-file-resizer";
import DalleModal from "@/app/(components)/dalleModal";
import Image from "next/image";

import editIcon from "../../public/edit_icon.svg"

interface Chat {
  _id: string;
  id: number | string;
  title: string;
  participants: { _id: string; username: string }[];
  messages: {
    _id: string | null | undefined;
    image?: string;
    id: number | string;
    sender: { _id: string; username: string };
    content: string;
    createdAt: number;
  }[];
}
interface Friend {
  _id: string;
  id: string;
  username: string;
}
interface UserFriend {
  _id: string | null | undefined;
  id: string;
  username: string;
}

interface Chatprops {
  currentChat: Chat | undefined;
  userFriends: UserFriend[] | undefined;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>;
  setExampleChat: React.Dispatch<React.SetStateAction<Chat[]>>;
  exampleChat: Chat[];
}

interface Message {
  message: string | undefined | null;
  image: string | undefined | null;
}

const OpenChat: React.FC<Chatprops> = ({
  currentChat,
  userFriends,
  setCurrentChat,
  setExampleChat,
  exampleChat,
}) => {
  
  const { user } = useAuth();
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [currentFriendSelected, setCurrentFriendSelected] = useState<
    string | undefined
  >();
  const [sentMessage, setSentMessage] = useState<Message>({
    message: "",
    image: null,
  });
  const [editDetails, setEditDetails] = useState<string | undefined>(
    currentChat?.title
  );
  const [editing, setEditing] = useState(false);
  const [addedUsers, setAddedUsers] = useState<Friend[]>([]);
  const [socket, setSocket] = useState<Socket | undefined>();
  const [imgURL, setImgURL] = useState<string | null | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setAddedUsers([]);
    setCurrentFriendSelected("");
    setEditDetails(currentChat?.title);
    const socket = io("wss://thechat-app.com", { path: '/socket.io' });
    setSocket(socket);

    // Join all chat rooms the user is part of
    exampleChat.forEach((chat) => {
      socket.emit("joinChat", { chatId: chat._id, userId: user?.id });
    });

    socket.on("get-message", (message, chatId) => {
      console.log(message);
      setExampleChat((prevChats) => {
        return prevChats.map((chat) => {
          if (chat._id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, message],
            };
          }
          return chat;
        });
      });

      if (chatId === currentChat?._id) {
        setCurrentChat((prevChat) => {
          if (!prevChat) return undefined;

          return {
            ...prevChat,
            messages: [...prevChat.messages, message],
          };
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [
    setExampleChat,
    currentChat?._id,
    setCurrentChat,
    exampleChat,
    user?.id,
    currentChat?.title,
  ]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      sentMessage.message === "" &&
      (sentMessage.image === null || sentMessage.image === undefined)
    ) {
      return;
    }
    console.log(sentMessage);
    socket?.emit("get-message", {
      message: sentMessage,
      currentChatId: currentChat?._id,
      token: `Bearer ${user?.token}`,
    });
    setSentMessage({
      message: "",
      image: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { value, name, files } = event.target;
    if (name === "image" && files) {
      if (imgURL) {
        URL.revokeObjectURL(imgURL);
      }
      const url = URL.createObjectURL(files[0]);
      setImgURL(url);
      Resizer.imageFileResizer(
        files[0],
        200,
        200,
        "JPEG",
        100,
        0,
        (uri) => {
          setSentMessage((prev) => ({
            ...prev,
            image: uri as string,
          }));
        },
        "base64"
      );
    } else {
      setSentMessage((prev) => ({ ...prev, message: value }));
    }
  }

  function handleChangee(event: ChangeEvent<HTMLSelectElement>): void {
    const { value } = event.target;
    setCurrentFriendSelected(value);
  }

  function addUser(event: React.MouseEvent<HTMLButtonElement>) {
    console.log(currentFriendSelected);
    if (currentFriendSelected) {
      const friendObject = JSON.parse(currentFriendSelected);
      console.log(friendObject);
      const alreadyAdded = addedUsers.find(
        (friend) => friend.username === friendObject.username
      );
      if (!alreadyAdded) {
        setAddedUsers((prev) => [...prev, friendObject]);
      }
    }
  }

  function removeChatFriend(friend: UserFriend) {
    setAddedUsers((prev) =>
      prev.filter((friendName) => friendName.username !== friend.username)
    );
  }

  async function addUserToChat(event: React.MouseEvent<HTMLButtonElement>) {
    console.log(currentChat);
    const existingParticipants = addedUsers.filter((user) =>
      currentChat?.participants.some(
        (participant) => participant.username === user.username
      )
    );

    if (existingParticipants.length > 0) {
      console.log("User(s) already exist in the chat:", existingParticipants);
      return;
    }
    const res = await fetch(
      `/api/v1/Chat/${currentChat?._id.toString()}/patch`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ addedUsers, id: currentChat?._id }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to update Chat Title");
    }
    const updatedChat = {
      ...currentChat!,
      participants: [...currentChat!.participants, ...addedUsers],
    };

    const updatedExampleChat = exampleChat.map((chat) =>
      chat._id === currentChat?._id ? updatedChat : chat
    );

    // Update the state
    setExampleChat(updatedExampleChat);
    setAddedUsers([]);
    setCurrentChat(updatedChat);
    console.log(updatedChat);
  }

  function changeTitle(event: React.MouseEvent<HTMLImageElement>) {
    setEditing(true);
    if (addUserOpen) {
      setAddUserOpen(false);
    }
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    setEditDetails(value);
  }

  async function newTitle(event: React.MouseEvent<HTMLButtonElement>) {
    if (!editDetails?.trim()) {
      return;
    }

    const res = await fetch(`/api/v1/Chat/${currentChat?._id.toString()}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({
        currentChat: currentChat?._id,
        newTitle: editDetails.trim(),
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to update Chat Title");
    }
    const response = await res.json();
    console.log(response);

    setCurrentChat((prev) => ({
      ...prev!,
      title: editDetails.trim(), // Set the new title and trim any leading/trailing whitespace
    }));

    const updatedExampleChat = exampleChat.map((chat) => {
      if (chat._id === currentChat?._id) {
        return {
          ...chat,
          title: editDetails.trim(), // Update the title in the exampleChat array
        };
      }
      return chat;
    });

    setExampleChat(updatedExampleChat); // Update the exampleChat state with the modified chat title
    setEditing(false); // Exit edit mode
  }

  async function leaveChat(event: React.MouseEvent<HTMLButtonElement>) {
    const res = await fetch(`/api/v1/Chat/${currentChat?._id.toString()}/put`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ userId: user?.id }),
    });

    if (!res.ok) {
      throw new Error("Failed to update Chat Title");
    }

    const updatedExampleChat = exampleChat.filter(
      (chat) => chat._id !== currentChat?._id
    );
    setExampleChat(updatedExampleChat);
    setCurrentChat(undefined);
  }

  //   return (
  //    <div className="currentChat">
  //     {!editing ? <h3>{currentChat?.title} <button onClick={changeTitle}>Edit Title</button></h3> :
  //      <> <label htmlFor="title">ChatTitle:</label>
  //       <input
  //         type="text"
  //         id="title"
  //         name="title"
  //         value={editDetails}
  //         onChange={handleTitleChange}
  //       /> <button onClick={newTitle}>Change</button> <button onClick={()=>{setEditing(false);setEditDetails(currentChat?.title)}}>Cancel</button></>}
  //     <div className="actualChat">
  //       <button onClick={leaveChat}>Leave</button>
  //       <button onClick={() => setAddUserOpen(!addUserOpen)}>Add User</button>
  //       {addUserOpen && <><select id="chatCreate" onChange={handleChangee} value={currentFriendSelected} name="chatCreate" >
  //                 {/* onChange={} value={} */}
  //             <option value="">Select a friend</option>
  //             {(userFriends ?? [])
  //             .filter(friend => !currentChat?.participants.some((participant: { username: string; }) => participant.username === friend.username))
  //             .map((friend) => (
  //               <option key={friend._id} value={JSON.stringify(friend)}>
  //                 {friend.username}
  //               </option>
  //             ))}
  //           </select>
  //           <button onClick={addUser}>Add to List</button>
  //           {addedUsers.map(friend => (
  //             <li key={`${friend._id}`}>{friend.username} <button onClick={()=> removeChatFriend(friend)}>&times;</button></li>
  //           ))}</>}
  //           {addedUsers.length > 0 && <button onClick={addUserToChat}>Add user{addedUsers.length>1 ? 's' : null} to chat</button>}
  //       {currentChat?.messages.map((chat) => (
  //         <div key={uuidv4()}>
  //           <li
  //             className={chat.sender.username !== user?.username ? "friendMessages" : "userMessages"}
  //              //change this to message.id chat.content._id
  //           >

  //             {chat.sender.username} : {chat.content}
  //             {/* && (chat.image ? <img className="preview" src={chat.image} alt="Profile Preview" /> : null)} */}
  //           </li>
  //           { chat.image && (<Image className="chatImage" height={100} width={100} src={chat.image} alt="Chat image" />)}
  //           </div>
  //       ))}
  //     </div>

  //     <form onSubmit={handleSubmit}>
  //     <div className="messageItems">
  //     <div className="messageImgItems">
  //     {sentMessage.image && <Image className="chatImgPreview" height={50} width={50} src={imgURL || " "} alt="Preview" />}
  //     <button onClick={() => setShowModal(!showModal)}>
  //           {showModal ? 'Cancel' : 'Chat using ai images'}
  //     </button>
  //     <input type="file" id="image" name="image" accept="image/jpeg" ref={fileInputRef} onChange={handleChange}/>
  //      </div><div>
  //               <label htmlFor="messageSubmit"></label>
  //       <input
  //         type="text"
  //         id="messageSubmit"
  //         name="message"
  //         onChange={handleChange}
  //         value={sentMessage.message || ""}
  //       />

  //       <button type="submit">Send</button></div></div>

  //     </form>
  //     {showModal && <DalleModal imgURL={null} setFormData={setSentMessage} setImgURL={setImgURL} fileInputRef={fileInputRef} setEditDetails={null} setNewComments={null} postId={null} fromChat={true} showModal={showModal} setShowModal={setShowModal}/>}
  //   </div>
  // )
  return (
    <div className="chat-container">
      <div className="chat-header">
        {/* <h2 className="chat-title">{currentChat?.title}</h2>
        <div className="chat-participants">
          <h3 className="participants-title">Participants:</h3>
          <ul className="participants-list">
            {currentChat?.participants.map((participant) => (
              <li className="participant-item" key={participant._id}>
                {participant.username}
              </li>
            ))}
          </ul>
        </div> */}
        <div className="edittitleitems">
          {!editing ? (
            <div className="editTitle">
              <h3>{currentChat?.title}</h3>{" "}
              <Image
                src={editIcon || ""}
                onClick={changeTitle}
                alt="Edit Icon"
              />
            </div>
          ) : (
            <>
              <label htmlFor="title">ChatTitle:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={editDetails}
                onChange={handleTitleChange}
              />
              {/* <div> */}
              <button className="generate-image-btn" onClick={newTitle}>
                Change
              </button>
              <button
                className="send-chat-btn"
                onClick={() => {
                  setEditing(false);
                  setEditDetails(currentChat?.title);
                }}
              >
                Cancel
              </button>
              {/* </div> */}
            </>
          )}
        </div>
        <div className="actualChat">
          <button
            className="send-message-btn"
            onClick={() => {
              setAddUserOpen(!addUserOpen);
              if (editing) setEditing(false);
            }}
          >
            Add User
          </button>
          {!addUserOpen && (
            <button className="send-message-btn" onClick={leaveChat}>
              Leave
            </button>
          )}
          {addUserOpen && (
            <>
              <select
                id="chatCreate"
                onChange={handleChangee}
                value={currentFriendSelected}
                name="chatCreate"
              >
                {/* onChange={} value={} */}
                <option value="">Select a friend</option>
                {(userFriends ?? [])
                  .filter(
                    (friend) =>
                      !currentChat?.participants.some(
                        (participant: { username: string }) =>
                          participant.username === friend.username
                      )
                  )
                  .map((friend) => (
                    <option key={friend._id} value={JSON.stringify(friend)}>
                      {friend.username}
                    </option>
                  ))}
              </select>
              <button onClick={addUser} className="send-message-btn">
                Add to List
              </button>
              <ul className="scrollable-list">
                {addedUsers.map((friend) => (
                  <li className="underline" key={`${friend._id}`}>
                    {friend.username}{" "}
                    <button
                      className="remove-person-btn"
                      onClick={() => removeChatFriend(friend)}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {addUserOpen && addedUsers.length > 0 && (
            <button className="send-message-btn" onClick={addUserToChat}>
              Add user{addedUsers.length > 1 ? "s" : null} to chat
            </button>
          )}
        </div>
      </div>
      <div className="chat-messages">
        {currentChat?.messages.map((message) => (
          <div
            key={message._id}
            className={`message ${
              message.sender._id === user?.id ? "own" : "other"
            }`}
          >
            <p className="message-sender">{message.sender.username}</p>
            <div className="message-content">
              {message.content && <p>{message.content}</p>}
              {message.image && (
                <div className="message-image">
                  <Image
                    src={message.image}
                    alt="Sent image"
                    width={200}
                    height={200}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        {sentMessage.image && (
          <Image
            className="chatImgPreview"
            height={50}
            width={50}
            src={imgURL || " "}
            alt="Preview"
          />
        )}
        <input
          type="text"
          value={sentMessage.message || ""}
          onChange={handleChange}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-message-btn">
          Send
        </button>
        <label className="image-upload-label">
          <input
            type="file"
            id="image"
            name="image"
            className="image-upload-input"
            accept="image/jpeg"
            ref={fileInputRef}
            onChange={handleChange}
          />
          <span className="image-upload-icon">📷</span>
        </label>
        <button
          type="button"
          className="send-message-btn"
          onClick={() => setShowModal(true)}
        >
          Generate Image
        </button>
      </form>
      {showModal && (
        <DalleModal
          imgURL={null}
          setFormData={setSentMessage}
          setImgURL={setImgURL}
          fileInputRef={fileInputRef}
          setEditDetails={null}
          setNewComments={null}
          postId={null}
          fromChat={true}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      )}
    </div>
  );
}

export default OpenChat;