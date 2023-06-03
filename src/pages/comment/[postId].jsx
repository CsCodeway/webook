import { useContext, useEffect, useState } from "react";
import { PostContext } from "../../../components/PostContext";
import Head from "next/head";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  ArrowLeftIcon,
  ChatAltIcon,
  ChevronDoubleRightIcon,
  DotsHorizontalIcon,
  ShareIcon,
} from "@heroicons/react/outline";
import { ThumbUpIcon } from "@heroicons/react/solid";
import ShowComments from "../../../components/ShowComments";
import { db } from "../../../firebase";
import { useRouter } from "next/router";
import firebase from "firebase/compat/app";

const ImageComment = () => {
  const { postImage, updatePostImage } = useContext(PostContext);
  const { data: session, loading, error } = useSession();
  const router = useRouter();
  const { postId } = router.query;
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [commentsData, setCommentsData] = useState([]);
  const [commentChange, setCommentChange] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postData, setPostData] = useState(null);
  const [showFullMessage, setShowFullMessage] = useState(false);

  const fetchInitialData = async () => {
    try {
      const likeCountSnapshot = await db.collection("likes").doc(postId).get();
      if (likeCountSnapshot.exists) {
        const data = likeCountSnapshot.data();
        setLikeCount(data.likes || 0);
      }

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
      setCommentsData(comments);
      setCommentCount(comments.length);
      localStorage.setItem("commentsData", JSON.stringify(comments));

      // Fetch post data
      const postSnapshot = await db.collection("posts").doc(postId).get();
      if (postSnapshot.exists) {
        const postData = postSnapshot.data();
        setPostData(postData);
        localStorage.setItem("postData", JSON.stringify(postData));
      }
    } catch (error) {
      console.log("Error fetching initial data: ", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [postId]);

  useEffect(() => {
    // Check if postImage is null or undefined after refreshing the page
    // If so, try to retrieve it from local storage
    if (!postImage) {
      const storedPostImage = localStorage.getItem("postImage");
      if (storedPostImage) {
        updatePostImage(storedPostImage);
      }
    }
  }, [postImage, updatePostImage]);

  useEffect(() => {
    // Store the postImage value in local storage whenever it changes
    if (postImage) {
      localStorage.setItem("postImage", postImage);
    }
  }, [postImage]);

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

  useEffect(() => {
    if (commentChange) {
      if (postId) {
        const commentsRef = db
          .collection("comments")
          .doc(postId)
          .collection("comments");

        commentsRef
          .get()
          .then((querySnapshot) => {
            const count = querySnapshot.size;
            setCommentCount(count);
            setCommentChange(false);
          })
          .catch((error) => {
            console.error("Error getting comments: ", error);
          });
      }
    }
  }, [commentChange, postId]);

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
      })

      .then(() => {
        console.log("Comment added successfully");
        setCommentText(""); // Clear the comment text input field
        fetchInitialData(); // Reload the page
        setCommentChange(true);
      })
      .catch((error) => {
        console.error("Error adding comment: ", error);
      });
  };

  const handleShowMore = () => {
    setShowFullMessage(true);
  };

  const handleSeeLess = () => {
    setShowFullMessage(false);
  };

  const getMessageText = () => {
    if (postData?.message) {
      if (postData.message.split(" ").length > 50 && !showFullMessage) {
        const truncatedMessage = postData.message
          .split(" ")
          .slice(0, 50)
          .join(" ");
        return (
          <>
            <p className="px-2">{truncatedMessage}</p>
            <button className="mt-2" onClick={handleShowMore}>
              Show more
            </button>
          </>
        );
      } else {
        return (
          <>
            <p className="px-2">{postData.message}</p>
            {postData.message.split(" ").length > 50 && (
              <button className="mt-2" onClick={handleSeeLess}>
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

  const handleMain = () => {
    router.replace("/");
  };

  useEffect(() => {
    // Reference the comments collection for the specific post
    const commentsRef = db
      .collection("comments")
      .doc(postId)
      .collection("comments");

    // Retrieve all comments for the post and count them
    commentsRef
      .get()
      .then((querySnapshot) => {
        const count = querySnapshot.size;
        setCommentCount(count);
      })
      .catch((error) => {
        console.error("Error getting comments: ", error);
      });
  }, [postId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!postData?.postImage & !postData) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Head>
        <title>Coolbook</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=1, maximum-scale=1"
        />
      </Head>
      {postData?.postImage ? (
        <div className="flex flex-col h-screen lg:overflow-hidden lg:flex-row">
          {/* Left column */}
          <div className="flex-1 flex flex-col justify-start items-center lg:justify-center shadow-md py-10 lg:h-screen">
            {postData?.postImage && (
              <>
                <Image
                  src={postData.postImage}
                  alt="/"
                  width={500}
                  height={300}
                  layout="cover"
                />
                <div className="absolute top-0 left-0 mt-4 ml-4">
                  <ArrowLeftIcon
                    height={30}
                    width={30}
                    className="md:mt-4 md:ml-4 cursor-pointer"
                    onClick={handleMain}
                  />
                </div>
              </>
            )}
          </div>

          {/* Right column */}
          <div className="flex lg:flex-none justify-center lg:justify-normal items-center lg:items-start shadow-md lg:w-80">
            <div className="w-[700px] h-screen lg:overflow-scroll">
              <div className="border-b">
                <div className="flex flex-col p-3 justify-center">
                  <div className="flex space-x-2">
                    <div className="">
                      {postData && (
                        <Image
                          className="rounded-full cursor-pointer"
                          src={postData.image}
                          width={50}
                          height={50}
                          layout="fixed"
                          alt=""
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      {postData ? (
                        <p className="font-medium">{postData.name}</p>
                      ) : (
                        <p className="font-medium">Loading...</p>
                      )}
                      {postData?.timestamp ? (
                        <p className="text-xs text-gray-400 dark:text-gray-300">
                          {new Date(postData.timestamp?.toDate())
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
                            .replace(/(am|pm)/i, (match) =>
                              match.toUpperCase()
                            )}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">Loading...</p>
                      )}
                    </div>
                    <DotsHorizontalIcon
                      width={20}
                      height={20}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="mt-3">{getMessageText()}</div>
                </div>

                <div className="flex items-center justify-evenly py-5 border-b">
                  <div className="flex space-x-2">
                    <ThumbUpIcon
                      width={20}
                      height={20}
                      className="text-blue-500"
                    />
                    <span className="text-sm text-gray-500">{likeCount}</span>
                  </div>
                  <div className="flex space-x-2">
                    <ChatAltIcon width={20} height={20} />
                    <span className="text-sm text-gray-500">
                      {commentCount}
                    </span>
                  </div>
                  <ShareIcon width={20} height={20} />
                </div>
                <form className="flex h-12 my-4">
                  <textarea
                    className={`input-class pt-3 ${
                      commentText.trim() ? "rounded-s-full" : "rounded-full"
                    } border resize-none appearance-none bg-white flex-grow px-5 focus:outline-none dark:text-black`}
                    type="text"
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Write a comment"
                  />
                  {commentText.trim() && (
                    <button
                      onClick={handleCommentSubmit}
                      className="bg-blue-400 text-white flex justify-center items-center px-2 gap-1 text-base rounded-e-full"
                    >
                      Send <ChevronDoubleRightIcon height={15} width={15} />
                    </button>
                  )}
                </form>
              </div>
              <div className="">
                {commentsData.map((comment) => {
                  return (
                    <ShowComments
                      key={comment.id}
                      commentId={comment.id}
                      postId={comment.postId || comment.postId}
                      name={comment.name}
                      email={comment.email}
                      text={comment.text}
                      timestamp={comment.timestamp}
                      image={comment.image}
                      commentCount={commentCount}
                      setCommentCount={setCommentCount}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex lg:flex-none justify-center items-center shadow-md">
          <div className="w-[700px] h-screen lg:overflow-scroll">
            <div className="border-b">
            <div className="absolute top-0 left-0 mt-4 ml-4">
                  <ArrowLeftIcon
                    height={30}
                    width={30}
                    className="md:mt-4 md:ml-4 cursor-pointer"
                    onClick={handleMain}
                  />
                </div>
              <div className="flex flex-col p-3 justify-center">
                <div className="flex space-x-2">
                  <div className="">
                    {postData && (
                      <Image
                        className="rounded-full cursor-pointer"
                        src={postData.image}
                        width={50}
                        height={50}
                        layout="fixed"
                        alt=""
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    {postData ? (
                      <p className="font-medium">{postData.name}</p>
                    ) : (
                      <p className="font-medium">Loading...</p>
                    )}
                    {postData?.timestamp ? (
                      <p className="text-xs text-gray-400 dark:text-gray-300">
                        {new Date(postData.timestamp?.toDate())
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
                  <DotsHorizontalIcon
                    width={20}
                    height={20}
                    className="cursor-pointer"
                  />
                </div>
                <div className="mt-3">{getMessageText()}</div>
              </div>

              <div className="flex items-center justify-evenly py-5 border-b">
                <div className="flex space-x-2">
                  <ThumbUpIcon
                    width={20}
                    height={20}
                    className="text-blue-500"
                  />
                  <span className="text-sm text-gray-500">{likeCount}</span>
                </div>
                <div className="flex space-x-2">
                  <ChatAltIcon width={20} height={20} />
                  <span className="text-sm text-gray-500">{commentCount}</span>
                </div>
                <ShareIcon width={20} height={20} />
              </div>
              <form className="flex h-12 my-4">
                <textarea
                  className={`input-class pt-3 ${
                    commentText.trim() ? "rounded-s-full" : "rounded-full"
                  } border resize-none appearance-none bg-white flex-grow px-5 focus:outline-none dark:text-black`}
                  type="text"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Write a comment"
                />
                {commentText.trim() && (
                  <button
                    onClick={handleCommentSubmit}
                    className="bg-blue-400 text-white flex justify-center items-center px-2 gap-1 text-base rounded-e-full"
                  >
                    Send <ChevronDoubleRightIcon height={15} width={15} />
                  </button>
                )}
              </form>
            </div>
            <div className="">
              {commentsData.map((comment) => {
                return (
                  <ShowComments
                    key={comment.id}
                    commentId={comment.id}
                    postId={comment.postId || comment.postId}
                    name={comment.name}
                    email={comment.email}
                    text={comment.text}
                    timestamp={comment.timestamp}
                    image={comment.image}
                    commentCount={commentCount}
                    setCommentCount={setCommentCount}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageComment;
