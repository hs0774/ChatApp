"use client"
import { ChangeEvent, FormEvent, SetStateAction, useEffect, useState } from "react";
import ChatList from "./[id]/page";
import "../(styles)/chat.css"
import OpenChat from "./[id]/page";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "../(stores)/authContext";

interface Chat {
  id:number | string;
  title:string;
  participants: { id: string; username: string; }[];
  messages: { id: number; sender: string; content: string; createdAt: number; }[];
}

const getData = async () => {
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/v1/Chat/${id}`, { //by using id we can get more reqs if needed by creating another directory in the api/v1/chat 
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



export default function Chat({searchParams}) {
  const { user } = useAuth(); 

  const [exampleChat,setExampleChat] = useState();
  const [userFriends,setUserFriends]= useState();
  const [currentChat,setCurrentChat] = useState();
  const [chatIsOpen,setChatIsOpen] = useState(false);
  const [chatCreateOpen,setCreateChatOpen] = useState(false);
  const [currentFriendSelected, setCurrentFriendSelected] = useState();
  const [newChat,setNewChat] = useState([]);
  const [chatTitle,setChatTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getData();
        console.log(userData);
        console.log(userData.friends);

        setExampleChat(userData.user.chats);
        setUserFriends(userData.user.friends);
        console.log(searchParams);
        const existingChat = userData.user.chats.filter((chat: { participants: { id: string; username: string; }[]; })  =>
          chat.participants.length === 2
           &&
          chat.participants.some(participant => participant.username === searchParams.username)
          && 
          chat.participants.some(participant => participant.username === user?.username)
        );
        if(existingChat.length === 1) {
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
    setCurrentChat(obj);
    setChatIsOpen(true);
    console.log(obj);
  }

  function addFriend(){
    console.log(currentFriendSelected)
    if(currentFriendSelected) {
      const friendObject = JSON.parse(currentFriendSelected);
      console.log(friendObject);
      const alreadyAdded = newChat.find(friend => friend.username === friendObject.username);
      if(!alreadyAdded){
        setNewChat(prev => [...prev,friendObject]);
      }
    }
    //setCurrentFriendSelected(undefined);
  }

  function removeChatFriend(friend:string){
    setNewChat(prev => prev.filter(friendName => friendName !== friend));
  }

  async function removeChat(id: string){
    console.log(id);
    const res = await fetch(`/api/v1/Chat`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify(id),
    }); //we do another check for the single user chat 
    if (res.ok) {
    const removeChat = exampleChat.filter(((chatId: { _id: string; }) => chatId._id !== id ))
    setExampleChat(removeChat);
    // have a condition that sees if the deleted chat is open if yes set this 
    if(currentChat?._id === id) {
    setChatIsOpen(false);
    }
   }
  }

  function handleChange(event: ChangeEvent<HTMLSelectElement>): void {
    const {value,name} = event.target;
    if(name === 'title'){
      setChatTitle(value);
    }
    setCurrentFriendSelected(value);
  }

  async function createChat(){
    if(newChat.length < 2) { 
      const singleUserName = newChat[0].username;
      const existingChat = exampleChat.filter(chat  =>
        chat.participants.length === 2
         &&
        chat.participants.some(participant => participant.username === singleUserName)
      );
      if (existingChat.length > 0) {
        setErrorMessage('Chat exists. Only group chats can be duplicates.');
        return;
      }
    }
    
    const res = await fetch(`/api/v1/Chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({title:chatTitle,newChat}),
    }); //we do another check for the single user chat 
    if (res.ok) {
      const {newChatObj} = await res.json();
      console.log(newChatObj);
      setExampleChat(prev => [...prev,newChatObj]) //returned obj is added 
      setCurrentChat(newChatObj);
      changeSettings();
      }
  }

  function changeSettings(){
    setCreateChatOpen(!chatCreateOpen)
    setCurrentFriendSelected(undefined);
    setChatTitle('');
    setNewChat([]);
    setErrorMessage('')
  }

  return (
    <main>
      <h1>Welcome to your chats</h1>
      <div className="Chat">
        <div className="chatpage">
          <div className="friendslist">
            <h3>Your chats and Group Chats</h3>
            {exampleChat?.map((obj) => ( //map(last parenth
              <div key={obj._id}>
                <div className={`groups ${obj._id}`} onClick={()=> openChat(obj)}>
                  <h3>{obj.title}</h3>
                  <div className="chatMembers">
                  {obj.participants.map((participant) => ( //first parenth
                    <li className="listItem" key={participant._id}>
                      {participant.username !== user?.username ? `${participant.username},` : null} 
                      {/* ok this is simple just change it to user?.username from useauth  */}
                    </li> 
                  ))}
                  </div>
                </div>
                <button onClick={() => removeChat(obj._id)}>&times;</button>
              </div>
            ))}
            <button onClick={changeSettings}>Create a new Chat</button>
            {chatCreateOpen && <><select id="chatCreate" onChange={handleChange} value={currentFriendSelected} name="chatCreate" >
              <option value="">Select a friend</option>
              {userFriends.map((friend) => (
                <option key={friend._id} value={JSON.stringify(friend)}>
                  {friend.username}
                </option>
              ))}
            </select> 
            <button onClick={addFriend}>Add</button> 
            {newChat.map(friend => (
              <li key={`${friend._id}`}>{friend.username} <button onClick={()=> removeChatFriend(friend)}>&times;</button></li>
            ))}</>}
            {newChat.length > 0 && (<><label htmlFor="title">Chat Name:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={chatTitle}
          onChange={handleChange}
          required
        /> <button onClick={createChat}>Create Chat</button> </>) }
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div> 
        </div>
        <div className="openChat">
          {chatIsOpen && <OpenChat userFriends={userFriends} exampleChat={exampleChat} setExampleChat={setExampleChat} setCurrentChat={setCurrentChat} currentChat={currentChat}/>}
        </div>
      </div>
    </main>
  );
}


//Change dummy friends from string array [''] to object {id:uuidv4, username:friendname}, 
//and traverse it the way an object would  
// {dummyFriends.map((friend) => (
//   <option key={friend.id} value={friend.username}>
//     {friend.username}
//     {/* so what i am going to do is i click a friend and have it right under
//     the select and then a user can select another one, and it gets added,
//     then there will a be a button that says create chat and the chat is created 
//     and it opens up where the user can type hey whats up and once there
//     is a message only then does the chat schema get created and added to
//     all users chat array. */}
//   </option>
// ))}