import { DotsVerticalIcon } from "@heroicons/react/outline";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import Loading from "./Loading";
import Error from "./Error";

const ShowComments = ({
  name,
  email,
  image,
  postId,
  text,
  timestamp,
  commentId,
  commentCount,
  setCommentCount,
}) => {
  const { data: session, loading } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [commentData, setCommentData] = useState(text);
  const [commentChange, setCommentChange] = useState(false);

  const fetchInitialData = async () => {
    try {
      const commentsSnapshot = await db
        .collection("comments")
        .doc(postId)
        .collection("comments")
        .orderBy("timestamp", "desc")
        .get();
      const comments = [];
      commentsSnapshot.forEach((doc) => {
        comments.push(doc.data());
      });
      setCommentData(comments);
      localStorage.setItem("commentData", JSON.stringify(comments));
    } catch (error) {
      console.log("Error fetching initial data: ", error);
    }
  };

  if (loading) {
    return <Loading />
  }

  if (!session) {
    return <Error />
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    if (commentChange) {
      if (postId) {
        const commentsRef = db
          .collection("comments")
          .doc(postId)
          .collection("comments");

        commentsRef
          .get()
          .then(() => {
            setCommentChange(false);
          })
          .catch((error) => {
            console.error("Error getting comments: ", error);
          });
      }
    }
  }, [commentChange, postId]);

  const handleDelete = (commentId) => {
    db.collection("comments")
      .doc(postId)
      .collection("comments")
      .doc(commentId)
      .delete()
      .then(() => {
        console.log("comment document deleted successfully");
        setShowDropdown(false);
        setCommentChange(true); // Trigger comment count update
        setCommentCount(commentCount - 1); // Update comment count
        setCommentData(""); // Remove comment data
      })
      .catch((error) => {
        console.error("Error deleting comment document: ", error);
      });
  };

  const isCurrentUserPost = email === session.user.email;

  return (
    <>
      {commentData && name && image && timestamp ? (
        <div className="p-5 bg-white dark:bg-gray-900 mt-1 rounded-2xl shadow-md border">
          <div className="flex items-center space-x-2">
            {image ? (
              <Image
                className="rounded-full"
                src={image}
                width={40}
                height={40}
                alt="/"
              />
            ) : (
              ""
            )}
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
                    onClick={() => handleDelete(commentId)}
                  >
                    Delete
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="pt-4 select-text">{commentData}</p>
        </div>
      ) : (
        ""
      )}
    </>
  );
};
export default ShowComments;
