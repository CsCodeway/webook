import {
  ChatAltIcon,
  ChevronDoubleRightIcon,
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
import { useRouter } from "next/router";
import { PostContext } from "./PostContext";
import { useSession } from "next-auth/react";
import Loading from "./Loading";
import Error from "./Error";

const Post = ({
  postId,
  id,
  name,
  email,
  message,
  postImage,
  postVideo,
  image,
  timestamp,
  currentUser,
  deletePost,
}) => {
  const { data: session, loading } = useSession();
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const router = useRouter();
  const { updatePostImage } = useContext(PostContext);
  const { updatePostVideo } = useContext(PostContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFullMessage, setShowFullMessage] = useState(false);
  const videoRef = useRef(null);

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

  if (loading) {
    return <Loading />;
  }

  if (!session) {
    return <Error />;
  }

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
  const handleClick = (e) => {
    e.preventDefault();
  };

  function handleNavigation() {
    updatePostImage(postImage);
    updatePostVideo(postVideo);
    router.push(`/comment/${postId}`);
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

    // Generate a unique ID for the comment
    const commentId = db.collection("comments").doc().id;

    // Add the comment data to the Firebase database
    db.collection("comments")
      .doc(postId)
      .collection("comments")
      .doc(commentId)
      .set({
        postId: postId,
        id: commentId,
        text: commentText,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

    // Clear the comment text input field
    setCommentText("");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDelete = () => {
    // Delete the post document
    deletePost(postId);

    // Delete the corresponding comments
    db.collection("comments")
      .doc(postId)
      .collection("comments")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          doc.ref.delete();
        });
        console.log("Comments deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting comments: ", error);
      });

    // Delete the corresponding like document
    db.collection("likes")
      .doc(postId)
      .delete()
      .then(() => {
        console.log("Like document deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting like document: ", error);
      });

    setShowDropdown(false);
  };

  const handleShowMore = () => {
    setShowFullMessage(true);
  };

  const handleSeeLess = () => {
    setShowFullMessage(false);
  };

  const getMessageText = () => {
    if (message) {
      if (message.split(" ").length > 50 && !showFullMessage) {
        const truncatedMessage = message.split(" ").slice(0, 50).join(" ");
        return (
          <>
            <p className="pt-4 select-text">{truncatedMessage}...</p>
            <button className="mt-2 text-gray-700" onClick={handleShowMore}>
              Show more
            </button>
          </>
        );
      } else {
        return (
          <>
            <p
              className={`pt-4 ${
                postImage ? "" : "select-text cursor-pointer"
              }`}
              onClick={postImage ? undefined : handleNavigation}
            >
              {message}
            </p>

            {message.split(" ").length > 50 && (
              <button className="mt-2 text-gray-700" onClick={handleSeeLess}>
                See less
              </button>
            )}
          </>
        );
      }
    } else {
      return null;
    }
  };

  const isCurrentUserPost = email === session.user.email;

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
                  {new Date(timestamp?.toDate())
                    .toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })
                    .replace(",", "")
                    .replace(/(am|pm)/i, (match) => match.toUpperCase())}
                </p>
              ) : (
                <p className="text-xs text-gray-400">Loading...</p>
              )}
            </div>
            <div className="relative">
              <DotsVerticalIcon
                height={23}
                onClick={toggleDropdown}
                className="cursor-pointer text-gray-500"
              />
              {isCurrentUserPost && showDropdown && (
                <div className="absolute top-0 right-0 mt-6 w-40 py-2 bg-white dark:bg-gray-900 shadow-lg rounded-md z-10">
                  <p
                    className="px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-800"
                    onClick={handleDelete}
                  >
                    Delete
                  </p>
                </div>
              )}
            </div>
          </div>
          {getMessageText()}
        </div>
        {postImage && (
          <div className="relative h-56 md:h-96 cursor-pointer bg-white dark:bg-gray-900 z-0">
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
        {postVideo && (
          <div className="relative h-56 md:h-96 cursor-pointer bg-white dark:bg-gray-900 z-0">
            <div className="w-full h-full" onClick={handleNavigation}>
              <video
                src={postVideo}
                className="w-full h-full object-cover"
                controls
                ref={videoRef}
                onClick={handleClick}
              />
            </div>
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
            <form className="flex border-t h-12 ">
              <textarea
                className="input-class pt-3 rounded-b-2xl resize-none appearance-none bg-white flex-grow px-5 focus:outline-none dark:text-black"
                type="text"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder={`Write something about, ${name}...`}
              />
              {commentText.trim() && (
                <button
                  onClick={handleCommentSubmit}
                  className="bg-blue-400 text-white flex justify-center items-center px-3 gap-1 text-base rounded-br-2xl"
                >
                  Send <ChevronDoubleRightIcon height={15} width={15} />
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </>
  );
};
export default Post;
