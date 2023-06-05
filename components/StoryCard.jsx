import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { StoryContext } from "./StoryContext";
import { useContext, useState, useRef, useEffect } from "react";
import { db, storage } from "../firebase";

const StoryCard = ({ id, name, postImage, postVideo, image }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { updateName } = useContext(StoryContext);
  const [videoVisible, setVideoVisible] = useState(false);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null); // Ref to store the timeout ID
  const [uploadTimestamp, setUploadTimestamp] = useState(0); // Store the upload timestamp

  useEffect(() => {
    // Fetch the upload timestamp from Firestore
    db.collection("story")
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const timestamp = doc.data().timestamp;
          setUploadTimestamp(timestamp); // Update the upload timestamp state
        }
      })
      .catch((error) => {
        console.error("Error fetching story timestamp:", error);
      });
  }, [id]);

  useEffect(() => {
    if (uploadTimestamp > 0) {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const elapsedTime = currentTime - uploadTimestamp; // Elapsed time since upload in seconds
      const remainingTime = 24 * 60 * 60 - elapsedTime; // Remaining time in seconds (24 hours)

      if (remainingTime > 0) {
        const timeoutId = setTimeout(() => {
          deleteStory(id); // Call the deleteStory function for the current story
        }, remainingTime * 1000); // Convert remaining time to milliseconds

        timeoutRef.current = timeoutId; // Store the timeout ID in the ref

        return () => clearTimeout(timeoutId);
      } else {
        deleteStory(id); // Delete the story immediately if remaining time is zero or negative
      }
    }
  }, [id, uploadTimestamp]);

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

  // Function to delete a story
  const deleteStory = (storyId) => {
    // Delete the story from storage
    storage
      .ref(`story/${storyId}`)
      .delete()
      .then(() => {
        // Delete the story from Firestore
        db.collection("story")
          .doc(storyId)
          .delete()
          .then(() => {
            console.log("Story deleted successfully");
          })
          .catch((error) => {
            console.error("Failed to delete story from Firestore:", error);
          });
      })
      .catch((error) => {
        console.error("Failed to delete story from storage:", error);
      });
  };

  return (
    <div
      className="relative flex items-center justify-center h-36 w-24 md:h-44 md:w-28 lg:h-56 lg:w-36 overflow-hidden transition duration-200 transform ease-in hover:scale-105 hover:animate-pulse cursor-pointer shrink-0"
      onClick={handleNavigation}
    >
      <Image
        className="absolute sm:h-10 sm:w-10 lg:h-14 lg:w-14 opacity-100 rounded-full top-2 left-1 z-50 border-[2px] border-blue-500"
        height={40}
        width={40}
        src={image}
        alt=""
        layout="fixed"
        objectFit="cover"
      />
      {postImage && (
        <Image
          className="object-cover h-36 w-24 md:h-44 md:w-28 lg:h-56 lg:w-36 filter brightness-75 rounded-2xl"
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
              className="object-cover h-36 w-24 md:h-44 md:w-28 lg:h-56 lg:w-36 filter brightness-75 rounded-2xl"
              src={postVideo}
              alt=""
              layout="fill"
              onClick={toggleVideoPlayback}
              ref={videoRef}
            />
          ) : (
            <img
              src={postImage}
              alt="Video Thumbnail"
              className="object-cover h-36 w-24 md:h-44 md:w-28 lg:h-56 lg:w-36 filter brightness-75 rounded-2xl"
            />
          )}
        </div>
      )}

      <p className="text-white absolute bottom-1 text-sm sm:text-[14px] md:text-base font-medium">
        {session.user.name === name ? "Your Story" : name}
      </p>
    </div>
  );
};

export default StoryCard;
