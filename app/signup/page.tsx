// "use client";
// import Link from "next/link";
// import "../(styles)/signup.css";
// import React, {
//   ChangeEvent,
//   FormEvent,
//   useState,
//   ChangeEventHandler,
//   useRef,
// } from "react";
// import { useAuth } from "../(stores)/authContext";
// import { useRouter } from "next/navigation";
// import { country_list } from "../utils/countries";
// import DalleModal from "../(components)/dalleModal";
// import Image from "next/image";

// interface FormData {
//   image: File | null | Buffer | string;
//   email: string;
//   username: string;
//   password: string;
//   occupation: string;
//   hobbies: string[];
//   bio: string;
//   interests: string;
//   location: string;
//   sex: string;
//   age: number | null;
// }

// export default function Signup() {
//   const { login } = useAuth();
//   const router = useRouter();
//   const [formData, setFormData] = useState<FormData>({
//     email: "",
//     username: "",
//     password: "",
//     occupation: "",
//     hobbies: [],
//     bio: "",
//     interests: "",
//     location: "United States of America",
//     sex: "Male",
//     age: null,
//     image: null,
//   });
//   const [imgURL, setImgURL] = useState<string | null | undefined>();
//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const [showModal, setShowModal] = useState(false);

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     const res = await fetch("/api/v1/Signup", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     });

//     if (!res.ok) {
//       throw new Error("failed to create");
//     }
//     const { token, username, id, profilePic } = await res.json();
//     localStorage.setItem("token", token);
//     localStorage.setItem("id", id);

//     login({
//       token,
//       username,
//       id,
//       profilePic,
//     });
//     router.push(`/profile/${id}`);
//   }

//   function handleChange(
//     event: ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ): void {
//     const { value, name, files } = event.target as HTMLInputElement;
//     if (name === "hobbies") {
//       const hobbies = value.split(",").map((hobby) => hobby.trim());

//       setFormData((prev) => ({
//         ...prev,
//         hobbies: hobbies,
//       }));
//     } else if (name === "age") {
//       const age = parseInt(value);
//       setFormData((prev) => ({
//         ...prev,
//         age: isNaN(age) ? null : age,
//       }));
//     } else if (name === "image" && files) {
//       if (imgURL) {
//         URL.revokeObjectURL(imgURL);
//       }
//       const url = URL.createObjectURL(files[0]);
//       setImgURL(url);
//       const reader = new FileReader();
//       reader.onload = () => {
//         const base64String = reader.result as string;

//         setFormData((prev) => ({
//           ...prev,
//           image: base64String,
//         }));
//       };
//       reader.readAsDataURL(files[0]);
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     }
//   }

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <label htmlFor="email">*Email Address:</label>
//         <input
//           type="email"
//           id="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />

//         <label htmlFor="username">*Username:</label>
//         <input
//           type="text"
//           id="username"
//           name="username"
//           value={formData.username}
//           onChange={handleChange}
//           required
//         />

//         <label htmlFor="password">*Password:</label>
//         <input
//           type="password"
//           id="password"
//           name="password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />

//         <label htmlFor="occupation">Occupation:</label>
//         <input
//           type="text"
//           id="occupation"
//           name="occupation"
//           value={formData.occupation}
//           onChange={handleChange}
//         />

//         <label htmlFor="hobbies">
//           Enter your hobbies (separated by commas):
//         </label>
//         <textarea
//           id="hobbies"
//           name="hobbies"
//           value={formData.hobbies}
//           onChange={handleChange}
//         ></textarea>

//         <label htmlFor="bio">Tell everyone about yourself:</label>
//         <textarea
//           id="bio"
//           name="bio"
//           value={formData.bio}
//           onChange={handleChange}
//         ></textarea>

//         <label htmlFor="interests">Things you are interested in!:</label>
//         <textarea
//           id="interests"
//           name="interests"
//           value={formData.interests}
//           onChange={handleChange}
//         ></textarea>

//         <select
//           id="location"
//           name="location"
//           value={formData.location}
//           onChange={handleChange}
//         >
//           <option value="United States of America">
//             United States of America
//           </option>
//           {country_list.map((country) => (
//             <option key={country} value={country}>
//               {country}
//             </option>
//           ))}
//         </select>
//         <label htmlFor="sex">Sex:</label>
//         <select
//           id="sex"
//           name="sex"
//           value={formData.sex}
//           onChange={handleChange}
//         >
//           <option value="Male">Male</option>
//           <option value="Female">Female</option>
//           <option value="Other">Other</option>
//         </select>

//         <label htmlFor="age">*Age:</label>
//         <input
//           type="number"
//           id="age"
//           name="age"
//           value={formData.age === null ? "" : formData.age.toString()}
//           onChange={handleChange}
//           min="18"
//         />

