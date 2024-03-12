import React from 'react'
import Link from 'next/link'

export default function Navbar() {
  const logged = false;
  return (
    <nav>
      <div className='Navleft'>
        <Link href="/"><h1>ChatApp</h1></Link>
      </div>
      <div className='NavRight'>
        {!logged ?
        <>
        <Link href="/login"><p>Log In</p> </Link>
        <Link href="/signup"><p>Sign up</p></Link>
        </>
        : 
        <>
        <Link href="/chat/3"><p>Chat!</p></Link>
        <Link href="/profile/jim"><p>Hello, User</p></Link> 
        <p>Logout</p> 
        </>
        }
      </div>
    </nav>
  )
}

//fix /profile/jim to get name/id
//fix /chat/3 to chat/id
//logout is going to be a post request and nav back to home page 
//this might solve easily when logged works/auth 