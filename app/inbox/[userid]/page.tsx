
export default function InboxMessage({ message }) {

    async function handleFriendReq(action: string,sender:string,receiver:string){
        if (action === 'accept') {
            console.log('hi')
            const response = await fetch('/api/v1/Friendship', {
                method:'PATCH',
                headers: { 
                    "Content-Type": "application/json",
                },
                body:JSON.stringify({sender,receiver}),
            })
        } else if (action === 'deny') {
            console.log('bye')
            const response = await fetch('/api/v1/Friendship', {
                method:'DELETE',
                headers: {
                    "Content-Type": "application/json",
                },
                body:JSON.stringify({sender,receiver}),
            })
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
                        {message.type === 'friendRequest' && (<><button onClick={() => 
                        handleFriendReq('accept', message.sender.username, 
                        message.receiver.username)}>Accept</button> 
                        <button onClick={() => handleFriendReq('deny',message.sender.username,
                        message.receiver.username)}>Deny</button></>)}
                    </li>
            </ul>
        </div>
    );
}

//do sign up, login, profile page, home page, inbox page, chat page 