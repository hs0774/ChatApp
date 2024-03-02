interface inboxParams{
    params: {
        userid:string;
    }
}

export default function Inbox({params}:inboxParams) {
    return (
        <div>
            <h1>Welcome to Inbox {params.userid}</h1>
        </div>
    );
}