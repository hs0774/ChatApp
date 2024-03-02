interface chatParams{
    params: {
        id:string;
    }
}
export default function Chat({params}:chatParams) {
    return (
        <div>
            <h1>Welcome to chat {params.id}</h1>
        </div>
    );
}

