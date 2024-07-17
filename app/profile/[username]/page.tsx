"use client";
import { ChangeEvent, FormEvent, use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/(stores)/authContext";
import { country_list } from "@/app/utils/countries";
import "../../(styles)/profile.css"
import "../../(styles)/post.css"
import Image from "next/image";
import React from "react";
import io, { Socket } from "socket.io-client"
import Modal from "@/app/(components)/Modal";
import DalleModal from "@/app/(components)/dalleModal";

interface User {
  user: any;
  _id: string;
  username?: string;
  password?: string;
  email?: string;
  details: EditDetails;
  profilePic?: string;
  status: string;
  nonFriendsChat?: boolean;
  friends: Friend[];
  suggestedFriends?: Friend[];
  wall: Wall[];
  chats: Chat[];
}

interface ProfileParams {
  params: {
    username: string; // Assuming username is actually the user ID
  };
}

interface Comment {
  _id:string;
  sender:{_id:string,username:string,profilePic:string};
  message:string;
  image?:string;
  time:Date;
}

interface Wall {
  _id:string
  user:{_id:string,username:string,profilePic:string};
  content:string;
  likes: {_id:string,username:string,profilePic:string}[];
  replies:Comment[],
  image?: string;
  createdAt:Date;
}

interface Post {
  post:string | number | readonly string[] | undefined;
  image:string | undefined | null;
}

 interface Like  {
  _id: string;
  username: string;
  profilePic: string;
  status?: string;
}

interface EditDetails {
  username: string;
  age: string| number;
  bio: string;
  hobbies: string;
  job: string;
  location: string;
  sex: string;
  profilePic: string | null;
}

interface Friend {
  _id: string;
  username: string;
  profilePic: string;
}

interface Chat{
  title:string;
  participants: Friend[];
  messages: {
    sender: Friend;
    content: string | null;
    image?: string | null;
    createdAt: Date;

  }[];
  leftChatCopy:boolean;
}

const getData = async (id: string) => {
  //change this to get req via query string
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/v1/Profile/${id}`, {
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

export default function Profile({ params }: ProfileParams) {
  const { username } = params;
  const [data, setData] = useState<User | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [editDetails, setEditDetails] = useState<EditDetails>({
    username: "",
    age: "",
    bio: "",
    hobbies:"",
    job: "",
    location: "",
    sex: "",
    profilePic:null,
  });
  const [imgURL,setImgURL] = useState<string | null |undefined>(undefined);
  const [visibleComments, setVisibleComments] = useState<Record<string, boolean>>({}); //tracks which posts have their comments visible
  const [commentsToShow, setCommentsToShow] = useState<Record<string, number>>({}); //tracks how many comments to show for each post 
  const router = useRouter();
  const { user,login } = useAuth();

 
  const [newPostContent, setNewPostContent] = useState<Post>({
    post:"",
    image:undefined,
  }); //content of a new wall post
  const [newComments, setNewComments] = useState<Record<string, { comment: string; image: string | null }>>({}); //holds new comments for each post, identified by post ID 
  const [socket, setSocket] = useState<Socket | undefined>();
  const [openModal,setOpenModal] = useState(false);
  const [modalLikes,setModalLikes] = useState<Like[] | undefined>();
  const [postImgURL,setPostImgURL] = useState<string | null | undefined>();
  const [commentImgURL,setCommentImgURL] = useState<string | null | undefined>();
  const [posts, setPosts] = useState<Wall[]>([]);
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);

  const editfileInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getData(username);
        setData(userData);
        console.log(userData);
        setPosts(userData.user.wall)
        setEditDetails((prev) => ({
          ...prev,
          username: userData?.user.username,
          age: userData?.user.details.age,
          bio: userData?.user.details.bio,
          hobbies:userData?.user.details.hobbies.join(', '),
          job: userData?.user.details.job,
          location: userData?.user.details.location,
          sex: userData?.user.details.sex,
          profilePic: userData?.user.profilePic,
        }));
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
    const socket = io('http://localhost:3001');
    setSocket(socket);
    if (user?.id) {
      fetchData();
      socket.emit('joinWall', { userId: user.id });
    }

    socket.on('create-wallPost', (wallPost) => {
      if(username === wallPost.user._id) {
        setPosts((prevPosts) => [wallPost, ...prevPosts]);
      }
    });

    socket.on('delete-comment', (commentId) => {
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts?.map((post) => {
          if (post.replies.some((reply) => reply._id === commentId)) {
            const updatedReplies = post.replies.filter((reply) => reply._id !== commentId);
            return { ...post, replies: updatedReplies };
          }
          return post;
        });
        return updatedPosts;
      });
    })

    socket.on('delete-wallPost', (wallId) => {
      setPosts((prev) => {
        const updatedPosts = prev?.filter(posts => posts._id !== wallId);
        return updatedPosts;
      })
    })

    socket.on('toggle-like', (action,wallId,userId,username,profilePic) => {
      setPosts((prevPosts) =>
      prevPosts?.map((post) => {
        if (post._id === wallId) { //find post by its id
          if (action === 'add') { //if clicked like button 
            const newLikes = [...post.likes, { _id: userId, username: username, profilePic:profilePic }]; //add users like to current likes 
            return { ...post, likes: newLikes }; //update the likes 
          } else { //if clicked unlike
            const newLikes = post.likes.filter((like) => like._id !== userId); //remove users like 
            return { ...post, likes: newLikes }; //update the likes  
          }
        }
        return post;
      })
    );
    })
    
    socket.on('create-comment', (wallId, newComment,userId) => {
      setNewComments((prevComments) => ({
        ...prevComments,
        [wallId]: { comment: '', image: null }
    }));

      setPosts((prevPosts) => {
        const updatedPosts = prevPosts?.map((post) => {
          if (post._id === wallId) {
            return { ...post, replies: [...post.replies, newComment] };
          }
          return post;
        });

        const updatedPost = updatedPosts?.find((post) => post._id === wallId);
        if (updatedPost && user?.id === userId) {
          setCommentsToShow((prevState) => ({
            ...prevState,
            [wallId]: updatedPost.replies.length,
          }));
        }

        setVisibleComments((prevState) => ({
          ...prevState,
          [wallId]: false,
        }));

        return updatedPosts;
      });
    });

    return () => {
      socket.disconnect();
    };
    
  }, [username,user?.id]); //because of next naming conventions this is the id

  
  const toggleComments = (postId: string) => {
    setVisibleComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[Number(postId) ],
    }));
  }; //toggles the visibility of comments for a specific post (postId)

  const loadMoreComments = (postId:string) => {
    setCommentsToShow((prevState) => ({
      ...prevState,
      [postId]: (prevState[postId] || 3) + 3,
    }));
  }; //increments the number of comments shown for a specific post

   async function handleAddFriend(_id: string) {

    const token = localStorage.getItem("token");
    const response = await fetch("/api/v1/Friendship", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(_id),
    });

    if (!response.ok) {
      throw new Error("Failed to handle friend request");
    }
    setData((prev) => ({
      ...prev!,
      status: "pending",
    }));
  }

  async function goToChat(username: string,id: string) {
    //go chat with them, and open up the chat page in the list of chats
    
    const existingChat = data?.user.chats.some((chat: Chat) =>
      chat.participants.length === 2
       &&
      chat.participants.some(participant => participant.username === username)
      && 
      chat.participants.some(participant => participant.username === user?.username)
    );
    console.log(existingChat);

    if (!existingChat){ 
      console.log('gi')
    
    const chatTitle = `${user?.username} and ${username}`
    const newChat = [{_id:id,username}];

    const res = await fetch(`/api/v1/Chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({title:chatTitle,newChat}),
    });

    if (res.ok) {
      router.push(`/chat/?username=${username}&_id=${id}`);
    } else {
      return;
    }
  }
    router.push(`/chat/?username=${username}&_id=${id}`);
  }

  async function removeFriend(_id: string) {
    console.log(_id);

    const token = localStorage.getItem("token");
    const response = await fetch("/api/v1/Friendship", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(_id),
    });
    if (!response.ok) {
      throw new Error("Failed to remove friend");
    }
    
    setData((prevData) => {
      if (!prevData) {
        return prevData;
      }
      return {
        ...prevData,
        friends: prevData.friends.filter(friend => friend._id !== _id),
      };
    });
  }

  function goToInbox(username:string){
    router.push(`/inbox/?username=${username}`);  
  }

  function detailsEdit(event: React.MouseEvent<HTMLButtonElement>): void {
    setEditing(true);
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value,files } = e.target as HTMLInputElement;
 
    if (name === 'profilePic' && files) {
      if (imgURL) {
        URL.revokeObjectURL(imgURL);
      }
      const url = URL.createObjectURL(files[0]);
      setImgURL(url);
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;

        setEditDetails((prevState) => ({
          ...prevState,
          profilePic: base64String,
        }));
      };
      reader.readAsDataURL(files[0]);
    } else if (name === 'job'){ 
      setEditDetails((prevState) => ({
        ...prevState,
        job: value,
      }));
    }else if (name === 'hobbies') {
      setEditDetails((prevState) => ({
        ...prevState,
        hobbies: value,
      }));
    }
    else if (name === 'age'){ 
      const editedAge = parseInt(value, 10);
      setEditDetails((prevState) => ({
          ...prevState,
          [name]: editedAge,
      }));
    }
    else {
      setEditDetails((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if(editDetails.profilePic !== data?.user.profilePic) {
      console.log('hi')
    }
    const updatedDetails = {
      ...editDetails,
      hobbies: editDetails.hobbies.split(',').map((hobby) => hobby.trim()),
    };
    console.log(updatedDetails)
    const token = localStorage.getItem("token") as string
    const id = localStorage.getItem("id") as string
    try {
      const response = await fetch(`/api/v1/Profile/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ updatedDetails, id }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to save details");
      }
      console.log(responseData);
      setData((prevData) => {
        if (!prevData) {
          // If prevData is undefined, return it as-is
          return prevData;
        }
      
        // Ensure the returned object conforms to the User type
        return {
          ...prevData,
          user: {
            ...prevData.user,
            username: responseData.newlyEditedData.username,
            details: {
              ...prevData.user.details,
              age: responseData.newlyEditedData.age,
              bio: responseData.newlyEditedData.bio,
              hobbies: responseData.newlyEditedData.hobbies,
              job: responseData.newlyEditedData.job,
              location: responseData.newlyEditedData.location,
              sex: responseData.newlyEditedData.sex,
            },
            profilePic: responseData.newlyEditedData.profilePic,
          },
        };
      });
      
      localStorage.setItem("profilePic", responseData.newlyEditedData.profilePic);
      localStorage.setItem("username",responseData.newlyEditedData.username);
      login({token:token,id:id, profilePic:responseData.newlyEditedData.profilePic, username:responseData.newlyEditedData.username}); // Update user context
      setEditing(false);
      if (editfileInputRef.current) {
        editfileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error(error, "failed to reach server");
    }
  }


function deletePost(_id:string): void {
  socket?.emit('delete-wallPost', {wallId:_id,token: `Bearer ${user?.token}`});
}

function openModalList(likes: { _id: string; username: string; profilePic: string; }[]) {
  setModalLikes(likes.reverse());
  setOpenModal(true);
}

const addOrRemoveLike = (postId: string, action: string) => {
  if (!user) return; //no login no likeZ
  socket?.emit('toggle-like', {action,wallId:postId,token: `Bearer ${user?.token}`});

}; //handles liking and unliking a post

function deleteComment(_id: string,wallId: string) {
  socket?.emit('delete-comment', {wallId,commentId:_id,token: `Bearer ${user?.token}`});
}

  function handleNewPostChange(
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ): void {
    const { value, name , files} = event.target as HTMLInputElement;

    if (name === 'image' && files) {
      if (postImgURL) {
        URL.revokeObjectURL(postImgURL);
      }

      const url = URL.createObjectURL(files[0]);
      setPostImgURL(url);

      const base64Conversion = new FileReader();
      base64Conversion.onloadend = () => {
        setNewPostContent((prev) => ({
          ...prev,
          image: base64Conversion.result as string,
        }));
      };
      base64Conversion.readAsDataURL(files[0]);
      } else {
        setNewPostContent((prev) => ({ ...prev, post: value }));
      }
  }; //on change value of wall post form

  const handleWallSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) return;  //user must be logged in to submit a post
    
    if(newPostContent.post === '' && newPostContent.image === null) {
      return;
    }

    let hasImage = newPostContent.image !== null;

    const res = await fetch(`/api/v1/s3Img`, {  
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ post: newPostContent.post,image:newPostContent.image,hasImage})
    });
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const {url,wallId} = await res.json();
    
    let imageURL = url;
  
    console.log(imageURL);
    socket?.emit('create-wallPost', ({imageURL,wallId,token: `Bearer ${user?.token}`}));
    setNewPostContent({
      post:"",
      image:null,
    });
    if (postImgURL) {
      URL.revokeObjectURL(postImgURL);
    }
    setPostImgURL('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }; //creates a new post and adds it to the posts state, ws later

  const handleNewCommentChange = (postId: string, event: ChangeEvent<HTMLInputElement>) => {
    console.log(newComments);
    const {name,value,files} = event.target;
    if(name === 'image' && files) {
      if (commentImgURL) {
        URL.revokeObjectURL(commentImgURL);
      }
      const url = URL.createObjectURL(files[0]);
      setCommentImgURL(url);
      const base64Conversion = new FileReader();
      base64Conversion.onloadend = () => {
        setNewComments(prevComments => ({
          ...prevComments,
          [postId]: {
            ...prevComments[Number(postId)],
            image: base64Conversion.result as string,
          }
        }));
      };
      base64Conversion.readAsDataURL(files[0]);
    } else {
      setNewComments(prevComments => ({
        ...prevComments,
        [postId]: {
          ...prevComments[Number(postId)],
          [name]: value,
        }
      }));
    }
  }; 

  const handleCommentSubmit = async (postId: string, event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;//user must be logged in to submit a comment

    if(!newComments[postId].comment && !newComments[postId].image){
      return;
    }
    let hasImage = true; 
    if( newComments[postId].image === undefined || newComments[postId].image === null ) {
      hasImage = false;
    }
    
    console.log(newComments[postId].image)
    let newComment = newComments[postId].comment; //get the submitted comment and/or image 
    console.log(hasImage);
    const res = await fetch(`/api/v1/Post`, {   
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ comment: newComment,image:newComments[postId].image,hasImage,wallId:postId})
    });
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const {url,comment,commentId} = await res.json();
    let imageURL = url;
  
   console.log(imageURL);
   socket?.emit('create-comment', ({imageURL,comment,wallId:postId,token: `Bearer ${user?.token}`}));
  };

  return (
    <div>
      {!editing ? (
        <>
          <Image className='profileImg' height={400} width={400} src={data?.user.profilePic} alt={"Profile Image"} />
          <ul>
            <li>{data?.user.username}</li>
            <li>Age: {data?.user.details.age}</li>
            <li>Bio: {data?.user.details.bio}</li>
            <li>Hobbies: {data?.user.details.hobbies.join(', ')}</li>
            <li>Occupation: {data?.user.details.job}</li>
            <li>Location: {data?.user.details.location}</li>
            <li>Sex: {data?.user.details.sex}</li>
            {user?.id === data?.user._id && (
              <button onClick={detailsEdit}>Edit</button>
            )}
          </ul>
        </>
      ) : (
        <> 
          <button onClick={() => setShowModal1(!showModal1)}>
              {showModal1 || 'Edit pfp with AI'}
          </button>
          {showModal1 && <DalleModal imgURL={imgURL} setEditDetails={setEditDetails} setImgURL={setImgURL} fileInputRef={editfileInputRef} showModal={showModal1} setShowModal={setShowModal1} setFormData={null} setNewComments={null} postId={null} fromChat={false} />}
          <form onSubmit={handleSubmit}>
              <div>
            {imgURL ? <Image className="profileImg" src={imgURL} height={400} width={400} alt="Profile Preview" /> :
            <Image className='profileImg' height={400} width={400} src={data?.user.profilePic} alt={"Profile Preview"} /> }
            <input type="file" id="profilePic" name="profilePic" accept="image/jpeg" ref={editfileInputRef} onChange={handleChange}/>
            </div>
            <div>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={editDetails.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="age">Age:</label>
              <input
                type="number"
                id="age"
                name="age"
                value={editDetails.age}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="bio">Bio:</label>
              <textarea
                id="bio"
                name="bio"
                value={editDetails.bio}
                onChange={handleChange}
              ></textarea>
            </div>
            <div>
              <label htmlFor="hobbies">Hobbies:</label>
              <textarea
                id="hobbies"
                name="hobbies"
                value={editDetails.hobbies}
                onChange={handleChange}
              ></textarea>
            </div>
            <div>
              <label htmlFor="job">Occupation:</label>
              <input
                type="text"
                id="job"
                name="job"
                value={editDetails.job}
                onChange={handleChange}
              />
            </div>
            <div>
              <select
                id="location"
                name="location"
                value={editDetails.location}
                onChange={handleChange}
              >
                <option value="United States of America">
                  United States of America
                </option>
                {country_list.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sex">Sex:</label>
              <select
                id="sex"
                name="sex"
                value={editDetails.sex}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </form>
        </>
      )}
      <div>
      <div>
        {user?.id !== data?.user._id &&
          data?.user.nonFriendsChat && (
            <button onClick={() => goToChat(data?.user.username,data?.user._id)}>Chat</button>
        )}

        {user?.id !== data?.user._id &&
          (data?.user.friends.some((friend: Friend) => friend._id === user?.id) ? (
            <>
              <button onClick={() => goToChat(data?.user.username,data?.user._id)}>Chat</button>
              <p>
                Friends{" "}
                <button onClick={() => removeFriend(data?.user._id)}>
                  Remove Friend
                </button>
              </p>
              <button onClick={()=>goToInbox(data?.user.username)}>Send inbox</button>
            </>
          ) : (
            <>
              {data?.status === "pending" ? (
                <button>Requested</button>
              ) : (
                <button onClick={() => handleAddFriend(data?.user._id)}>
                  Add Friend
                </button>
              )}
              <button onClick={()=>goToInbox(data?.user.username)}>Send inbox</button>
            </>
          ))}
        <h2>Friends list </h2>
        <ul>
          {data?.user.friends.map((friend:Friend) => (
            <li key={friend.username} className="namePlusDropdown">
              <Link href={`/profile/${friend._id}`}>
                <div className="picAndName">
                  <Image className='friendsProfilePic' height={20} width={20} src={friend.profilePic} alt={"friends profile pics"} />
                  <p>{friend.username}</p>
                </div>
              </Link>
              {user?.id === data?.user._id && (
                <div className="dropdown">
                  <div id={`dropdown-${friend.username}`} className="dropdown-menu">
                    <button onClick={() => goToChat(friend.username,friend._id)}>Chat</button>
                    <button onClick={() => goToInbox(friend.username)}>Inbox</button>
                    <button onClick={() => removeFriend(friend._id)}>
                      Remove Friend
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
        {user?.id === data?.user._id && (
          <div>
            <h2>Suggested Friends</h2>
            {data?.suggestedFriends?.map((sFriend) => (
              <Link key={sFriend._id} href={`/profile/${sFriend._id}`}>
                <div className="picAndName">
                  <Image className="friendsProfilePic" src={sFriend.profilePic} height={20} width={20} alt={`${sFriend.username}'s profile picture`} />
                  <p>
                    {sFriend.username} <button>View Profile</button>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div>












        
      <div className="wallPage">
        {/* so you can actually pass the filteredId and the token if match good else return */}
          {user?.id === data?.user._id && (<form onSubmit={handleWallSubmit} className="wallPostForm">
            <label htmlFor="newPost"> What&apos;s on your mind? </label>
            <textarea
              id="newPost"
              placeholder="What's on your mind?"
              value={newPostContent.post}
              onChange={handleNewPostChange}
            />
            <label htmlFor="image">Add a picture:</label>
            <input type="file" 
              id="image" 
              name="image" 
              accept="image/jpeg" 
              ref={fileInputRef}
              onChange={handleNewPostChange}
            />
            {newPostContent.image && <Image className="postPreview" src={postImgURL || ''} alt="Preview" height={100} width={100} />}
            <button type="submit">Post</button>
          </form>)}
          {user?.id === data?.user._id && <button onClick={() => setShowModal2(!showModal2)}>
              {showModal2 || 'Add an ai Image to your post'}
          </button>}
          {showModal2 && <DalleModal imgURL={postImgURL} setFormData={setNewPostContent} setImgURL={setPostImgURL} fileInputRef={fileInputRef} setEditDetails={null} showModal={showModal2} setShowModal={setShowModal2} setNewComments={null} postId={null} fromChat={false}/>}
        </div>
        <div>
          {posts?.map((post) => (
            <div key={post._id} className="wallPosts">
              {user?.id === post.user._id ? <div onClick={()=> deletePost(post._id)} className="xButtonn">&times;</div> : <div></div>}
                <Link href={`/profile/${post.user._id}`}>
                  <div className="picAndName">
                        <Image className='profilePic' height={40} width={40} src={post.user.profilePic} alt={"Profile Pic"} />
                        <p>{post.user.username}</p>
                  </div>
                </Link>
                <p>{post.content}</p>
                <div className="wallPostInfo">
                {post.image &&
                <div className="imgHolder">
                  <Image className='img' height={300} width={300} src={post.image} alt="post img"/> 
                </div>
                }
                <p>{new Date(post.createdAt).toLocaleString()}</p>
                <p>
                  {post.likes.length > 2 
                    ? (<><Link href={`/profile/${post.likes[post.likes.length - 1]._id}`}>{post.likes[post.likes.length - 1].username}</Link>, <Link href={`/profile/${post.likes[post.likes.length - 2]._id}`}>{post.likes[post.likes.length - 2].username}</Link> and <span className='openModal' onClick={()=> openModalList(post.likes)}>{post.likes.length - 2} others liked this post</span></>)
                    : post.likes.length === 0
                      ? 'Be the first to like this post!'
                      : post.likes.length === 2 ? (
                        <>
                          {post.likes.map((like, index) => (
                            <React.Fragment key={like._id}>
                              {index > 0 && ' and '}
                              <Link href={`/profile/${like._id}`}>{like.username}</Link>
                            </React.Fragment>
                          ))}{' '}
                          liked this post
                        </>
                      ) :
                      (<><Link href={`/profile/${post.likes[0]._id}`}>{post.likes[0].username}</Link> liked this post</>)}
                </p>
                <button onClick={() => addOrRemoveLike(post._id, post.likes.some((like) => like._id === user?.id) ? 'remove' : 'add')}>
                  {post.likes.some((like) => like._id === user?.id) ? 'Unlike' : 'Like'}
                </button>
                <br />
                {post.replies.length > 0 && <button onClick={() => toggleComments(post._id)}>
                  {visibleComments[post._id] ? 'Show Comments' : 'Hide Comments'}
                </button>}
              </div>
              {!visibleComments[post._id] && (
                <div>
                  {post.replies.slice(0, commentsToShow[post._id] || 3).map((reply) => (
                    <div key={reply._id} className="comments">
                    <div>
                      <Link href={`/profile/${reply.sender._id}`}>
                        <div className="picAndName">
                          <Image className='profilePic' src={reply.sender.profilePic} height={40} width={40} alt={"Profile Pic"} />
                          <p>{reply.sender.username}</p>
                        </div>
                      </Link>
                      {reply.image && <Image className="replyimg" src={reply.image || ''} height={150} width={150} alt={"Image reply preview"} /> }

                      <p>{reply.message}</p>
                      <p>{new Date(reply.time).toLocaleString()}</p>
                    </div>
                    {user?.id === post.user._id || reply.sender._id === user?.id ? <div className='xButton' onClick={()=>deleteComment(reply._id,post._id)}>&times;</div> : null}
                    </div>
                  ))}
                  {post.replies.length > (commentsToShow[post._id] || 3) && (
                    <button onClick={() => loadMoreComments(post._id)}>
                      Load More Comments
                    </button>
                  )}
                </div>
              )}
              <form onSubmit={(e) => handleCommentSubmit(post._id, e)}>
                <label htmlFor={`comment-${post._id}`}>Comment on this post</label>
                <input
                  id={`comment-${post._id}`}
                  type="text"
                      placeholder="Comment on this post"
                      name="comment"
                      value={newComments[post._id]?.comment || ''} 
                      onChange={(e) => handleNewCommentChange(post._id, e)}
                    />
                    <input type="file" id="image" name="image" accept="image/jpeg" onChange={(e) => handleNewCommentChange(post._id, e)} />
                    <button type="button" onClick={() => setShowModal3(!showModal3)}>
                      {showModal3 || 'Add an ai Image to your comment'}
                    </button>
                    <button type="submit">Post</button>
                     {newComments[post._id]?.image && <Image className="postPreview" src={commentImgURL || ""} height={100} width={100} alt="Preview" />} 
              </form>
              {showModal3 && <DalleModal imgURL={commentImgURL} postId={post._id} setFormData={null} setNewComments={setNewComments} setImgURL={setCommentImgURL} fileInputRef={undefined} setEditDetails={null} showModal={showModal3} setShowModal={setShowModal3} fromChat={false}/>}
            </div>
          ))}
        </div>
        </div>
      </div>
      {openModal && (
        <Modal likes={modalLikes} setOpenModal={setOpenModal} />
      )}
    </div>
  );
}
