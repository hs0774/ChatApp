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
  participants: { id: number; username: string; }[];
  messages: { id: number; sender: string; content: string; createdAt: number; }[];
}

const dummyFriends = [{id:1,username:'Friend 43'},{id:2,username:'Friend 3'},{id:3,username:'Friend 2'},{id:400,username:'Friend 44'},
{id:5,username:'Friend 4'},{id:34,username:'Friend 45'},{id:7,username:'Friend 5'},{id:8,username:'Friend 6'},
{id:9,username: 'Friend 69'},{id:10,username:'Friend 420'}]


//since one of the usernames is going to be you we have to change 
// the front end rendering of where it says "You"
const eexampleChat: Chat[] = [
  { 
    id:100,
    title:"Chat 1",
    participants: [
      { id: 1, username: "Friend 43" },
      { id: 2, username: "Friend 3" },
      { id: 3, username: "Friend 2" },
      { id: 4, username: "You" }
    ],
    messages: [
      { id: 5, sender: "Friend 3", content: "message 1", createdAt: Date.now() },
      { id: 6, sender: "Friend 2", content: "message 2", createdAt: Date.now() },
      { id: 7, sender: "Friend 43", content: "message 3", createdAt: Date.now() },
      { id: 8, sender: "Friend 2", content: "message 4", createdAt: Date.now() },
      { id: 9, sender: "You", content: "message 5", createdAt: Date.now() },
      { id: 10, sender: "Friend 3", content: "message 6", createdAt: Date.now() },
      { id: 11, sender: "You", content: "message 7", createdAt: Date.now() },
    ]
  },
  {
    id:200,
    title:"Chat 2",
    participants: [
      { id: 12, username: "Friend 44" },
      { id: 13, username: "Friend 4" },
      { id: 14, username: "Friend 3" },
      { id: 15, username: "You" }
    ],
    messages: [
      { id: 16, sender: "Friend 4", content: "message 1", createdAt: Date.now() },
      { id: 17, sender: "Friend 3", content: "message 2", createdAt: Date.now() },
      { id: 18, sender: "Friend 44", content: "message 3", createdAt: Date.now() },
      { id: 19, sender: "Friend 3", content: "message 4", createdAt: Date.now() },
      { id: 20, sender: "You", content: "message 5", createdAt: Date.now() },
      { id: 21, sender: "Friend 4", content: "message 6", createdAt: Date.now() },
      { id: 22, sender: "You", content: "message 7", createdAt: Date.now() },
    ]
  },
  {
    id:300,
    title:"Chat 3",
    participants: [
      { id: 23, username: "Friend 45" },
      { id: 24, username: "Friend 5" },
      { id: 25, username: "Friend 6" },
      { id: 26, username: "You" }
    ],
    messages: [
      { id: 27, sender: "Friend 6", content: "message 1", createdAt: Date.now() },
      { id: 28, sender: "Friend 5", content: "message 2", createdAt: Date.now() },
      { id: 29, sender: "Friend 45", content: "message 3", createdAt: Date.now() },
      { id: 30, sender: "Friend 5", content: "message 4", createdAt: Date.now() },
      { id: 31, sender: "You", content: "message 5", createdAt: Date.now() },
      { id: 32, sender: "Friend 6", content: "message 6", createdAt: Date.now() },
      { id: 33, sender: "You", content: "message 7", createdAt: Date.now() },
    ]
  },
  {
    id:400,
    title:"Chat 4",
    participants: [
      { id: 34, username: "Friend 45" },
      { id: 35, username: "You" }
    ],
    messages: [
      { id: 36, sender: "You", content: "message 1", createdAt: Date.now() },
      { id: 37, sender: "Friend 45", content: "message 2", createdAt: Date.now() },
      { id: 38, sender: "Friend 45", content: "message 3", createdAt: Date.now() },
      { id: 39, sender: "You", content: "manny is gay", createdAt: Date.now() },
      { id: 40, sender: "You", content: "message 5", createdAt: Date.now() },
      { id: 41, sender: "Friend 45", content: "message 6", createdAt: Date.now() },
      { id: 42, sender: "You", content: "message 7", createdAt: Date.now() },
    ]
  }
];

