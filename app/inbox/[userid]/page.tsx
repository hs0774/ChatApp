import { useAuth } from "@/app/(stores)/authContext";

export default function InboxMessage({ message }) {
  const { user } = useAuth();
  console.log(user?.id);

  async function handleFriendReq(
    action: string,
    sender: string,
    receiver: string
  ) {
    if (action === "accept") {
      console.log("hi");
      const response = await fetch(`/api/v1/Inbox/${user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ sender, receiver, action }),
      });
    } else if (action === "deny") {
      console.log("bye");
      const response = await fetch(`/api/v1/Inbox/${user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ sender, receiver,action }),
      });
    }
  }

  return (
    <div>
      <h2>Message List</h2>
      <ul>
        <li key={message.id}>
          <p>From: {message.sender.username}</p>
          <p>To: {message.receiver.username} (you) </p>
          <p>{new Date(message.createdAt).toLocaleString()}</p>
          <p>{message.message}</p>
          {message.type === "friendRequest" && (
            <>
              <button
                onClick={() =>
                  handleFriendReq(
                    "accept",
                    message.sender.username,
                    message.receiver.username
                  )
                }
              >
                Accept
              </button>
              <button
                onClick={() =>
                  handleFriendReq(
                    "deny",
                    message.sender.username,
                    message.receiver.username
                  )
                }
              >
                Deny
              </button>
            </>
          )}
        </li>
      </ul>
    </div>
  );
}

//do sign up, login, profile page, home page, inbox page, chat page
