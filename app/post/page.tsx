"use client";
import Link from "next/link";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAuth } from "../(stores)/authContext";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import '../(styles)/post.css'

// Fixed date for consistency between server and client
const fixedDate = new Date(2024, 4, 27, 18, 0, 0); // May 27, 2024, 6:00:00 PM

const exampleWall = [
  { 
    _id: uuidv4(),
    user: {_id: '66330f9fa36219ae0ce59668',username:'Emily.Haley54'},
    content: 'This is a content for name 1 with some id',
    image:'image: could be blank',
    createdAt: fixedDate,
    likes: [
      { _id: uuidv4(), username: "Name 2" },
      { _id: uuidv4(), username: "Name 3" },
      { _id: uuidv4(), username: "Name 4" },
      { _id: uuidv4(), username: "Name 5" },
    ],
    replies: [
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 2"}, content: "message 1", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 3"}, content: "message 2", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 4"}, content: "message 3", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 5"}, content: "message 4", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 14"}, content: "message 14", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 15"}, content: "message 15", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 16"}, content: "message 16", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 17"}, content: "message 17", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
    ]
  },
  { 
    _id: uuidv4(),
    user: {_id: uuidv4(),username:'Name 2'},
    content: 'This is a content for name 2 with some id',
    image:'image: could be blank',
    createdAt: fixedDate,
    likes: [
      { _id: uuidv4(), username: "Name 6" },
      { _id: uuidv4(), username: "Name 7" },
      { _id: uuidv4(), username: "Name 8" },
      { _id: uuidv4(), username: "Name 9" },
    ],
    replies: [
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 6"}, content: "message 6", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 7"}, content: "message 7", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 8"}, content: "message 8", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 9"}, content: "message 9", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
    ]
  },
  { 
    _id: uuidv4(),
    user: {_id: uuidv4(),username:'Name 3'},
    content: 'This is a content for name 3 with some id',
    image:'image: could be blank',
    createdAt: fixedDate,
    likes: [
      { _id: uuidv4(), username: "Name 10" },
      { _id: uuidv4(), username: "Name 11" },
      { _id: uuidv4(), username: "Name 12" },
      { _id: uuidv4(), username: "Name 13" },
    ],
    replies: [
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 10"}, content: "message 10", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 11"}, content: "message 11", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 12"}, content: "message 12", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 13"}, content: "message 13", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
    ]
  },
  { 
    _id: uuidv4(),
    user: {_id: uuidv4(),username:'Name 4'},
    content: 'This is a content for name 4 with some id',
    image:'image: could be blank',
    createdAt: fixedDate,
    likes: [
      { _id: uuidv4(), username: "Name 14" },
      { _id: uuidv4(), username: "Name 15" },
      { _id: uuidv4(), username: "Name 16" },
      { _id: uuidv4(), username: "Name 17" },
    ],
    replies: [
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 14"}, content: "message 14", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 15"}, content: "message 15", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 16"}, content: "message 16", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
      { _id: uuidv4(), sender: {_id: uuidv4(),username:"Name 17"}, content: "message 17", time: new Date(fixedDate.getTime() + Math.floor(Math.random() * 1000)) },
    ]
  },
];

