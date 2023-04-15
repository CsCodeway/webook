import { ChatAltIcon, DotsVerticalIcon, ShareIcon, ThumbUpIcon } from "@heroicons/react/outline";
import Image from "next/image";

const Post = ({ name, message, postImage, image, timestamp }) => {
  return (
    <div className="flex flex-col">
      <div className="p-5 bg-white dark:bg-gray-900 mt-5 rounded-t-2xl shadow-sm">
        <div className="flex items-center space-x-2">
          <img
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
          <DotsVerticalIcon height={25} width={22} className="text-gray-500 cursor-pointer" />
        </div>
        <p className="pt-4">{message}</p>
      </div>
      {postImage && (
        <div className="relative h-56 md:h-96 cursor-pointer bg-white dark:bg-gray-900">
          <Image src={postImage} className="dark:bg-gray-300" objectFit="cover" alt="/" layout="fill" />
        </div>
      )}

      {/* footer of post */}

      <div className="flex justify-between items-center rounded-b-2xl bg-white dark:bg-gray-900 dark:text-gray-300 shadow-md text-gray-400 border-t dark:border-t-0">
        <div className="dark:hover:bg-blue-600 hover:text-gray-300 inputIcon rounded-none rounded-bl-2xl">
          <ThumbUpIcon className="h-4" />
          <p className="text-xs sm:text-base">Like</p>
        </div>

        <div className="dark:hover:bg-blue-600 hover:text-gray-300 inputIcon rounded-none">
          <ChatAltIcon className="h-4" />
          <p className="text-xs sm:text-base">Comment</p>
        </div>

        <div className="dark:hover:bg-blue-600 hover:text-gray-300 inputIcon rounded-none rounded-br-2xl">
          <ShareIcon className="h-4" />
          <p className="text-xs sm:text-base">Share</p>
        </div>
      </div>
    </div>
  );
};
export default Post;
