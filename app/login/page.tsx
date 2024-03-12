import Link from 'next/link'
export default function Login() {
    return (
        <div>
            <form>
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" />
                
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" />
                <button>Log in!</button>
            </form>
            <p>Don&apos;t have an acount? <Link href="/signup">Sign up</Link></p>
        </div>
    );
  }