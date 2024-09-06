"use client";
import Link from "next/link";
import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "../(stores)/authContext";
import "../(styles)/post.css";
import Image from "next/image";
import io, { Socket } from "socket.io-client";
import Modal from "../(components)/Modal";
import DalleModal from "../(components)/dalleModal";

interface Comment {
  _id: string;
  sender: { _id: string; username: string; profilePic: string };
  message: string;
  image?: string;
  time: Date;
}

interface Wall {
  _id: string;
  user: { _id: string; username: string; profilePic: string };
  content: string;
  likes: { _id: string; username: string; profilePic: string }[]; //check if pfp is returned and if yes change check modal and see what it does
  replies: Comment[];
  image?: string;
  createdAt: Date;
}
interface Post {
  post: string | number | readonly string[] | undefined;
  image: string | undefined | null;
}

interface Like {
  _id: string;
  username: string;
  profilePic: string;
  status?: string;
}

const getData = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/v1/Post`, {
    //by using id we can get more reqs if needed by creating another directory in the api/v1/chat
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
  const { user } = useAuth(); //user credentials
  const [posts, setPosts] = useState<Wall[]>([]); //sample posts will be replaced later
  const [visibleComments, setVisibleComments] = useState<
    Record<string, boolean>
  >({}); //tracks which posts have their comments visible
  const [commentsToShow, setCommentsToShow] = useState<Record<string, number>>(
    {}
  ); //tracks how many comments to show for each post

  const [newPostContent, setNewPostContent] = useState<Post>({
    post: "",
    image: undefined,
  }); //content of a new wall post

  const [newComments, setNewComments] = useState<
    Record<string, { comment: string; image: string | null }>
  >({}); //holds new comments for each post, identified by post ID
  const [socket, setSocket] = useState<Socket | undefined>();
  const [openModal, setOpenModal] = useState(false);
  const [modalLikes, setModalLikes] = useState<Like[] | undefined>();
  const [postImgURL, setPostImgURL] = useState<string | null | undefined>();
  const [commentImgURL, setCommentImgURL] = useState<
    string | null | undefined
  >();
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | null |undefined>(null);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getData();
        console.log(userData.allWallDetails);
        setPosts(userData.allWallDetails);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    //fetchData();
    const socket = io("http://localhost:3001");
    setSocket(socket);
    if (user?.id) {
      fetchData();
      socket.emit("joinWall", { userId: user.id });
    }

    socket.on("create-wallPost", (wallPost: Wall) => {
      console.log(wallPost);
      setPosts((prevPosts) => [wallPost, ...prevPosts]);
    });

    socket.on("delete-comment", (commentId) => {
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts?.map((post) => {
          if (post.replies.some((reply) => reply._id === commentId)) {
            const updatedReplies = post.replies.filter(
              (reply) => reply._id !== commentId
            );
            return { ...post, replies: updatedReplies };
          }
          return post;
        });
        return updatedPosts;
      });
    });

    socket.on("delete-wallPost", (wallId) => {
      setPosts((prev) => {
        const updatedPosts = prev?.filter((posts) => posts._id !== wallId);
        return updatedPosts;
      });
    });

    socket.on("toggle-like", (action, wallId, userId, username, profilePic) => {
      setPosts((prevPosts) =>
        prevPosts?.map((post) => {
          if (post._id === wallId) {
            //find post by its id
            if (action === "add") {
              //if clicked like button
              const newLikes = [
                ...post.likes,
                { _id: userId, username: username, profilePic: profilePic },
              ]; //add users like to current likes
              return { ...post, likes: newLikes }; //update the likes
            } else {
              //if clicked unlike
              const newLikes = post.likes.filter((like) => like._id !== userId); //remove users like
              return { ...post, likes: newLikes }; //update the likes
            }
          }
          return post;
        })
      );
    });

    socket.on("create-comment", (wallId, newComment, userId) => {
      setNewComments((prevComments) => ({
        ...prevComments,
        [wallId]: { comment: "", image: null },
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
  }, [user?.id]);

  const toggleComments = (postId: string) => {
    setVisibleComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  }; //toggles the visibility of comments for a specific post (postId)

  const loadMoreComments = (postId: string) => {
    setCommentsToShow((prevState) => ({
      ...prevState,
      [postId]: (prevState[postId] || 3) + 3,
    }));
  }; //increments the number of comments shown for a specific post

  // const handleNewPostChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
  function handleNewPostChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void {
    const { value, name, files } = event.target as HTMLInputElement;
    if (name === "image" && files) {
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
  } //on change value of wall post form

  const handleWallSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) return; //user must be logged in to submit a post

    if (newPostContent.post === "" && newPostContent.image === null) {
      return;
    }

    let hasImage = newPostContent.image !== null;

    const res = await fetch(`/api/v1/s3Img`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        post: newPostContent.post,
        image: newPostContent.image,
        hasImage,
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const { url, wallId } = await res.json();

    let imageURL = url;

    console.log(imageURL);
    socket?.emit("create-wallPost", {
      imageURL,
      wallId,
      token: `Bearer ${user?.token}`,
    });
    setNewPostContent({
      post: "",
      image: null,
    });
    if (postImgURL) {
      URL.revokeObjectURL(postImgURL);
    }
    setPostImgURL("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }; //creates a new post and adds it to the posts state, ws later

  const handleNewCommentChange = (
    postId: string,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    console.log(newComments);
    const { name, value, files } = event.target;
    if (name === "image" && files) {
      if (commentImgURL) {
        URL.revokeObjectURL(commentImgURL);
      }
      const url = URL.createObjectURL(files[0]);
      setCommentImgURL(url);
      const base64Conversion = new FileReader();
      base64Conversion.onloadend = () => {
        setNewComments((prevComments) => ({
          ...prevComments,
          [postId]: {
            ...prevComments[postId],
            image: base64Conversion.result as string,
          },
        }));
      };
      base64Conversion.readAsDataURL(files[0]);
    } else {
      setNewComments((prevComments) => ({
        ...prevComments,
        [postId]: {
          ...prevComments[postId],
          [name]: value,
        },
      }));
    }
  };

  const handleCommentSubmit = async (
    postId: string,
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!user) return; //user must be logged in to submit a comment

    if (!newComments[postId].comment && !newComments[postId].image) {
      return;
    }
    let hasImage = true;
    if (
      newComments[postId].image === undefined ||
      newComments[postId].image === null
    ) {
      hasImage = false;
    }

    console.log(newComments[postId].image);
    let newComment = newComments[postId].comment; //get the submitted comment and/or image
    console.log(hasImage);
    const res = await fetch(`/api/v1/Post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        comment: newComment,
        image: newComments[postId].image,
        hasImage,
        wallId: postId,
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const { url, comment, commentId } = await res.json();
    let imageURL = url;

    console.log(imageURL);
    socket?.emit("create-comment", {
      imageURL,
      comment,
      wallId: postId,
      token: `Bearer ${user?.token}`,
    });
  };

  const addOrRemoveLike = (postId: string, action: string) => {
    if (!user) return; //no login no likeZ
    socket?.emit("toggle-like", {
      action,
      wallId: postId,
      token: `Bearer ${user?.token}`,
    });
  }; //handles liking and unliking a post

  function deleteComment(_id: string, wallId: string) {
    socket?.emit("delete-comment", {
      wallId,
      commentId: _id,
      token: `Bearer ${user?.token}`,
    });
  }

  function deletePost(_id: string): void {
    socket?.emit("delete-wallPost", {
      wallId: _id,
      token: `Bearer ${user?.token}`,
    });
  }

  function openModalList(
    likes: { _id: string; username: string; profilePic: string }[]
  ) {
    setModalLikes(likes);
    setOpenModal(true);
  }

  // return (
  //   <div className="mainPost">
  //     <div className="wallPage">
  //       <div className="wallPostFormContainer">
  //         <form onSubmit={handleWallSubmit} className="wallPostForm">
  //           <label htmlFor="newPost"> What&apos;s on your mind? </label>
  //           <textarea
  //             id="newPost"
  //             placeholder="Let the world know!"
  //             value={newPostContent.post}
  //             onChange={handleNewPostChange}
  //           />
  //           <div className="imgPost">
  //             <label className="image-upload-labell">
  //             <input
  //               type="file"
  //               id="image"
  //               name="image"
  //               className="image-upload-input"
  //               accept="image/jpeg"
  //               ref={fileInputRef}
  //               onChange={handleNewPostChange}
  //             />
  //             <span className="image-upload-icon">Upload File</span>
  //             </label>
  //               <span>or</span>
  //               <p className="imgPostP" onClick={() => setShowModal2(!showModal2)}>
  //                   Add AI Image
  //               </p>
  //           </div>
  //             {newPostContent.image && (
  //               <Image
  //                 className="postPreview"
  //                 src={postImgURL || ""}
  //                 alt="Preview"
  //                 height={100}
  //                 width={100}
  //               />
  //             )}
  //             <button type="submit">Post</button>
  //         </form>
  //         {/* <button onClick={() => setShowModal2(!showModal2)}>
  //           {showModal2 ? "Cancel" : "Add an ai Image to your post"}
  //         </button> */}
  //         {showModal2 && (
  //           <DalleModal
  //             imgURL={postImgURL}
  //             setFormData={setNewPostContent}
  //             setImgURL={setPostImgURL}
  //             fileInputRef={fileInputRef}
  //             setEditDetails={null}
  //             showModal={showModal2}
  //             setShowModal={setShowModal2}
  //             setNewComments={null}
  //             postId={null}
  //             fromChat={false}
  //           />
  //         )}
  //       </div>
  //       <div className="postsContainer">
  //         {posts?.map((post) => (
  //           <div key={post._id} className={`wallPost ${post._id}`}>
  //             {user?.id === post.user._id ? (
  //               <div onClick={() => deletePost(post._id)} className="xButtonn">
  //                 &times;
  //               </div>
  //             ) : (
  //               <div></div>
  //             )}
  //             <Link href={`/profile/${post.user._id}`}>
  //               <div className="picAndName">
  //                 <Image
  //                   className="profilePic"
  //                   height={40}
  //                   width={40}
  //                   src={post.user.profilePic}
  //                   alt={"Profile Pic"}
  //                 />
  //                 <p>{post.user.username}</p>
  //               </div>
  //             </Link>
  //             <p>{post.content}</p>
  //             <div className="wallPostInfo">
  //               {post.image && (
  //                 <div className="imgHolder">
  //                   <Image
  //                     className="img"
  //                     height={300}
  //                     width={300}
  //                     src={post.image}
  //                     alt="post img"
  //                   />
  //                 </div>
  //               )}
  //               <p>{new Date(post.createdAt).toLocaleString()}</p>
  //               <p>
  //                 {post.likes.length > 2 ? (
  //                   <>
  //                     <Link
  //                       href={`/profile/${
  //                         post.likes[post.likes.length - 1]._id
  //                       }`}
  //                     >
  //                       {post.likes[post.likes.length - 1].username}
  //                     </Link>
  //                     ,{" "}
  //                     <Link
  //                       href={`/profile/${
  //                         post.likes[post.likes.length - 2]._id
  //                       }`}
  //                     >
  //                       {post.likes[post.likes.length - 2].username}
  //                     </Link>{" "}
  //                     and{" "}
  //                     <span
  //                       className="openModal"
  //                       onClick={() => openModalList(post.likes)}
  //                     >
  //                       {post.likes.length - 2} others liked this post
  //                     </span>
  //                   </>
  //                 ) : post.likes.length === 0 ? (
  //                   "Be the first to like this post!"
  //                 ) : post.likes.length === 2 ? (
  //                   <>
  //                     {post.likes.map((like, index) => (
  //                       <React.Fragment key={like._id}>
  //                         {index > 0 && " and "}
  //                         <Link href={`/profile/${like._id}`}>
  //                           {like.username}
  //                         </Link>
  //                       </React.Fragment>
  //                     ))}{" "}
  //                     liked this post
  //                   </>
  //                 ) : (
  //                   <>
  //                     <Link href={`/profile/${post.likes[0]._id}`}>
  //                       {post.likes[0].username}
  //                     </Link>{" "}
  //                     liked this post
  //                   </>
  //                 )}
  //               </p>
  //               <button
  //                 onClick={() =>
  //                   addOrRemoveLike(
  //                     post._id,
  //                     post.likes.some((like) => like._id === user?.id)
  //                       ? "remove"
  //                       : "add"
  //                   )
  //                 }
  //               >
  //                 {post.likes.some((like) => like._id === user?.id)
  //                   ? "Unlike"
  //                   : "Like"}
  //               </button>
  //               <br />
                
  //               {post.replies.length > 0 && (
  //                 <button onClick={() => toggleComments(post._id)}>
  //                   {visibleComments[post._id]
  //                     ? "Show Comments"
  //                     : "Hide Comments"}
  //                 </button>
  //               )}
  //             </div>
  //             {!visibleComments[post._id] && (
  //               <div>
  //                 {post.replies
  //                   .slice(0, commentsToShow[post._id] || 3)
  //                   .map((reply) => (
  //                     <div key={reply._id} className="comments">
  //                       <div>
  //                         {user?.id === post.user._id ||
  //                         reply.sender._id === user?.id ? (
  //                           <div
  //                             className="xButton"
  //                             onClick={() => deleteComment(reply._id, post._id)}
  //                           >
  //                             &times;
  //                           </div>
  //                         ) : null}
  //                         <Link href={`/profile/${reply.sender._id}`}>
  //                           <div className="picAndName">
  //                             <Image
  //                               className="profilePic"
  //                               src={reply.sender.profilePic}
  //                               height={40}
  //                               width={40}
  //                               alt="Profile Pic"
  //                             />
  //                             <p>{reply.sender.username}</p>
  //                           </div>
  //                         </Link>
  //                         {reply.image && (
  //                           <Image
  //                             className="replyimg"
  //                             src={reply.image || ""}
  //                             height={150}
  //                             width={150}
  //                             alt={"Image reply preview"}
  //                           />
  //                         )}

  //                         <p>{reply.message}</p>
  //                         <p>{new Date(reply.time).toLocaleString()}</p>
  //                       </div>
  //                     </div>
  //                   ))}
  //                 {post.replies.length > (commentsToShow[post._id] || 3) && (
  //                   <button  className="generate-image-btn" onClick={() => loadMoreComments(post._id)}>
  //                     Load More Comments
  //                   </button>
  //                 )}
  //               </div>
  //             )}
  //             <form onSubmit={(e) => handleCommentSubmit(post._id, e)}>
  //               <label htmlFor={`comment-${post._id}`}>
  //                 Comment on this post
  //               </label>
  //               <input
  //                 id={`comment-${post._id}`}
  //                 type="text"
  //                 placeholder="Comment on this post"
  //                 name="comment"
  //                 value={newComments[post._id]?.comment || ""}
  //                 onChange={(e) => handleNewCommentChange(post._id, e)}
  //               />
  //             <div className="imgPost">
  //             <label className="image-upload-labell">
  //             <input
  //               type="file"
  //               id="image"
  //               name="image"
  //               className="image-upload-input"
  //               accept="image/jpeg"
  //               onChange={(e) => handleNewCommentChange(post._id, e)}
  //             />
  //             <span className="image-upload-icon">Upload File</span>
  //             </label>
  //               <span>or</span>
  //               <p className="imgPostP" onClick={() => {setShowModal3(!showModal3);setCurrentPostId(post._id)}}>
  //                   Add AI Image
  //               </p>
  //           </div>
  //                {newComments[post._id]?.image && (
  //                 <Image
  //                   className="postPreview"
  //                   src={commentImgURL || ""}
  //                   height={100}
  //                   width={100}
  //                   alt="Preview"
  //                 />
  //               )}
  //               <button className="postCommentBtn" type="submit">Post</button>
  //             </form>
  //             {showModal3 && (
  //               <DalleModal
  //                 imgURL={null}
  //                 postId={currentPostId}
  //                 setFormData={null}
  //                 setNewComments={setNewComments}
  //                 setImgURL={setCommentImgURL}
  //                 fileInputRef={undefined}
  //                 setEditDetails={null}
  //                 showModal={showModal3}
  //                 setShowModal={setShowModal3}
  //                 fromChat={false}
  //               />
  //             )}
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //     {openModal && <Modal likes={modalLikes} setOpenModal={setOpenModal} />}
  //   </div>
  // );
  return (
    <div className="mainPost">
      <div className="wallPage">
        <div className="wallPostFormContainer">
          <form onSubmit={handleWallSubmit} className="wallPostForm">
            <label htmlFor="newPost" className="formLabel"> What&apos;s on your mind? </label>
            <textarea
              id="newPost"
              className="formTextarea"
              placeholder="Let the world know!"
              value={newPostContent.post}
              onChange={handleNewPostChange}
            />
            <div className="imgPost">
              <label className="image-upload-labell">
                <input
                  type="file"
                  id="image"
                  name="image"
                  className="image-upload-input"
                  accept="image/jpeg"
                  ref={fileInputRef}
                  onChange={handleNewPostChange}
                />
                <span className="image-upload-iconn">Upload File</span>
              </label>
              <span>or</span>
              <p className="imgPostP" onClick={() => setShowModal2(!showModal2)}>
                Add AI Image
              </p>
            </div>
            {newPostContent.image && (
              <Image
                className="commentPreview"
                src={postImgURL || ""}
                alt="Preview"
                height={100}
                width={100}
              />
            )}
            <button type="submit" className="submitButton">Post</button>
          </form>
          {showModal2 && (
            <DalleModal
              imgURL={postImgURL}
              setFormData={setNewPostContent}
              setImgURL={setPostImgURL}
              fileInputRef={fileInputRef}
              setEditDetails={null}
              showModal={showModal2}
              setShowModal={setShowModal2}
              setNewComments={null}
              postId={null}
              fromChat={false}
            />
          )}
        </div>
        <div className="postsContainer">
          {posts?.map((post) => (
            <div key={post._id} className={`wallPost ${post._id}`}>
              {user?.id === post.user._id ? (
                <div onClick={() => deletePost(post._id)} className="xButtonn">
                  &times;
                </div>
              ) : (
                <div></div>
              )}
                <div className="picAndName">
                  <Link href={`/profile/${post.user._id}`}>
                    <Image
                      className="profilePic"
                      height={40}
                      width={40}
                      src={post.user.profilePic || ""}
                      alt={"Profile Pic"}
                    />
                    </Link>
                    <Link href={`/profile/${post.user._id}`}>
                      <p>{post.user.username}</p>
                    </Link>
                </div>
              <p>{post.content}</p>
              <div className="wallPostInfo">
                {post.image && (
                  <div className="imgHolder">
                    <Image
                      className="img"
                      height={300}
                      width={300}
                      src={post.image || ""}
                      alt="post img"
                    />
                  </div>
                )}
                <p className="inboxEnd">{new Date(post.createdAt).toLocaleString()}</p>
                <p>
                  {post.likes.length > 2 ? (
                    <>
                      <Link
                        href={`/profile/${
                          post.likes[post.likes.length - 1]._id
                        }`}
                      >
                        {post.likes[post.likes.length - 1].username}
                      </Link>
                      ,{" "}
                      <Link
                        href={`/profile/${
                          post.likes[post.likes.length - 2]._id
                        }`}
                      >
                        {post.likes[post.likes.length - 2].username}
                      </Link>{" "}
                      and{" "}
                      <span
                        className="openModal"
                        onClick={() => openModalList(post.likes)}
                      >
                        {post.likes.length - 2} others liked this post
                      </span>
                    </>
                  ) : post.likes.length === 0 ? (
                    "Be the first to like this post!"
                  ) : post.likes.length === 2 ? (
                    <>
                      {post.likes.map((like, index) => (
                        <React.Fragment key={like._id}>
                          {index > 0 && " and "}
                          <Link href={`/profile/${like._id}`}>
                            {like.username}
                          </Link>
                        </React.Fragment>
                      ))}{" "}
                      liked this post
                    </>
                  ) : (
                    <>
                      <Link href={`/profile/${post.likes[0]._id}`}>
                        {post.likes[0].username}
                      </Link>{" "}
                      liked this post
                    </>
                  )}
                </p>
                <button
                  className="likeButton"
                  onClick={() =>
                    addOrRemoveLike(
                      post._id,
                      post.likes.some((like) => like._id === user?.id)
                        ? "remove"
                        : "add"
                    )
                  }
                >
                  {post.likes.some((like) => like._id === user?.id)
                    ? "Unlike"
                    : "Like"}
                </button>
                <br />
                <br />
                {post.replies.length > 0 && (
                  <button
                    className="toggleCommentsButton"
                    onClick={() => toggleComments(post._id)}
                  >
                    {visibleComments[post._id]
                      ? "Show Comments"
                      : "Hide Comments"}
                  </button>
                )}
              </div>
              {!visibleComments[post._id] && (
                <div>
                  {post.replies
                    .slice(0, commentsToShow[post._id] || 3)
                    .map((reply) => (
                      <div key={reply._id} className="comments">
                        <div>
                          {user?.id === post.user._id ||
                          reply.sender._id === user?.id ? (
                            <div
                              className="xButton"
                              onClick={() => deleteComment(reply._id, post._id)}
                            >
                              &times;
                            </div>
                          ) : null}
                          <Link href={`/profile/${reply.sender._id}`}>
                            <div className="picAndName">
                              <Image
                                className="profilePic"
                                src={reply.sender.profilePic}
                                height={40}
                                width={40}
                                alt="Profile Pic"
                              />
                              <p>{reply.sender.username}</p>
                            </div>
                          </Link>
                          {reply.image && (
                            <Image
                              className="replyimg"
                              src={reply.image || ""}
                              height={150}
                              width={150}
                              alt={"Image reply preview"}
                            />
                          )}
                          <p>{reply.message}</p>
                          <p>{new Date(reply.time).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  {post.replies.length > (commentsToShow[post._id] || 3) && (
                    <button
                      className="loadMoreCommentsButton"
                      onClick={() => loadMoreComments(post._id)}
                    >
                      Load More Comments
                    </button>
                  )}
                </div>
              )}
              <form className="commentForm" onSubmit={(e) => handleCommentSubmit(post._id, e)}>
                <label htmlFor={`comment-${post._id}`} className="commentLabel">
                  Comment on this post
                </label>
                <input
                  id={`comment-${post._id}`}
                  type="text"
                  className="commentInput"
                  placeholder="Comment on this post"
                  name="comment"
                  value={newComments[post._id]?.comment || ""}
                  onChange={(e) => handleNewCommentChange(post._id, e)}
                />
                <div className="imgPost">
                  <label className="image-upload-labell">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      className="image-upload-input"
                      accept="image/jpeg"
                      onChange={(e) => handleNewCommentChange(post._id, e)}
                    />
                    <span className="image-upload-iconn">Upload File</span>
                  </label>
                  <span>or</span>
                  <p
                    className="imgPostP"
                    onClick={() => {
                      setShowModal3(!showModal3);
                      setCurrentPostId(post._id);
                    }}
                  >
                    Add AI Image
                  </p>
                </div>
                {newComments[post._id]?.image && (
                  <Image
                    className="commentPreview"
                    src={commentImgURL || ""}
                    height={100}
                    width={100}
                    alt="Preview"
                  />
                )}
                <button className="postCommentBtn submitButton" type="submit">
                  Post
                </button>
              </form>
              {showModal3 && (
                <DalleModal
                  imgURL={null}
                  postId={currentPostId}
                  setFormData={null}
                  setNewComments={setNewComments}
                  setImgURL={setCommentImgURL}
                  fileInputRef={undefined}
                  setEditDetails={null}
                  showModal={showModal3}
                  setShowModal={setShowModal3}
                  fromChat={false}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {openModal && <Modal likes={modalLikes} setOpenModal={setOpenModal} />}
    </div>
  );
  
}

//TODO
/*

change this specifically element selectors 
.wallPost form {
  margin-top: 10px;
}

.wallPost form label {
  font-weight: bold;
}

.wallPost form input[type="text"] {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.wallPost form input[type="file"] {
  margin-top: 10px;
}

.wallPost form button {
  margin-top: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.wallPost form button:hover {
  background-color: #0056b3;
}*/
