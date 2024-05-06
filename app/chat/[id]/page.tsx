"use client";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import "../../(styles)/chat.css";
import { useAuth } from "@/app/(stores)/authContext";

// interface Chat {
//   id:number;
//   participants: { id: number; username: string; }[];
//   messages: { id: number; sender: string; content: string; createdAt: number; }[];
// }

// participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   messages: [
//     {
//       sender: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//       },
//       content: { type: String, required: true },
//       image: { type: Buffer },
//       createdAt: { type: Date, default: Date.now },
//     },
//   ],


export default function OpenChat({currentChat,userFriends,setCurrentChat,setExampleChat,exampleChat}) { //{ params }: chatParams
  const {user} = useAuth();
  const [count, setCount] = useState(90);
  const [addUserOpen,setAddUserOpen] = useState(false);
  const [currentFriendSelected, setCurrentFriendSelected] = useState();
  const [message, setMessage] = useState({
    id: count, // count was temporary, mongodb will create id 
    sender: user?.username, //user?.username
    content: "",
    createdAt:Date.now(),
  });
  const [editDetails,setEditDetails] = useState()
  const [editing,setEditing] = useState(false);
  const [addedUsers,setAddedUsers] = useState([])
  console.log(currentChat);

  useEffect(() => {
    setAddedUsers([]);
    setCurrentFriendSelected('');
    setEditDetails(currentChat.title)
  }, [currentChat]);

  //soon we have a conditional that checks the size of the chat, if the size is 0,
  //we go to server and create chat document and add the reference to each users array
  //tldr when first message is submitted actually create the chat
  function handleSubmit(event: FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(message.content ==='') {
      return;
    }
    //exampleChat[0].messages.push(message);
    currentChat.messages.push(message); 
    // Update the count for the next message id wont need after hooked to backend?
    setCount((prevCount) => prevCount + 1); 
  
    // Clear the message input field
    setMessage({
      id: count + 1, // Use the next id
      sender: user?.username, // user.username 
      content: "", // Clear the message content
      createdAt:Date.now(),
    });
  }  //remove count since that was just for unique id 

  function handleChange(event: ChangeEvent<HTMLInputElement>){
    const { value, name } = event.target;
    setMessage((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

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


  // function addUserToChat(event: MouseEvent<HTMLButtonElement, MouseEvent>) {
  //   const existingParticipants = addedUsers.filter(user =>
  //     currentChat.participants.some(participant => participant.username === user.username)
  //   );
  
  //   if (existingParticipants.length > 0) {
  //     console.log("User(s) already exist in the chat:", existingParticipants);
  //     return; // Exit the function early
  //   }
  
    // Create a new copy of the chat object with added users

  
    // Update the exampleChat state with the modified chat object
    // const updatedExampleChat = exampleChat.map(chat =>
    //   chat.id === currentChat.id ? currentChat : chat
    // );
  
    // // Update the state
    // setExampleChat(updatedExampleChat);
    // setAddedUsers([]);
    // setCurrentChat(updatedChat);
  // }
  

  async function addUserToChat(event: MouseEvent<HTMLButtonElement, MouseEvent>){

    console.log(currentChat);
    const existingParticipants = addedUsers.filter(user => 
      currentChat.participants.some(participant => participant.username === user.username)
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

    const updatedExampleChat = exampleChat.map(chat =>
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
    //in the backend we pass the token of the user and we pass the id of the chat, we find the chat
    //update its new title to the title we also pass. 
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
    
    const updatedExampleChat = exampleChat.map((chat) => {
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
              .filter(friend => !currentChat.participants.some(participant => participant.username === friend.username))
              .map((friend) => (
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
            <button onClick={addUser}>Add to List</button> 
            {addedUsers.map(friend => (
              <li key={`${friend._id}`}>{friend.username} <button onClick={()=> removeChatFriend(friend)}>&times;</button></li>
            ))}</>}
            {addedUsers.length > 0 && <button onClick={addUserToChat}>Add user{addedUsers.length>1 ? 's' : null} to chat</button>}
        {currentChat.messages.map((chat) => (
            <li
              className={chat.sender.username !== user?.username ? "friendMessages" : "userMessages"}
              key={chat._id} //change this to message.id chat.content._id
            >
              {chat.sender.username} : {chat.content}
            </li>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="messageSubmit"></label>
        <input
          type="text"
          id="messageSubmit"
          name="content"
          onChange={handleChange}
          value={message.content || ""}
        />
        <button type="submit">Send</button>
      </form>
    </div> 
  )

}

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

      //todo
      Allow users to be added to an existing chat
      Utilize User Property for Non-Friend Chats 
      Save and Trim Messages
      Chat Button Functionality on profile page 
      Add Friend to Chat Feature same as inbox search but also adds users who have nonfriendchat to true
      
      Title Property for Chats
      WebSocket Integration
*/