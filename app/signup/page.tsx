import Link from 'next/link'
export default function Signup() {

    return (
    <div>
        <form>
            <label htmlFor="email">*Email Address:</label>
            <input type="email" id="email" name="email" required/>
            
            <label htmlFor="username">*Username:</label>
            <input type="text" id="username" name="username" required/>
            
            <label htmlFor="password">*Password:</label>
            <input type="password" id="password" name="password" required/>
            
            <label htmlFor="occupation">Occupation:</label>
            <input type="occupation" id="occupation" name="occupation" />

            <label htmlFor="hobbies">Enter your hobbies (separated by commas):</label>
            <textarea id="hobbies" name="hobbies" />
            
            <label htmlFor="bio">Tell everyone about yourself:</label>
            <textarea id="bio" name="bio" />

            <label htmlFor="location">Country:</label>
            <input type="location" id="location" name="location" />
            
            <button type="submit">Sign up!</button>
            <p>* Required fields</p>
        </form>
        <p>Have an account? <Link href="/login">Log In</Link></p>
    </div>
    );
}

//change age to DOB and fix schemas 
// interests: { type: String },
// bio: { type: String },
// age: { type: Number },
// sex: { type: String, enum: ['male', 'female', 'other'] },
// location: { type: String },
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


