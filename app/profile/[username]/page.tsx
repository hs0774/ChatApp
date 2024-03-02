interface profileParams{
    params: {
        username:string;
    }
}
export default function Profile({params}:profileParams) {
    return (
        <div>
            <h1>Welcome to Log-in {params.username}</h1>
        </div>
    );
  }