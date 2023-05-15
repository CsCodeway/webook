import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { StoryContext } from "./StoryContext";
import { useContext, useState, useRef } from "react";

const StoryCard = ({ name, postImage, postVideo, image }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { updateName } = useContext(StoryContext);
  const [videoVisible, setVideoVisible] = useState(false);
  const videoRef = useRef(null);

  function handleNavigation() {
    updateName(name);
    setVideoVisible(false);
    router.push(`/stories/${name}`);
  }

  function toggleVideoPlayback() {
    const videoElement = videoRef.current;
    if (videoElement && videoElement.paused) {
      videoElement.play();
    } else if (videoElement) {
      videoElement.pause();
    }
  }

  //border border-[1px solid #f5f5f5] rounded-lg
  return (
    <div
      className={`relative flex items-center justify-center h-14 w-14 md:h-20 md:w-20 lg:h-56 lg:w-36 overflow-hidden p-3 transition duration-200 transform ease-in hover:scale-105 hover:animate-pulse cursor-pointer shrink-0 ${
        postVideo ? "border border-[1px solid #f5f5f5] rounded-lg" : ""
      }`}
      onClick={handleNavigation}
    >
      <Image
        className={`absolute h-14 w-14 opacity-0 lg:opacity-100 rounded-full top-2 left-1 z-50 ${
          videoVisible ? "hidden" : ""
        }`}
        height={40}
        width={40}
        src={image}
        alt=""
        layout="fixed"
        objectFit="cover"
      />
      {postImage && (
        <Image
          className={`object-cover h-14 w-14 filter brightness-75 rounded-full lg:rounded-2xl ${
            videoVisible ? "hidden" : ""
          }`}
          src={postImage}
          alt=""
          layout="fill"
          onClick={() => setVideoVisible(true)}
        />
      )}
      {postVideo && (
        <div className="relative">
          {!videoVisible ? (
            <video
              className={`object-cover filter brightness-75 rounded-full lg:rounded-lg`}
              src={postVideo}
              alt=""
              layout="fill"
              onClick={toggleVideoPlayback}
            />
          ) : (
            <img
              src={postImage}
              alt="Video Thumbnail"
              className="object-cover h-14 w-14 filter brightness-75 rounded-full lg:rounded-none"
            />
          )}
        </div>
      )}

      <p className="hidden lg:flex font-medium text-center text-white absolute bottom-2">
        {session.user.name === name ? "Your Story" : name}
      </p>
    </div>
  );
};

export default StoryCard;