//         <label htmlFor="image">Profile Picture:</label>
//         <input
//           type="file"
//           id="image"
//           name="image"
//           accept="image/jpeg"
//           //  value={formData.image}
//           ref={fileInputRef}
//           onChange={handleChange}
//         />
//         {formData.image && (
//           <Image
//             className="preview"
//             src={imgURL || ""}
//             height={200}
//             width={200}
//             alt="Profile Preview"
//           />
//         )}
//         <button type="submit">Sign up!</button>
//         <p>* Required fields</p>
//       </form>
//       <p>
//         Have an account? <Link href="/login">Log In</Link>
//       </p>
//       <button onClick={() => setShowModal(!showModal)}>
//         {showModal ? "Cancel" : "Create a profile Picture with AI!"}
//       </button>
//       {showModal && (
//         <DalleModal
//           imgURL={null}
//           setFormData={setFormData}
//           setImgURL={setImgURL}
//           fileInputRef={fileInputRef}
//           showModal={showModal}
//           setShowModal={setShowModal}
//           setEditDetails={null}
//           setNewComments={null}
//           postId={null}
//           fromChat={false}
//         />
//       )}
//     </div>
//   );
// }
"use client";
import Link from "next/link";
import "../(styles)/signup.css";
import React, {
  ChangeEvent,
  FormEvent,
  useState,
  useRef,
} from "react";
import { useAuth } from "../(stores)/authContext";
import { useRouter } from "next/navigation";
import { country_list } from "../utils/countries";
import DalleModal from "../(components)/dalleModal";
import Image from "next/image";
import "../(styles)/post.css";
import "../(styles)/signup.css";

interface FormData {
  image: File | null | Buffer | string;
  email: string;
  username: string;
  password: string;
  occupation: string;
  hobbies: string[];
  bio: string;
  interests: string;
  location: string;
  sex: string;
  age: number | null;
}

export default function Signup() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    username: "",
    password: "",
    occupation: "",
    hobbies: [],
    bio: "",
    interests: "",
    location: "United States of America",
    sex: "Male",
    age: null,
    image: null,
  });
  const [imgURL, setImgURL] = useState<string | null | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const res = await fetch("/api/v1/Signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error("failed to create");
    }
    const { token, username, id, profilePic } = await res.json();
    localStorage.setItem("token", token);
    localStorage.setItem("id", id);

    login({
      token,
      username,
      id,
      profilePic,
    });
    router.push(`/profile/${id}`);
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void {
    const { value, name, files } = event.target as HTMLInputElement;
    if (name === "hobbies") {
      const hobbies = value.split(",").map((hobby) => hobby.trim());

      setFormData((prev) => ({
        ...prev,
        hobbies: hobbies,
      }));
    } else if (name === "age") {
      const age = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        age: isNaN(age) ? null : age,
      }));
    } else if (name === "image" && files) {
      if (imgURL) {
        URL.revokeObjectURL(imgURL);
      }
      const url = URL.createObjectURL(files[0]);
      setImgURL(url);
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;

        setFormData((prev) => ({
          ...prev,
          image: base64String,
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  return (
    <div className="signup-container">
      <form className="signup-container-form" onSubmit={handleSubmit}>
        <label className="signup-container-label" htmlFor="email">*Email Address:</label>
        <input
          className="signup-container-input"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label className="signup-container-label" htmlFor="username">*Username:</label>
        <input
          className="signup-container-input"
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label className="signup-container-label" htmlFor="password">*Password:</label>
        <input
          className="signup-container-input"
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <label className="signup-container-label" htmlFor="occupation">Occupation:</label>
        <input
          className="signup-container-input"
          type="text"
          id="occupation"
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
        />

        <label className="signup-container-label" htmlFor="hobbies">Enter your hobbies (separated by commas):</label>
        <textarea
          className="signup-container-input"
          id="hobbies"
          name="hobbies"
          value={formData.hobbies}
          onChange={handleChange}
        ></textarea>

        <label className="signup-container-label" htmlFor="bio">Tell everyone about yourself:</label>
        <textarea
          className="signup-container-input"
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
        ></textarea>

        <label className="signup-container-label" htmlFor="interests">Things you are interested in!:</label>
        <textarea
          className="signup-container-input"
          id="interests"
          name="interests"
          value={formData.interests}
          onChange={handleChange}
        ></textarea>

        <label className="signup-container-label" htmlFor="location">Location:</label>
        <select
          className="signup-container-input"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
        >
          <option value="United States of America">United States of America</option>
          {country_list.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <label className="signup-container-label" htmlFor="sex">Sex:</label>
        <select
          className="signup-container-input"
          id="sex"
          name="sex"
          value={formData.sex}
          onChange={handleChange}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <label className="signup-container-label" htmlFor="age">*Age:</label>
        <input
          className="signup-container-input"
          type="number"
          id="age"
          name="age"
          value={formData.age === null ? "" : formData.age.toString()}
          onChange={handleChange}
          min="18"
        />

        <label className="signup-container-label" htmlFor="image">Profile Picture:</label>
        <div className="imgPost">
                  <label className="image-upload-labell">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      className="image-upload-input"
                      accept="image/jpeg"
                      onChange={handleChange}
                    />
                    <p className="image-upload-iconn">Upload File</p>
                  </label>
                  <p>or</p>
                  <p
                    className="imgPostP"
                    onClick={() => {
                      setShowModal(!showModal);
                    }}
                  >
                    Add AI Image
                  </p>
                </div>

        {formData.image && (
          <Image
            className="preview"
            src={imgURL || ""}
            height={200}
            width={200}
            alt="Profile Preview"
          />
        )}
        <button type="submit">Sign up!</button>
        <p>* Required fields</p>
      </form>

      <p>
        Have an account? <Link href="/login">Log In</Link>
      </p>

      {showModal && (
        <DalleModal
          imgURL={null}
          setFormData={setFormData}
          setImgURL={setImgURL}
          fileInputRef={fileInputRef}
          showModal={showModal}
          setShowModal={setShowModal}
          setEditDetails={null}
          setNewComments={null}
          postId={null}
          fromChat={false}
        />
      )}
    </div>
  );
}

