"use client";
import Link from "next/link";
import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "../(stores)/authContext";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import '../(styles)/post.css'
import io from 'socket.io-client';
import Modal from "../(components)/Modal";
import { log } from "console";

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
  const [posts, setPosts] = useState([]); //sample posts will be replaced later
  const [visibleComments, setVisibleComments] = useState({}); //tracks which posts have their comments visible
  const [commentsToShow, setCommentsToShow] = useState({}); //tracks how many comments to show for each post 
  const [newPostContent, setNewPostContent] = useState({
    post:"",
    image:null,
  }); //content of a new wall post
  const [newComments, setNewComments] = useState({}); //holds new comments for each post, identified by post ID 
  const [socket,setSocket] = useState();
  const [openModal,setOpenModal] = useState(false);
  const [modalLikes,setModalLikes] = useState();
  const [postImgURL,setPostImgURL] = useState<string | undefined>();
  const [commentImgURL,setCommentImgURL] = useState<string | undefined>();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getData();
        console.log(userData.allWallDetails)
        setPosts(userData.allWallDetails)
      } catch (error) {
        console.error("Error:", error);
      }
    };
    //fetchData(); 
    const socket = io('http://localhost:3001');
    setSocket(socket);
    if (user?.id) {
      fetchData();
      socket.emit('joinWall', { userId: user.id });
    }

    socket.on('create-wallPost', (wallPost) => {
      console.log(wallPost)
      setPosts((prevPosts) => [wallPost, ...prevPosts]);
    });

    socket.on('delete-comment', (commentId) => {
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => {
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
        const updatedPosts = prev.filter(posts => posts._id !== wallId);
        return updatedPosts;
      })
    })

    socket.on('toggle-like', (action,wallId,userId,username) => {
      setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === wallId) { //find post by its id
          if (action === 'add') { //if clicked like button 
            const newLikes = [...post.likes, { _id: userId, username: username }]; //add users like to current likes 
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
        const updatedPosts = prevPosts.map((post) => {
          if (post._id === wallId) {
            return { ...post, replies: [...post.replies, newComment] };
          }
          return post;
        });

        const updatedPost = updatedPosts.find((post) => post._id === wallId);
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

  }, [user?.id]);

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

  const handleWallSubmit = async (event: FormEvent<HTMLFormElement>): void => {
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
      body: JSON.stringify({ post: newPostContent.post,hasImage})
    });
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const {url,wallId} = await res.json();
    
    let imageURL = null;
    if(url) {
      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: newPostContent.image,
      });
      if (!uploadRes.ok) {
        throw new Error("Failed to upload image");
      }
      imageURL = url.split("?")[0];
   }
   
    console.log(imageURL);
    socket.emit('create-wallPost', ({imageURL,wallId,token: `Bearer ${user?.token}`}));
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

  const handleCommentSubmit = async (postId: string, event: FormEvent<HTMLFormElement>): void => {
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
      body: JSON.stringify({ comment: newComment,hasImage,wallId:postId})
    });
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    console.log(newComment.comment)
    console.log(newComment.image)
    const {url,comment,commentId} = await res.json();
    let imageURL = null;
    if(url) {
      const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: newComments[postId].image,
      });
      if (!uploadRes.ok) {
        throw new Error("Failed to upload image");
      }
      imageURL = url.split("?")[0];
   } 
   console.log(imageURL);
   socket.emit('create-comment', ({imageURL,comment,wallId:postId,token: `Bearer ${user?.token}`}));
  };

  // const handleNewPostChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    function handleNewPostChange(
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ): void {
    const { value, name ,files} = event.target;
    if (name === 'image' && files) {
      if (postImgURL) {
        URL.revokeObjectURL(postImgURL);
      }

      const url = URL.createObjectURL(files[0]);
      setPostImgURL(url);

      setNewPostContent((prev) => ({
        ...prev,
        image: files[0],
      }));
      } else {
        setNewPostContent((prev) => ({ ...prev, post: value }));
      }
  }; //on change value of wall post form

  const handleNewCommentChange = (postId: string, event: ChangeEvent<HTMLInputElement>) => {
    console.log(newComments);
    const {name,value,files} = event.target;
    if(name === 'image' && files) {
      if (commentImgURL) {
        URL.revokeObjectURL(commentImgURL);
      }
      const url = URL.createObjectURL(files[0]);
      setCommentImgURL(url);
      // const reader = new FileReader();
      // reader.readAsDataURL(files[0]);
      // reader.onload = () => {
      //   const str = reader.result?.toString();
      //     if (str) {
      //       const buffer = Buffer.from(str.split(',')[1], 'base64');
            setNewComments(prevComments => ({
              ...prevComments,
              [postId]: {
                ...prevComments[postId],
                image: files[0],
              }
            }));
        //   }
        // }
    } else {
      setNewComments(prevComments => ({
        ...prevComments,
        [postId]: {
          ...prevComments[postId],
          [name]: value,
        }
      }));
    }
  }; 


  const addOrRemoveLike = (postId: string, action: string) => {
    if (!user) return; //no login no like

    socket.emit('toggle-like', {action,wallId:postId,token: `Bearer ${user?.token}`});
    // setPosts((prevPosts) =>
    //   prevPosts.map((post) => {
    //     if (post._id === postId) { //find post by its id
    //       if (action === 'add') { //if clicked like button 
    //         const newLikes = [...post.likes, { _id: user.id, username: user.username }]; //add users like to current likes 
    //         return { ...post, likes: newLikes }; //update the likes 
    //       } else { //if clicked unlike
    //         const newLikes = post.likes.filter((like) => like._id !== user.id); //remove users like 
    //         return { ...post, likes: newLikes }; //update the likes  
    //       }
    //     }
    //     return post;
    //   })
    // );
  }; //handles liking and unliking a post

  function deleteComment(_id: string,wallId): React.MouseEventHandler<HTMLDivElement> {
    socket.emit('delete-comment', {wallId,commentId:_id,token: `Bearer ${user?.token}`});
  }
  
  function deletePost(_id:string): void {
    socket.emit('delete-wallPost', {wallId:_id,token: `Bearer ${user?.token}`});
  }

  function openModalList(likes): void {
    setModalLikes(likes.reverse());
    setOpenModal(true);
  }

  return (
    <>
      <div className="wallPage">
        <div>
        <form onSubmit={handleWallSubmit} className="wallPostForm">
          <label htmlFor="newPost"> What's on your mind? </label>
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
          {newPostContent.image && <img className="postPreview" src={postImgURL} alt="Preview" />}
          <button type="submit">Post</button>
        </form>
        </div>
        <div>
          {posts.map((post) => (
            <div key={post._id} className="wallPosts">
              {user?.id === post.user._id ? <div onClick={()=> deletePost(post._id)} className="xButtonn">&times;</div> : <div></div>}
                <Link href={`/profile/${post.user._id}`}>
                  <div className="picAndName">
                        <img className='profilePic' src={post.user.profilePic} />
                        <p>{post.user.username}</p>
                  </div>
                </Link>
                <p>{post.content}</p>
                <div className="wallPostInfo">
                {post.image &&
                <div className="imgHolder">
                  <img className='img' src={post.image} /> 
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
                          <img className='profilePic' src={reply.sender.profilePic} alt="" />
                          <p>{reply.sender.username}</p>
                        </div>
                      </Link>
                      {reply.image && <img className="replyimg" src={reply.image} /> }

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
                    <button type="submit">Post</button>
                     {newComments[post._id]?.image && <img className="postPreview" src={commentImgURL} alt="Preview" />} 
              </form>
            </div>
          ))}
        </div>
      </div>
      {openModal && (
        <Modal likes={modalLikes} setOpenModal={setOpenModal} />
      )}

    </>
  );
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
//        <input type="file" id="image" name="image" accept="image/jpeg" value={formData.image} onChange={handleChange}/>
//        {formData.image && <img className="preview" src={imgURL} alt="Profile Preview" />}