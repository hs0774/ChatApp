"use client";
import React, { ChangeEvent, useState, MouseEvent } from "react";
import "../(styles)/imggen.css";
import { TailSpin } from "react-loader-spinner";
import Image from "next/image";

interface DalleModalProps {
  imgURL: string | null| undefined;
  setFormData: React.Dispatch<React.SetStateAction<any>> | null;
  setImgURL: React.Dispatch<React.SetStateAction<string | undefined | null>>;
  fileInputRef: React.RefObject<HTMLInputElement> | undefined;
  setEditDetails: React.Dispatch<React.SetStateAction<any>> | null;
  setNewComments: React.Dispatch<React.SetStateAction<any>> | null;
  postId: string | null ;
  fromChat: boolean;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DalleModal({
  imgURL,
  setFormData,
  setImgURL,
  fileInputRef,
  setEditDetails,
  setNewComments,
  postId,
  fromChat,
  showModal,
  setShowModal,
}: DalleModalProps) {
  const [prompt, setPrompt] = useState<string>("");
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function genImage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token')
    const response = await fetch("/api/v1/Genimg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
      console.error("Error generating image");
    }
    setLoading(false);
  }

  function resizeImage(base64Str: string, maxWidth: number, maxHeight: number) {
    return new Promise<string>((resolve) => {
      const img = new window.Image(); 
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = maxWidth;
        canvas.height = maxHeight;

        ctx?.drawImage(img, 0, 0, maxWidth, maxHeight);
        const resizedBase64 = canvas.toDataURL("image/jpeg");
        resolve(resizedBase64);
      };
    });
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const { value } = event.target;
    setPrompt(value);
  }

  function toggleModal(event: MouseEvent<HTMLButtonElement>): void {
    setShowModal(false);
    setPrompt("");
    setUrl(null);
  }

  function setImg(event: MouseEvent<HTMLButtonElement>): void {
    setImgURL(url);
    if (setFormData) {
      setFormData((prev: any) => ({
        ...prev,
        image: url,
      }));
    } else if (setEditDetails) {
      setEditDetails((prev: any) => ({
        ...prev,
        profilePic: url,
      }));
    } else if (setNewComments) {
      setNewComments((prevComments: any) => ({
        ...prevComments,
        [postId as string]: {
          ...prevComments[postId as string],
          image: url,
        },
      }));
    }
    if (fileInputRef && fileInputRef.current) {
      fileInputRef.current.value = "";
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
            <button className="closebtn" onClick={toggleModal}>
              &times;
            </button>
            {loading && (
              <div className="loadingSpinner">
                <TailSpin height="50" width="50" color="white" ariaLabel="loading" />
              </div>
            )}
            <div>
              {!url ? null : (
                <Image
                  className="genImg"
                  src={url}
                  alt="Generated image"
                  width={150}
                  height={150}
                />
              )}
            </div>
            <div>
              <label htmlFor="genImg">Enter a prompt:</label>
            </div>

            <form onSubmit={genImage}>
              <input type="text" onChange={handleChange} />
              <button>Generate</button>
            </form>
            <button className="finishGen" onClick={setImg}>
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