const getData = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/v1/Post`, { //by using id we can get more reqs if needed by creating another directory in the api/v1/chat 
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

export default function Post() {
  const { user } = useAuth();   //user credentials
  const [posts, setPosts] = useState(exampleWall); //sample posts will be replaced later
  const [visibleComments, setVisibleComments] = useState({}); //tracks which posts have their comments visible
  const [commentsToShow, setCommentsToShow] = useState({}); //tracks how many comments to show for each post 
  const [newPostContent, setNewPostContent] = useState(""); //content of a new wall post
  const [newComments, setNewComments] = useState({}); //holds new comments for each post, identified by post ID 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getData();
        console.log(userData)
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, []);

  const toggleComments = (postId) => {
    setVisibleComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  }; //toggles the visibility of comments for a specific post (postId)

  const loadMoreComments = (postId) => {
    setCommentsToShow((prevState) => ({
      ...prevState,
      [postId]: (prevState[postId] || 3) + 3,
    }));
  }; //increments the number of comments shown for a specific post

  const handleWallSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!user) return;  //user must be logged in to submit a post
    const newPost = {
      _id: uuidv4(),
      user: {_id:user?.id,username:user?.username},
      content: newPostContent,
      image:'image: could be blank',
      createdAt: new Date(),
      likes: [],
      replies: [],
    };
    setPosts([newPost, ...posts]);
    setNewPostContent("");
  }; //creates a new post and adds it to the posts state, ws later

  const handleCommentSubmit = (postId: string, event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!user) return;//user must be logged in to submit a comment
    const newComment = {  //new comment object to be added to the specified post 
      _id: uuidv4(),
      sender: {_id: user.id,username:user.username},
      content: newComments[postId] || '', //the text in the comment input field for the specific postId 
      time: new Date(),
    };  
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? { ...post, replies: [...post.replies, newComment] }
          : post
      )
    ); //adds the new comment to the correct post by matching postId 
    setNewComments((prevComments) => ({ ...prevComments, [postId]: '' })); //clears the comment input field for the specified postId
    setCommentsToShow((prevState) => ({
      ...prevState,
      [postId]: (posts.find((post) => post._id === postId)?.replies.length || 0) + 1,
    })); //updates the number of comments shown to include the new comment 
    setVisibleComments((prevState) => ({
      ...prevState,
      [postId]: false,
    })); //makes sure the comments section is visible after adding a new comment 
  };

  const handleNewPostChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNewPostContent(event.target.value);
  }; //on change value of wall post form

  const handleNewCommentChange = (postId: string, event: ChangeEvent<HTMLInputElement>) => {
    setNewComments({ ...newComments, [postId]: event.target.value });
    console.log(newComments);
  }; //on change value of wall post form with id matching post 

  const addOrRemoveLike = (postId: string, action: string) => {
    if (!user) return; //no login no like
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) { //find post by its id
          if (action === 'add') { //if clicked like button 
            const newLikes = [...post.likes, { _id: user.id, username: user.username }]; //add users like to current likes 
            return { ...post, likes: newLikes }; //update the likes 
          } else { //if clicked unlike
            const newLikes = post.likes.filter((like) => like._id !== user.id); //remove users like 
            return { ...post, likes: newLikes }; //update the likes  
          }
        }
        return post;
      })
    );
  }; //handles liking and unliking a post

  function deleteComment(_id: string): React.MouseEventHandler<HTMLDivElement> {
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => {
          if (post.replies.some((reply) => reply._id === _id)) {
            const updatedReplies = post.replies.filter((reply) => reply._id !== _id);
            return { ...post, replies: updatedReplies };
          }
          return post;
        });
        return updatedPosts;
      });
  }
  

  function deletePost(_id:string): void {
    console.log(_id);
    setPosts((prev) => {
      const updatedPosts = prev.filter(posts => posts._id !== _id);
      return updatedPosts;
    })
  }

  return (
    <div className="wallPage">
      <div>
      <form onSubmit={handleWallSubmit} className="wallPostForm">
        <label htmlFor="newPost"> What's on your mind?</label>
        <textarea
          id="newPost"
          placeholder="What's on your mind?"
          value={newPostContent}
          onChange={handleNewPostChange}
        />
        <button type="submit">Post</button>
      </form>
      </div>
      <div>
        {posts.map((post) => (
          <div key={post._id} className="wallPosts">
            {user?.id === post.user._id ? <div onClick={()=> deletePost(post._id)} className="xButtonn">&times;</div> : <div></div>}
            <div className="wallPostInfo">
              <p>{post.user.username}</p>
              <p>{post.content}</p>
              <p>{post.image}</p>
              <p>{new Date(post.createdAt).toLocaleString()}</p>
              <p>
                {post.likes.length > 2
                  ? `${post.likes[post.likes.length - 1].username}, ${post.likes[post.likes.length - 2].username} and ${post.likes.length - 2} others liked this post`
                  : post.likes.length === 0
                    ? 'Be the first to like this post!'
                    : post.likes.length === 2 ?
                    `${post.likes.map((like) => like.username).join(" and ")} liked this post` :
                    `${post.likes[0].username} liked this post`}
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
                    <p>{reply.sender.username}</p>
                    <p>{reply.content}</p>
                    <p>{new Date(reply.time).toLocaleString()}</p>
                  </div>
                  {user?.id === post.user._id || reply.sender._id === user?.id ? <div className='xButton' onClick={()=>deleteComment(reply._id)}>&times;</div> : <div></div>}
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
                    value={newComments[post._id] || ''}
                    onChange={(e) => handleNewCommentChange(post._id, e)}
                  />
                  <button type="submit">Post</button>
                </form>
          </div>
        ))}
      </div>
    </div>
  );
}