// how to display chats, with just the username of particpants
// get an array of user chats with just particpant names separted by commas if applicable

//onclick the chat opens with messages. then have to figure out websockets 
// id:{string}
// participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
// messages: [
//   {
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     content: { type: String, required: true },
//     image: { type: Buffer },
//     createdAt: { type: Date, default: Date.now },
//   },
// ],

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

export default function Chat() {
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
        // setMessages({ ...messages, message: userData.message });
        // setFriends(userData.friends);
        // //console.log(userData.friends);
        // setParamName(searchParams);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, [user]);

  function openChat(obj: Chat | SetStateAction<undefined>) {
    setCurrentChat(obj);
    setChatIsOpen(true);
    console.log(obj);
  }

  function addFriend(){
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

  function removeChat(id: number){
    console.log(id);
    
    const removeChat = exampleChat.filter((chatId => chatId.id !== id ))
    setExampleChat(removeChat);
    // have a condition that sees if the deleted chat is open if yes set this 
    if(currentChat?.id === id) {
    setChatIsOpen(false);
    }
    //when using db delete the chat reference in chat array
    // maybe only use leave or find a way for leave to make you leave and no chat update
    //while x keeps you in chat but not visible idk not practical either leave or x 
    //should suffice
  }

  function handleChange(event: ChangeEvent<HTMLSelectElement>): void {
    const {value,name} = event.target;
    if(name === 'title'){
      setChatTitle(value);
    }
    setCurrentFriendSelected(value);
  }

  async function createChat(){
    // ok now this is going to change the db but only for the user that created this 
    // chat, so we need title and participants. 
    // we make a request to the server and create a chat schema, how do we do this?
    // we first pass the list of participants as well as the token, 
    // the token will be the user that requested the chat creation, we then find the 
    // participants by id or name depending on how the data is passed here dont remember,
    // we then also trim and sanitize the chat title, we then add the users ids as members,
    // but since the chat is new only add the chat reference to the created users array,
    // that way users dont have a chat and dont know where it came from, 
    // in the other component when the user sends the first message, ill enable websockets,
    // as well as check if the size of the messages array. once the first message comes in 
    // thats when i will add the chat reference to the users chat arrays.
    //conditional to not create duplicate 1 on 1 chats only duplicate groups
    if(newChat.length < 2) { 
      const singleUserName = newChat[0].username;
      const existingChat = exampleChat.filter(chat =>
        chat.participants.length === 2
         &&
        chat.participants.some(participant => participant.username === singleUserName)
      );
      if (existingChat.length > 0) {
        setErrorMessage('Chat exists. Only group chats can be duplicates.');
        return;
      }
    }
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/v1/Chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({title:chatTitle,newChat}),
    }); //we do another check for the single user chat 
    if (res.ok) {
      const response = await res.json();
      // const newUserObj = {id:user?.id,username:user?.username};
      // const updatedChatParticipants = [...newChat, newUserObj];
      //no need for these two since since this was an obj to be 
      //added in participants but i have it in backend 
      // const newChatObj:Chat = {
      //   id:uuidv4(),
      //   title:chatTitle,
      //   participants: updatedChatParticipants,
      //   messages:[],
      // } return chat obj 
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
            {chatCreateOpen && <><select id="chatCreate" onChange={handleChange} value={currentFriendSelected} username="chatCreate" >
                  {/* onChange={} value={} */}
              <option value="">Select a friend</option>
              {userFriends.map((friend) => (
                <option key={friend._id} value={JSON.stringify(friend)}>
                  {friend.username}
                  {/* so what i am going to do is i click a friend and have it right under
                  the select and then a user can select another one, and it gets added,
                  then there will a be a button that says create chat and the chat is created 
                  and it opens up where the user can type hey whats up and once there
                  is a message only then does the chat schema get created and added to
                  all users chat array. */}
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