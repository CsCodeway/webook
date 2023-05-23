import { useContext, useEffect } from "react";
import { PostContext } from "../../../components/PostContext";
import Head from "next/head";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  ChatAltIcon,
  DotsHorizontalIcon,
  ShareIcon,
} from "@heroicons/react/outline";
import { ThumbUpIcon } from "@heroicons/react/solid";

const ImageComment = () => {
  const { postImage, updatePostImage } = useContext(PostContext);
  const { data: session, loading, error } = useSession();

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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!postImage) {
    return <p>No post image found.</p>;
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
      <div className="flex flex-col lg:flex-row">
        {/* Left column */}
        <div className="flex-1 flex flex-col justify-start items-center lg:justify-center shadow-md py-10 lg:h-screen">
          <Image
            src={postImage}
            alt="/"
            width={500}
            height={300}
            layout="responsive"
          />
        </div>

        {/* Right column */}
        <div className="flex lg:flex-none justify-center lg:justify-normal items-center lg:items-start shadow-md lg:w-80">
          <div className="bg-red-800 w-[700px]">
            <div className="flex p-3 items-center">
              {session && session.user && session.user.image && (
                <Image
                  className="rounded-full cursor-pointer"
                  src={session.user.image}
                  width={50}
                  height={50}
                  layout="fixed"
                  alt=""
                />
              )}
              <div className="flex-1 pl-2">
                <p className="text-white font-medium">
                  {session && session.user && session.user.name}
                </p>
                <p>{new Date().toLocaleString()}</p>
              </div>
              <DotsHorizontalIcon width={20} height={20} />
            </div>
            <div className="flex items-center justify-center">
              <ThumbUpIcon width={20} height={20} className="to-blue-500" />
              <ChatAltIcon width={20} height={20} />
              <ShareIcon width={20} height={20} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageComment;
