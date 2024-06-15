"use client";
import { FormEvent, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/(stores)/authContext";
import { country_list } from "@/app/utils/countries";
//import { handleAddFriend } from "@/app/utils/helperFunctions/handleAddFriend";
import "../../(styles)/profile.css";

interface ProfileParams {
  params: {
    username: string; // Assuming username is actually the user ID
  };
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
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editDetails, setEditDetails] = useState({
    username: "",
    age: "",
    bio: "",
    occupation: "",
    location: "",
    sex: "",
    // image:'' work on this after other things work
  });
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getData(username);
        setData(userData);
        console.log(userData);
        setEditDetails((prev) => ({
          ...prev,
          username: userData?.filteredUser.username,
          age: userData?.filteredUser.details.age,
          bio: userData?.filteredUser.details.bio,
          occupation: userData?.filteredUser.details.job,
          location: userData?.filteredUser.details.location,
          sex: userData?.filteredUser.details.sex,
        }));
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, [username]); //because of next naming conventions this is the id

   async function handleAddFriend(_id: string) {
    //automatic inbox request to the user, friendship schema created,
    //in the inbox it would confirm the adding and add both ids to respective
    //array
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
      ...prev,
      status: "pending",
    }));
  }

  function goToChat(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
    //go chat with them, and open up the chat page in the list of chats
    router.push(`/chat/`);
  }

  async function removeFriend(_id) {
    //so here we want to open a tiny modal with three options to go the the
    //persons page, chat with them or defriend them
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
    
    setData((data) => ({
      ...data,
      populatedFriends: data.populatedFriends.filter(friend => friend._id !== _id)
  }));
  
     //since we are removing a friend we should pass back the list of friends
  }

  function goToInbox(username:string){
    // your inbox opens with them on the header and a message form to send
    //them a message, similar to chat it should open in the list of messages,
    //you know sort of like an email system
    console.log(username);
    router.push(`/inbox/?username=${username}`);  
  }

  function detailsEdit(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
    setEditing(true);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const id = localStorage.getItem("id");
    try {
      const response = await fetch(`/api/v1/Profile/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ editDetails, id }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to save details");
      }
      setData((prevData) => ({
        ...prevData,
        filteredUser: {
          ...prevData.filteredUser,
          username: editDetails.username,
          details: {
            ...prevData.filteredUser.details,
            age: editDetails.age,
            bio: editDetails.bio,
            job: editDetails.occupation,
            location: editDetails.location,
            sex: editDetails.sex,
          },
        },
      }));
      setEditing(false);
    } catch (error) {
      console.error(error, "failed to reach server");
    }
  }

  return (
    <div>
      {!editing ? (
        <>
          <ul>
            {user?.id === data?.filteredUser._id && (
              <button onClick={detailsEdit}>Edit</button>
            )}
            <li>{data?.filteredUser.username}</li>
            <li>Age: {data?.filteredUser.details.age}</li>
            <li>Bio: {data?.filteredUser.details.bio}</li>
            <li>Occupation: {data?.filteredUser.details.job}</li>
            <li>Location: {data?.filteredUser.details.location}</li>
            <li>Sex: {data?.filteredUser.details.sex}</li>
          </ul>
          <img className='profileImg'src={data?.filteredUser.profilePic} />
          {/* {console.log(data)} */}
        </>
      ) : (
        <>
          {/* {user?.id === data?.filteredUser._id && <button onClick={()=>setEditing(false)}>Cancel</button>} */}
          <form onSubmit={handleSubmit}>
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
              <label htmlFor="job">Occupation:</label>
              <input
                type="text"
                id="job"
                name="job"
                value={editDetails.occupation}
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

          <img src={data?.imageDataURL} />
        </>
      )}
      {/* {console.log(data)} */}

      <div>
        {user?.id !== data?.filteredUser._id &&
          data?.filteredUser.nonFriendsChat && (
            <button onClick={goToChat}>Chat</button>
          )}

        {user?.id !== data?.filteredUser._id &&
          (data?.filteredUser.friends.includes(user?.id) ? (
            <>
              <button onClick={goToChat}>Chat</button>
              <p>
                Friends{" "}
                <button onClick={() => removeFriend(data?.filteredUser._id)}>
                  Remove Friend
                </button>
              </p>
              <button onClick={()=>goToInbox(data?.filteredUser.username)}>Send inbox</button>
            </>
          ) : (
            <>
              {data?.status === "pending" ? (
                <button>Requested</button>
              ) : (
                <button onClick={() => handleAddFriend(data?.filteredUser._id)}>
                  Add Friend
                </button>
              )}
              <button onClick={()=>goToInbox(data?.filteredUser.username)}>Send inbox</button>
            </>
          ))}
        <h2>Friends list </h2>
        <ul>
          {data?.populatedFriends.map((friend) => (
            <li key={friend.username} className="namePlusDropdown">
              {/* <Link ><img className='friendsProfilePic'src={data?.filteredUser.profilePic} />
              {friend.username}</Link> */}
              <Link href={friend.url}>
                <div className="picAndName">
                  <img className='friendsProfilePic' src= {friend.profilePic} />
                  <p>{friend.username}</p>
                </div>
              </Link>
              {user?.id === data?.filteredUser._id && (
                <div className="dropdown">
                  {/* <button className="dropdown-toggle" onClick={friendSetting}>
                                        *
                                    </button> */}
                  <div
                    id={`dropdown-${friend.username}`}
                    className="dropdown-menu"
                  >
                    <button onClick={goToChat}>Chat</button>
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
      </div>
    </div>
  );
}

//so what i should do is pass the token get the payload id
// do the usual stuff i am getting but also check if there exists a friendship schema
// pass something back for example like accepted, pending, null. if accepted change the button,
//to friends, if pending it should say requested and maybe the change to unsend
//and null shows the add as a friend button
