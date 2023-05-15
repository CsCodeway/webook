import {
  ChatAltIcon,
  DotsVerticalIcon,
  ShareIcon,
  ThumbUpIcon,
} from "@heroicons/react/outline";
import { ThumbUpIcon as SolidThumbUpIcon } from "@heroicons/react/solid";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import firebase from "firebase/compat/app";
import Head from "next/head";
import { useRouter } from 'next/router'
import { PostContext } from "./PostContext";

const Post = ({
  postId,
  name,
  message,
  postImage,
  image,
  timestamp,
  currentUser,
}) => {
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const router = useRouter();
  const { updatePostImage } = useContext(PostContext);

  useEffect(() => {
    const postRef = db.collection("likes").doc(postId);

    const user = currentUser; // Get the currently logged-in user

    if (user) {
      const userId = user.uid;

      // Fetch the initial like status and count for the specific user
      postRef.get().then((snapshot) => {
        if (snapshot.exists) {
          setIsLiked(snapshot.data()[userId]);
        } else {
          // Check if there is a like status stored in the local storage for this postId and user
          const likeStatus = localStorage.getItem(`${postId}_${userId}`);
          setIsLiked(likeStatus === "true");
        }
      });
    } else {
      // Fetch the initial like status and count when there is no user logged in
      postRef.get().then((snapshot) => {
        const post = snapshot.data();

        if (post && post.likes) {
          setIsLiked(post.likes === 1);
          setLikeCount(post.likes); // Set the initial like count
        } else {
          // Check if there is a like status stored in the local storage for this postId
          const likeStatus = localStorage.getItem(postId);
          setIsLiked(likeStatus === "true");
        }
      });
    }

    return () => {
      // Clean up
      postRef.onSnapshot(() => {});
    };
  }, [postId]);

  const handleLikeClick = () => {
    const user = currentUser;
    if (user) {
      const userId = user.uid;
      const newIsLiked = !isLiked;

      // Update the like count in the state based on the new like status
      setLikeCount((prevCount) => (newIsLiked ? prevCount + 1 : prevCount - 1));

      setIsLiked(newIsLiked);

      // Fetch the current like count from the database
      db.collection("likes")
        .doc(postId)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const currentLikeCount = doc.data().likes || 0;
            const updatedLikeCount = newIsLiked
              ? currentLikeCount + 1
              : currentLikeCount - 1;

            // Update the like count in the database
            db.collection("likes")
              .doc(postId)
              .update({
                [userId]: newIsLiked,
                likes: updatedLikeCount,
              })
              .catch((error) => {
                console.log("Error updating document: ", error);
              });
          } else {
            // Create a new document with initial like count of 1
            db.collection("likes")
              .doc(postId)
              .set({
                [userId]: newIsLiked,
                likes: 1,
              })
              .catch((error) => {
                console.log("Error creating document: ", error);
              });
          }
        })
        .catch((error) => {
          console.log("Error getting document: ", error);
        });

      localStorage.setItem(`${postId}_${userId}`, newIsLiked.toString());

      if (newIsLiked) {
        const audio = new Audio("/assets/facebook_likes.mp3");
        audio.play();
      }
    }
  };

  useEffect(() => {
    // Fetch the initial like count from the database
    db.collection("likes")
      .doc(postId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setLikeCount(data.likes || 0);
        }
      })
      .catch((error) => {
        console.log("Error fetching like count: ", error);
      });
  }, []);

  function handleNavigation() {
    updatePostImage(postImage);
    router.push(`/more/${postId}`)
  }
  const [comment, setComment] = useState(false);
  const dropdownRef = useRef(null);

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
          {message ? <p className="pt-4 select-text">{message}</p> : ""}
        </div>
        {postImage && (
          <div className="relative h-56 md:h-96 cursor-pointer bg-white dark:bg-gray-900">
            <Image
              src={postImage}
              onClick={handleNavigation}
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
              {isLiked ? (
                <SolidThumbUpIcon className="h-4 text-blue-500" />
              ) : (
                <ThumbUpIcon className="h-4" />
              )}
              <p className="text-xs sm:text-base">Like</p>
              <span className="text-sm text-gray-500">{likeCount}</span>
            </div>
            <Head>
              <link
                rel="preload"
                href="/assets/facebook_likes.mp3"
                as="audio"
              />
            </Head>

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
