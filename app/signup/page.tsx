import Link from 'next/link'
export default function Signup() {
    return (
    <div>
        <form>
            <label htmlFor="email">Email Address:</label>
            <input type="email" id="email" name="email" />
            
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" />
            
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" />
            
            <label htmlFor="hobbies">Enter your hobbies (separated by commas):</label>
            <input type="text" id="hobbies" name="hobbies" />
            
            <button type="submit">Sign up!</button>
        </form>
        <p>Have an account? <Link href="/login">Log In</Link></p>
    </div>
    );
}

  //consider having details on this page and maybe even profile pic etc so we 
// can get all of this on sign up 

//   username: { type: String, required: true },
//   password: { type: String, required: true }, 
//   email: { type: String, required: true },  
//   profilePic: { type: Buffer },
//   status: { type: Boolean, default: false },
// hobbies: string[];
// job: string;
// interests:string;
// bio: string;
// age: number;
// sex: 'male' | 'female' | 'other';
// location?: string;
//   //maybe for status have a go online button similar to appearing offline


