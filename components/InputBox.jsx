import { EmojiHappyIcon } from "@heroicons/react/outline";
import { CameraIcon, VideoCameraIcon } from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { db, storage } from "../firebase";
import firebase from "firebase/compat/app";
import EmojiPicker, { SuggestionMode } from "emoji-picker-react";
import { v4 as uuidv4 } from "uuid";

const InputBox = () => {
  const { data: session, loading } = useSession();
  const inputRef = useRef(null);
  const filepickerRef = useRef(null);
  const [imageToPost, setImageToPost] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [inputStr, setInputStr] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const sendPost = (e) => {
    e.preventDefault();

    if (!loading && session) {
      const currentUser = session.user;
      // console.log("Current user:", currentUser);

      const postId = uuidv4(); // Define the postId variable

      db.collection("posts")
        .doc(postId) // Set the document ID to be the same as postId
        .set({
          id: postId, // Use the postId as the value for the id field
          postId: postId,
          message: inputStr,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          if (imageToPost) {
            const uploadTask = storage
              .ref(`posts/${postId}`)
              .putString(imageToPost, "data_url");
      
            removeImage();
      
            uploadTask.on(
              "state_change",
              null,
              (error) => console.error(error),
              () => {
                // When the upload completes
                storage
                  .ref("posts")
                  .child(postId)
                  .getDownloadURL()
                  .then((url) => {
                    // Set the postImage field in the document
                    db.collection("posts")
                      .doc(postId)
                      .set(
                        {
                          postImage: url,
                        },
                        { merge: true }
                      );
                  });
              }
            );
          }
        });      

      setInputStr("");
      setShowPopup(false);
    }
  };

  const addImageToPost = (e) => {
    const reader = new FileReader();
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (e.target.files[0]) {
      const fileSize = e.target.files[0].size;

      if (fileSize > maxSize) {
        alert("File size is too large");
        return;
      }

      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setImageToPost(readerEvent.target.result);
    };
  };

  const removeImage = () => {
    setImageToPost(null);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const onEmojiClick = (data) => {
    setInputStr(inputStr + data.emoji);
  };

  if (loading) {
    // Show loading state while fetching session data
    return <p>Loading...</p>;
  }

  if (!session) {
    // Show message when user is logged out
    return <p>You are logged out.</p>;
  }

  return (
    <>
      <div
        className="bg-white dark:bg-gray-900 dark:text-white rounded-2xl shadow-md text-gray-500 font-medium mt-6"
        ref={dropdownRef}
      >
        <div className="flex space-x-4 p-6 items-center">
          <Image
            className="rounded-full"
            src={session.user.image}
            width={40}
            height={40}
            layout="fixed"
            alt={session.user.name}
          />
          <form className="flex flex-1">
            <textarea
              className="input-class pt-3 rounded-full h-12 resize-none appearance-none bg-gray-100 flex-grow px-5 focus:outline-none dark:text-black"
              type="text"
              ref={inputRef}
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              placeholder={`what's on your mind, ${session.user.name}?`}
            />
          </form>
          {imageToPost && (
            <div
              onClick={removeImage}
              className="flex flex-col filter-none hover:brightness-110 transition duration-150 transform hover:scale-105 cursor-pointer"
            >
              <img className="h-10 object-contain" src={imageToPost} alt="/" />
              <p className="text-xs text-red-500 text-center">Remove</p>
            </div>
          )}
        </div>

        {showPopup && (
          <div className="relative z-10">
            <div className="absolute z-20 flex items-center emoji-class justify-center">
              <EmojiPicker
                theme="auto"
                onEmojiClick={onEmojiClick}
                suggestedEmojisMode={SuggestionMode.RECENT}
              />
            </div>
          </div>
        )}

        <div className="flex justify-evenly wrap-class p-3 border-t dark:border-t-0">
          <div className="inputIcon font-class">
            <VideoCameraIcon className="h-7 text-red-500" />
            <p className="text-xs font-class sm:text-sm xl:text-base">
              Live Video
            </p>
          </div>

          <div
            onClick={() => filepickerRef.current.click()}
            className="inputIcon"
          >
            <CameraIcon className="h-7 text-green-400 font-class" />
            <p className="text-xs font-class sm:text-sm xl:text-base">
              Photo/Video
            </p>
            <input
              ref={filepickerRef}
              type="file"
              onChange={addImageToPost}
              accept="image/*"
              hidden
            />
          </div>

          <div className="inputIcon font-class" onClick={togglePopup}>
            <EmojiHappyIcon className="h-7 text-yellow-300" />
            <p className="text-xs font-class sm:text-sm xl:text-base">
              Feeling/Activity
            </p>
          </div>
        </div>

        {inputStr.trim() || imageToPost ? (
          <button
            className="bg-blue-500 flex items-center justify-center w-[100%] rounded-b-2xl text-white py-2 font-medium text-base"
            type="submit"
            onClick={sendPost}
          >
            Send
          </button>
        ) : (
          ""
        )}
      </div>
    </>
  );
};
export default InputBox;
