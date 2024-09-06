import Image from 'next/image';
import Link from 'next/link';
import "../app/(styles)/home.css"
import imgChat from "../public/images/homeImgs/imgChat.png";
import aiGen from "../public/images/homeImgs/aiGen.png";
import groupChat from "../public/images/homeImgs/groupChat.png";
import wall from "../public/images/homeImgs/wall.png";
import inbox from "../public/images/homeImgs/inbox.png";
import profile from "../public/images/homeImgs/profile.png";
import headerPic from "../public/images/homeImgs/header.png"

export default function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-title">Welcome to ChatApp!</h1>
        <p className="home-subtitle">Where social interaction meets creativity. Express yourself through chats, images, and AI-generated content!</p>
        <Image
          src={headerPic}
          alt="ChatApp Preview"
          width={960}
          height={225}
          className="home-preview-image"
        />
      </header>

      <section className="home-features">
        <h2 className="home-section-title">Key Features</h2>
        <div className="home-feature-grid">
          {/* <div className="home-feature">
            <Image
              src={imgChat}
              alt="Chat with Images"
              width={300}
              height={300}
              className="home-feature-image"
            />
            <h3 className="home-feature-title">Chat with Images</h3>
            <p className="home-feature-description">Send and receive images in your chats, enhancing your conversations with visual content.</p>
          </div> */}
                    <div className="home-feature">
            <Image
              src={groupChat}
              alt="Group Chats"
              width={500}
              height={321}
              className="home-feature-image"
            />
            <h3 className="home-feature-title">Group Chats</h3>
            <p className="home-feature-description">Join group chats and connect with multiple friends at once. Share images, AI-generated art, and more.</p>
          </div>
          <div className="home-feature">
            <Image
              src={aiGen}
              alt="AI Image Generation"
              width={650}
              height={350}
              className="home-feature-image"
            />
            <h3 className="home-feature-title">AI Image Generation</h3>
            <p className="home-feature-description">Create unique images using our integrated DALL-E 3 AI and share them with friends.</p>
          </div>
          <div className="home-feature">
            <Image
              src={imgChat}
              alt="Chat with Images"
              width={450}
              height={300}
              className="home-feature-image"
            />
            <h3 className="home-feature-title">Chat with Images</h3>
            <p className="home-feature-description">Send and receive images in your chats, enhancing your conversations with visual content.</p>
          </div>
          {/* <div className="home-feature">
            <Image
              src={groupChat}
              alt="Group Chats"
              width={500}
              height={321}
              className="home-feature-image"
            />
            <h3 className="home-feature-title">Group Chats</h3>
            <p className="home-feature-description">Join group chats and connect with multiple friends at once. Share images, AI-generated art, and more.</p>
          </div> */}

          <div className="home-feature">
            <Image
              src={wall}
              alt="Social Media Wall"
              width={250}
              height={700}
              className="home-feature-image"
            />
            <h3 className="home-feature-title">Social Media Wall</h3>
            <p className="home-feature-description">Post, like, comment, and reply with images and AI-generated content on our interactive social media wall.</p>
          </div>

          <div className="home-feature">
            <Image
              src={inbox}
              alt="Inbox and Friend Requests"
              width={600}
              height={300}
              className="home-feature-image"
            />
            <h3 className="home-feature-title">Inbox & Friend Requests</h3>
            <p className="home-feature-description">Manage your conversations and friend requests easily in your inbox.</p>
          </div>

          <div className="home-feature">
            <Image
              src={profile}  
              alt="Profile Customization"
              width={600}
              height={300}
              className="home-feature-image"
            />
            <h3 className="home-feature-title">Profile Customization</h3>
            <p className="home-feature-description">Edit your profile details and set a unique AI-generated image as your profile picture.</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p className="home-footer-text">Ready to start chatting? <Link href="/signup" className="home-link">Sign up now</Link> or <Link href="/login" className="home-link">Log in</Link> to your account.</p>
      </footer>
    </div>
  );
};


