"use client";
import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import "../../(styles)/chat.css";
import { useAuth } from "@/app/(stores)/authContext";
import { v4 as uuidv4 } from "uuid";
import io from 'socket.io-client';
import Resizer from 'react-image-file-resizer';
import DalleModal from "@/app/(components)/dalleModal";


//const socket = io('http://localhost:3001');

export default function OpenChat({currentChat,userFriends,setCurrentChat,setExampleChat,exampleChat}) { //{ params }: chatParams
  const {user} = useAuth();
  const [addUserOpen,setAddUserOpen] = useState(false);
  const [currentFriendSelected, setCurrentFriendSelected] = useState();
  const [sentMessage, setSentMessage] = useState({
    message:'',
    image:null,
  });

  const [editDetails,setEditDetails] = useState()
  const [editing,setEditing] = useState(false);
  const [addedUsers,setAddedUsers] = useState([])
  const [socket,setSocket] = useState();
  const [imgURL,setImgURL] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => { 
    setAddedUsers([]);
    setCurrentFriendSelected('');
    setEditDetails(currentChat.title);
    const socket = io('http://localhost:3001');
    setSocket(socket);
  
    // Join all chat rooms the user is part of
    exampleChat.forEach(chatId => {
      socket.emit('joinChat', { chatId: chatId._id, userId: user?.id });
    });
  
    socket.on('get-message', (message,chatId) => {
      console.log(message);
      setExampleChat((prevChats) => {
        return prevChats.map((chat: { _id: any; messages: any; }) => {
          if (chat._id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, message]
            };
          }
          return chat;
        });
      });
  
      if (chatId === currentChat._id) {
        setCurrentChat((prevChat) => ({
          ...prevChat,
          messages: [...prevChat.messages, message],
        }));
      }
    });
  
    return () => {
      socket.disconnect();
    };
  }, [setExampleChat, currentChat._id, setCurrentChat, exampleChat, user?.id, currentChat.title]);
  

  function handleSubmit(event: FormEvent<HTMLFormElement>){
    event.preventDefault();
    
    if(sentMessage.message === '' && (sentMessage.image === null || sentMessage.image === undefined) ) {
      return;
    }
    console.log(sentMessage);
    socket.emit('get-message', {message:sentMessage,currentChatId:currentChat._id,token: `Bearer ${user?.token}`});
    setSentMessage({
      message:'',
      image:null,
    })
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
  } 

  function handleChange(event: ChangeEvent<HTMLInputElement>){
    const { value, name ,files} = event.target;
    if (name === 'image' && files) {
      if (imgURL) {
        URL.revokeObjectURL(imgURL);
      }
      const url = URL.createObjectURL(files[0]);
      setImgURL(url);
      Resizer.imageFileResizer(
        files[0],
        150,
        150,
        'JPEG',
        100,
        0,
        (uri) => {
          setSentMessage((prev) => ({
            ...prev,
            image: uri as string,
          }));
        },
        'base64'
      );        
      } else {
        setSentMessage((prev) => ({ ...prev, message: value }));
      }
  };
  

  function handleChangee(event: ChangeEvent<HTMLSelectElement>): void {
    const {value} = event.target;
    setCurrentFriendSelected(value);
  }

  function addUser(event: MouseEvent<HTMLButtonElement, MouseEvent>) {
    console.log(currentFriendSelected)
    if(currentFriendSelected) {
      const friendObject = JSON.parse(currentFriendSelected);
      console.log(friendObject);
      const alreadyAdded = addedUsers.find(friend => friend.username === friendObject.username);
      if(!alreadyAdded){
        setAddedUsers(prev => [...prev,friendObject]);
      }
    }
  }

  function removeChatFriend(friend:string){
    setAddedUsers(prev => prev.filter(friendName => friendName !== friend));
  }
  

  async function addUserToChat(event: MouseEvent<HTMLButtonElement, MouseEvent>){

    console.log(currentChat);
    const existingParticipants = addedUsers.filter(user => 
      currentChat.participants.some((participant: { username: string; }) => participant.username === user.username)
    );

    if (existingParticipants.length > 0) {
      console.log("User(s) already exist in the chat:", existingParticipants);
      return; 
    }  
    const res = await fetch(`/api/v1/Chat/${currentChat._id.toString()}/patch`, {
      method:'PATCH',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({addedUsers,id:currentChat._id})
    })

    if (!res.ok) {
      throw new Error('Failed to update Chat Title');
    } 
    const updatedChat = {
      ...currentChat,
      participants: [...currentChat.participants, ...addedUsers]
    };

    const updatedExampleChat = exampleChat.map((chat: { _id: String; }) =>
      chat._id === currentChat._id ? updatedChat : chat
    );
  
    // Update the state
    setExampleChat(updatedExampleChat);
    setAddedUsers([]);
    setCurrentChat(updatedChat);
    console.log(updatedChat);
  }


  function changeTitle(event: MouseEvent<HTMLButtonElement, MouseEvent>){
    setEditing(true);
  }
  
  function handleTitleChange(event: MouseEvent<HTMLButtonElement, MouseEvent>){
    const {value} = event.target;
    setEditDetails(value)
  }

  async function newTitle(event: MouseEvent<HTMLButtonElement, MouseEvent>) {

    if (!editDetails.trim()) {
      return;
    }

    const res = await fetch(`/api/v1/Chat/${currentChat._id.toString()}`, {
      method:'PATCH',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({currentChat:currentChat._id,newTitle:editDetails.trim()})
    })

    if (!res.ok) {
      throw new Error('Failed to update Chat Title');
    } 
    const response = await res.json();
    console.log(response);
    
    setCurrentChat((prev) => ({
      ...prev,
      title: editDetails.trim(), // Set the new title and trim any leading/trailing whitespace
    }));
  
    const updatedExampleChat = exampleChat.map((chat) => {
      if (chat._id === currentChat._id) {
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
  

  async function leaveChat(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
    const res = await fetch(`/api/v1/Chat/${currentChat._id.toString()}/put`, {
      method:'PUT',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({currentChat})
    })

    if (!res.ok) {
      throw new Error('Failed to update Chat Title');
    } 
    const {copyChat} = await res.json();
    console.log('gi')
    console.log(copyChat);
    
    const updatedExampleChat = exampleChat.map((chat: { _id: string; }) => {
      if (chat._id === currentChat._id) {
        return copyChat; // replace currentchat with copychat
      }
      return chat;
    });
    setCurrentChat(copyChat);
    setExampleChat(updatedExampleChat);
  }

  return (
     <div className="currentChat"> 
      {!editing ? <h3>{currentChat.title} <button onClick={changeTitle}>Edit Title</button></h3> :
       <> <label htmlFor="title">ChatTitle:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={editDetails}
          onChange={handleTitleChange}
        /> <button onClick={newTitle}>Change</button> <button onClick={()=>{setEditing(false);setEditDetails(currentChat.title)}}>Cancel</button></>}
      <div className="actualChat">
        <button onClick={leaveChat}>Leave</button>
        <button onClick={() => setAddUserOpen(!addUserOpen)}>Add User</button>
        {addUserOpen && <><select id="chatCreate" onChange={handleChangee} value={currentFriendSelected} username="chatCreate" >
                  {/* onChange={} value={} */}
              <option value="">Select a friend</option>
              {userFriends
              .filter(friend => !currentChat.participants.some((participant: { username: string; }) => participant.username === friend.username))
              .map((friend) => (
                <option key={friend._id} value={JSON.stringify(friend)}>
                  {friend.username}
                </option>
              ))}
            </select> 
            <button onClick={addUser}>Add to List</button> 
            {addedUsers.map(friend => (
              <li key={`${friend._id}`}>{friend.username} <button onClick={()=> removeChatFriend(friend)}>&times;</button></li>
            ))}</>}
            {addedUsers.length > 0 && <button onClick={addUserToChat}>Add user{addedUsers.length>1 ? 's' : null} to chat</button>}
        {currentChat.messages.map((chat) => (
          <div key={uuidv4()}>
            <li
              className={chat.sender.username !== user?.username ? "friendMessages" : "userMessages"}
               //change this to message.id chat.content._id
            >
              
              {chat.sender.username} : {chat.content} 
              {/* && (chat.image ? <img className="preview" src={chat.image} alt="Profile Preview" /> : null)} */}
            </li>
            { chat.image && (<img className="chatImage" src={chat.image} />)}
            </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
      <div className="messageItems"> 
      <div className="messageImgItems"> 
      {sentMessage.image && <img className="chatImgPreview" src={imgURL} alt="Profile Preview" />}
      <button onClick={() => setShowModal(!showModal)}>
            {showModal ? 'Cancel' : 'Chat using ai images'}
      </button>
      <input type="file" id="image" name="image" accept="image/jpeg" ref={fileInputRef} onChange={handleChange}/>
       </div><div>
                <label htmlFor="messageSubmit"></label>
        <input
          type="text"
          id="messageSubmit"
          name="message"
          onChange={handleChange}
          value={sentMessage.message || ""}
        />
      
        <button type="submit">Send</button></div></div>
        
      </form>
      {showModal && <DalleModal imgURL={imgURL} setFormData={setSentMessage} setImgURL={setImgURL} fileInputRef={fileInputRef} setEditDetails={undefined} setNewComments={undefined} postId={undefined} fromChat={true} showModal={showModal} setShowModal={setShowModal}/>}
    </div> 
  )
}

// else if (name === 'image' && files) {
//   //     image:null,
// // });
// // const [imgURL,setImgURL] = useState<string | undefined>();




//   if (imgURL) {
//     URL.revokeObjectURL(imgURL);
//   }
//   const url = URL.createObjectURL(files[0]);
//   setImgURL(url);
//   const reader = new FileReader();
//   reader.readAsDataURL(files[0]);
//   reader.onload = () => {
//     const str = reader.result?.toString();
//     if (str) {
//       const buffer = Buffer.from(str.split(',')[1], 'base64');
//       setFormData((prev) => ({
//         ...prev,
//         image: buffer,
//       }));
//     }
//   };


//   <label htmlFor="image">Add a picture:</label>
//        <input type="file" id="image" name="image" accept="image/jpeg" value={sentMessage.image} onChange={handleChange}/>
//        {sentMessage.image && <img className="preview" src={imgURL} alt="Profile Preview" />}

//todo 
//find way to load up array of participants/make an array of more objects,
// and have the particpants in one group per side, make chats with two particpants,
//being you and a friend and make a couple more group chats too, 


//ok so this page is the component on the second page  <ChatList/>\

//todo2
/* Ok so here are somethings i should add and some things i would like to add,kinda surprised
i was this close to finishing so this is just a rough draft of features i would 
like to add, i want a delete chat button, and a method for a user to leave a chat, i 
think i also want to make use of the user property that allows users to chat nonfriends
of course i have to save and trim each message, i have to make sure chat button finds
the chat or creates it and opens it when clicked on in profile page oh i should have an
add friend to chat feature which works if either one of the users are friends with the added
person or if they have nonfriends chat as true, oh i have to figure out how to make group chats
it seems easier with friends and i think i should disregard nonchat friends for this feature,
ill have a create chat and it will have all the users friends and they can click on as
many friends they want to add to a chat and omly for one on one chats should the i sesrch
the db if the chat exists and deny the request, i think i should add a title property to the 
chats, if its a non one on one chat, websockets too but i think these features are easier
to implement since i dont know much about websockets 


      TLDR: 
      //done
      Add Delete Chat Button  
      Implement Leave Chat Method //chat is there,doesnt let you type nor is it updated,might not do 
      Add create chat button 
      Group Chats Implementation
      Chat Existence Checking for One-on-One Chats
      Allow users to be added to an existing chat
      Utilize User Property for Non-Friend Chats 
      Save and Trim Messages
      Chat Button Functionality on profile page 
      Title Property for Chats
      WebSocket Integration
      //todo
      Add Friend to Chat Feature same as inbox search but also adds users who have nonfriendchat to true
      
      
*/

