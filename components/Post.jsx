import {
  ChatAltIcon,
  DotsVerticalIcon,
  ShareIcon,
  ThumbUpIcon,
} from "@heroicons/react/outline";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import firebase from "firebase/compat/app";

const Post = ({ name, message, postImage, image, timestamp }) => {
  const [commentText, setCommentText] = useState("");
  const handleImageClick = () => {
    window.open(postImage, "_blank");
  };
  const [likes, setLikes] = useState(0); // state variable for likes
  const [comment, setComment] = useState(false);
  const dropdownRef = useRef(null);

  const handleLikeClick = () => {
    setLikes(likes + 1);
  };

  const postComment = () => {
    setComment(!comment);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setComment(false);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    // Add the comment data to the Firebase database
    db.collection("comments").add({
      text: commentText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    // Clear the comment text input field
    setCommentText("");
  };
  return (
    <>
      <div className="flex flex-col" ref={dropdownRef}>
        <div className="p-5 bg-white dark:bg-gray-900 mt-5 rounded-t-2xl shadow-sm">
          <div className="flex items-center space-x-2">
            <Image
              className="rounded-full"
              src={image}
              width={40}
              height={40}
              alt="/"
            />
            <div className="flex-1">
              <p className="font-medium">{name}</p>
              {timestamp ? (
                <p className="text-xs text-gray-400 dark:text-gray-300">
                  {new Date(timestamp?.toDate()).toLocaleString()}
                </p>
              ) : (
                <p className="text-xs text-gray-400">Loading...</p>
              )}
            </div>
            <DotsVerticalIcon
              height={25}
              width={22}
              className="text-gray-500 cursor-pointer"
            />
          </div>
          <p className="pt-4 select-text">{message}</p>
        </div>
        {postImage && (
          <div className="relative h-56 md:h-96 cursor-pointer bg-white dark:bg-gray-900">
            <Image
              src={postImage}
              onClick={handleImageClick}
              className="dark:bg-gray-300"
              objectFit="cover"
              alt="/"
              layout="fill"
            />
          </div>
        )}
        {/* footer of post */}
        <div className="flex flex-col bg-white dark:bg-gray-900 rounded-b-2xl dark:text-gray-300 shadow-md text-gray-400 border-t dark:border-t-0">
          <div className="flex justify-between items-center  ">
            <div
              className="dark:hover:bg-blue-600 hover:text-gray-300 inputIcon rounded-none rounded-bl-2xl"
              onClick={handleLikeClick}
            >
              <ThumbUpIcon className="h-4" />
              <p className="text-xs sm:text-base">{likes}</p>
            </div>

            <div
              className="dark:hover:bg-blue-600 hover:text-gray-300 inputIcon rounded-none"
              onClick={postComment}
            >
              <ChatAltIcon className="h-4" />
              <p className="text-xs sm:text-base">Comment</p>
            </div>

            <div className="dark:hover:bg-blue-600 hover:text-gray-300 inputIcon rounded-none rounded-br-2xl">
              <ShareIcon className="h-4" />
              <p className="text-xs sm:text-base">Share</p>
            </div>
          </div>
          {comment && (
            <form onSubmit={handleCommentSubmit} className="flex">
              <input
                className="input-class rounded-b-2xl h-12 border-t bg-white flex-grow px-5 focus:outline-none dark:text-black"
                type="text"
                placeholder="comment"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
              />
            </form>
          )}
        </div>
      </div>
    </>
  );
};
export default Post;
