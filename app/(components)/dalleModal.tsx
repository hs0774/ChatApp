"use client";
import React, { ChangeEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "../(stores)/authContext.tsx"
import "dotenv/config";
import env from "../utils/validateEnv.ts"
import OpenAI from "openai";
import "../(styles)/imggen.css"
import { TailSpin } from 'react-loader-spinner';


//pass state that holds image 
//pass state of img preview url for substitute 
//if image is generated image state and url are populated 
//find way to clear choose file input if populated with image
//hide api key 
export default function DalleModal({imgURL,setFormData,setImgURL,fileInputRef,setEditDetails,setNewComments,postId,fromChat,showModal,setShowModal}) { 
    //const openai = new OpenAI({apiKey:process.env.OPEN_AI_SECRET_KEY,dangerouslyAllowBrowser: true});
    const [prompt,setPrompt] = useState("");
    const [url,setUrl] = useState(null);
    const [loading, setLoading] = useState(false);

async function genImage(event) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch('/api/v1/Genimg', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });

    if (response.ok) {
        const data = await response.json();
        
        const base64img = `data:image/jpeg;base64,${data}`;

        if (fromChat) {
            const resizedImage = await resizeImage(base64img, 150, 150);
            setUrl(resizedImage);
        } else {
            setUrl(base64img);
        }

    } else {
        console.error('Error generating image');
    }
    setLoading(false);
}

function resizeImage(base64Str: string, maxWidth: number, maxHeight: number) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = maxWidth;
            canvas.height = maxHeight;

            ctx?.drawImage(img, 0, 0, maxWidth, maxHeight);
            const resizedBase64 = canvas.toDataURL('image/jpeg');
            resolve(resizedBase64);
        };
    });
}
    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
       const {value} = event.target;
       setPrompt(value);
    }

    function toggleModal(event: MouseEvent<HTMLButtonElement, MouseEvent>){
        setShowModal(false);
        setPrompt("");
        setUrl(null);
    }

    function setImg(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
      setImgURL(url);
      if(setFormData) {
        setFormData((prev) => ({
            ...prev,
            image:url,
        }))
      } else if (setEditDetails) {
        setEditDetails((prev) => ({
            ...prev,
            profilePic:url,
        }))
      } else if (setNewComments) {
        setNewComments(prevComments => ({
            ...prevComments,
            [postId]: {
              ...prevComments[postId],
              image:url,
            }
        }));
      }
      if (fileInputRef && fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    setShowModal(false);
    setPrompt("");
    setUrl(null);
    }
    return (
        <>
            {showModal && (
                <div className="modalOverlay">
                    <div className="imgGenModal">
                        <button className="closebtn" onClick={toggleModal}>&times;</button>
                        {loading && (
                            <div className="loadingSpinner">
                                <TailSpin height="50" width="50" color="white" ariaLabel="loading" />
                            </div>
                        )}
                        <div>
                            {!url ? null : <img className="genImg" src={url} />}
                        </div>
                        <div>
                            <label htmlFor="genImg">Enter a prompt:</label>
                        </div>

                        <form onSubmit={genImage}>
                            <input type="text" onChange={handleChange} />
                            <button>Generate</button>
                        </form>
                        <button className="finishGen" onClick={setImg}>Done</button>
                    </div>
                </div>
            )}
        </>
    );
}
//so this modal is going to have the image in the middle,
//an x button on the left or right
// an input text for the text
//generate button 
//done button 
// i should pass the setpost,setmessage or set post reply  as params to modify the image
// i should either change the other two prompts to base64 might be more consistent 
// i should have a set text and set image maybe together
// i pass the text to the server and dalle3 does its magic 
// i return the img as base64 string and url, the url will temporarily populate the middle
// and the base64 will be saved to setpost/message/post.reply then the user can press x or done
// after that the rest of the code will be the same of course changing the file stuff to base64
// for consisntency 
