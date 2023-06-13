import { EmojiHappyIcon } from "@heroicons/react/outline";
import { CameraIcon, VideoCameraIcon } from "@heroicons/react/solid";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { db, storage } from "../firebase";
import firebase from "firebase/compat/app";
import EmojiPicker, { SuggestionMode } from "emoji-picker-react";
import { v4 as uuidv4 } from "uuid";
import Loading from "./Loading";
import Error from "./Error";

const InputBox = () => {
  const { data: session, loading } = useSession();
  const inputRef = useRef(null);
  const [mediaToPost, setMediaToPost] = useState(null);
  const filepickerRef = useRef(null);
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
        });
      if (mediaToPost) {
        const uploadTask = storage
          .ref(`posts/${postId}`)
          .putString(mediaToPost, "data_url");

        removeMedia();

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
                // Set the postImage or postVideo field in the document
                const mediaField = mediaToPost.startsWith("data:image")
                  ? "postImage"
                  : "postVideo";

                db.collection("posts")
                  .doc(postId)
                  .set(
                    {
                      [mediaField]: url,
                    },
                    { merge: true }
                  );
              });
          }
        );
      }

      setInputStr("");
      setShowPopup(false);
    }
  };

  const addMediaToPost = (e) => {
    const reader = new FileReader();
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (e.target.files[0]) {
      const fileSize = e.target.files[0].size;

      if (fileSize > maxSize) {
        alert("File size is too large");
        return;
      }

      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setMediaToPost(readerEvent.target.result);
    };
  };

  const removeMedia = () => {
    setMediaToPost(null);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const onEmojiClick = (data) => {
    setInputStr(inputStr + data.emoji);
  };

  if (loading) {
    // Show loading state while fetching session data
    return <Loading />;
  }

  if (!session) {
    // Show message when user is logged out
    return <Error />;
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
          {mediaToPost && (
            <div
              onClick={removeMedia}
              className="flex flex-col filter-none hover:brightness-110 transition duration-150 transform hover:scale-105 cursor-pointer"
            >
              {mediaToPost.startsWith("data:image") ? (
                <img
                  className="h-10 object-contain"
                  src={mediaToPost}
                  alt="/"
                />
              ) : (
                <video className="h-10" src={mediaToPost} controls />
              )}
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
              onChange={addMediaToPost}
              accept="image/*, video/*"
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

        {inputStr.trim() || mediaToPost ? (
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
