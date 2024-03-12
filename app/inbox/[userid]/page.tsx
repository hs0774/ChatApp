interface inboxParams{
    params: {
        userid:string;
    }
}

const messages = [
    { id: 1, text: 'Message 1' },
    { id: 2, text: 'Message 2' },
    { id: 3, text: 'Message 3' },
    { id: 4, text: 'Message 4' },
    { id: 5, text: 'Message 5' }
];

export default function Inbox({params}:inboxParams) {
    return (
        <div>
            <h2>Message List</h2>
            <ul>
                {messages.map(message => (
                    <li key={message.id}>
                    <input type="checkbox" id={`message-${message.id}`} name={`message-${message.id}`} />
                    <label htmlFor={`message-${message.id}`}>{message.text}</label>
                </li>
                ))}
            </ul>
        </div>
    );
}

//do sign up, login, profile page, home page/, inbox page, chat page 