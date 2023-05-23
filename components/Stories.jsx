import { useSession } from "next-auth/react";
import Image from "next/image";
import { PlusCircleIcon } from "@heroicons/react/outline";
import { useEffect, useRef, useState } from "react";
import { db, storage } from "../firebase";
import firebase from "firebase/compat/app";
import { useCollection } from "react-firebase-hooks/firestore";
import StoryCard from "./StoryCard";
import { useRouter } from "next/router";
import { deleteStory } from "../src/pages/api/delete-story";

const Stories = ({ story }) => {
  const { data: session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/");
    }
  }, [session, loading, router]);

  const filepickerRef = useRef(null);
  const [imageToStory, setImageToStory] = useState(null);
  const [videoToStory, setVideoToStory] = useState(null);
  const [removeTimeoutId, setRemoveTimeoutId] = useState(null);

  useEffect(() => {
    return () => {
      if (removeTimeoutId) {
        clearTimeout(removeTimeoutId);
      }
    };
  }, [removeTimeoutId]);

  const addImageToStory = (e) => {
    const reader = new FileReader();
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/mp4",
      "video/quicktime",
      "video/mkv",
    ];

    if (e.target.files[0]) {
      const fileSize = e.target.files[0].size;
      const fileType = e.target.files[0].type;

      if (allowedTypes.includes(fileType)) {
        if (fileType.startsWith("video/") && fileSize > maxVideoSize) {
          alert("Video file size is too large");
          return;
        } else if (fileSize > maxSize) {
          alert("Image file size is too large");
          return;
        }

        if (fileType.startsWith("video/")) {
          setVideoToStory(e.target.files[0]);
          setImageToStory(null); // Reset image selection
        } else {
          reader.onload = (readerEvent) => {
            setImageToStory(readerEvent.target.result);
            setVideoToStory(null); // Reset video selection
          };

          reader.readAsDataURL(e.target.files[0]);
        }
      } else {
        alert("Only JPEG, PNG, GIF, MP4, Mkv and QuickTime files are allowed");
      }
    }
  };

  const removeImage = () => {
    setImageToStory(null);
    setVideoToStory(null);
  };

  const sendPost = (e) => {
    e.preventDefault();

    if (imageToStory || videoToStory) {
      db.collection("story")
        .add({
          id: session.user.uid,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then((doc) => {
          if (imageToStory) {
            const uploadTask = storage
              .ref(`story/${doc.id}`)
              .putString(imageToStory, "data_url");

            removeImage();

            uploadTask.on(
              "state_change",
              null,
              (error) => console.error(error),
              () => {
                storage
                  .ref("story")
                  .child(doc.id)
                  .getDownloadURL()
                  .then((url) => {
                    db.collection("story").doc(doc.id).set(
                      {
                        postImage: url,
                      },
                      { merge: true }
                    );
                  });

                // Set a timestamp for the story
                const timestamp = Date.now() / 1000; // Current time in seconds

                db.collection("story").doc(doc.id).update({ timestamp });

                // Set a timeout for deleting the story after 2 minutes
                const timeoutId = setTimeout(() => {
                  deleteStory(doc.id);
                }, 120000); // 2 minutes in milliseconds

                // No need to store the timeout ID
              }
            );
          } else if (videoToStory) {
            const uploadTask = storage.ref(`story/${doc.id}`).put(videoToStory);

            removeImage();

            uploadTask.on(
              "state_change",
              null,
              (error) => console.error(error),
              () => {
                // Set a timestamp for the story
                const timestamp = Date.now() / 1000; // Current time in seconds

                db.collection("story").doc(doc.id).update({ timestamp });

                // Set a timeout for deleting the story after 2 minutes
                const timeoutId = setTimeout(() => {
                  deleteStory(doc.id);
                }, 120000); // 2 minutes in milliseconds

                // No need to store the timeout ID
              }
            );
          }
        })
        .catch((error) => {
          console.error("Error adding story:", error);
        });
    }
  };

  const [realtimePosts] = useCollection(
    db.collection("story").orderBy("timestamp", "desc")
  );

  let uniqueStories = [];

  if (realtimePosts) {
    const temp = {};
    realtimePosts.docs.forEach((story) => {
      const name = story.data().name;
      if (!temp[name]) {
        temp[name] = true;
        uniqueStories.push(story);
      }
    });
  }

  return (
    <>
      {session && session.user && (
        <div className="flex gap-[10px] mt-5 pb-5 overflow-x-scroll scrollbar-hide">
          <div className="flex flex-col justify-evenly">
            {imageToStory && !videoToStory && (
              <div
                onClick={removeImage}
                className="flex flex-col filter-none hover:brightness-110 transition duration-150 transform hover:scale-105 cursor-pointer"
              >
                <img
                  className="h-10 object-contain"
                  src={imageToStory}
                  alt="/"
                />
                <p className="text-xs text-red-500 text-center">Remove</p>
              </div>
            )}
            {videoToStory && (
              <div
                onClick={removeImage}
                className="flex flex-col filter-none hover:brightness-110 transition duration-150 transform hover:scale-105 cursor-pointer"
              >
                <video
                  className="h-10 object-contain"
                  src={URL.createObjectURL(videoToStory)}
                  alt="/"
                  controls
                />
                <p className="text-xs text-red-500 text-center">Remove</p>
              </div>
            )}
            {imageToStory && !videoToStory && (
              <button
                className="bottom-0 bg-blue-500 flex items-center justify-center w-[100%] rounded-full px-2 py-1 text-white font-medium text-base"
                type="submit"
                onClick={sendPost}
              >
                Upload
              </button>
            )}
            {videoToStory && (
              <button
                className="bottom-0 bg-blue-500 flex items-center justify-center w-[100%] rounded-full px-2 py-1 text-white font-medium text-base"
                type="submit"
                onClick={sendPost}
              >
                Upload
              </button>
            )}
          </div>

          <div
            className="relative flex items-center justify-center h-14 w-14 md:h-20 md:w-20 lg:h-56 lg:w-36 overflow-hidden p-3 transition duration-200 transform ease-in hover:scale-105 hover:animate-pulse cursor-pointer shrink-0"
            onClick={() => filepickerRef.current.click()}
          >
            <>
              <Image
                className="object-cover h-14 w-14 filter brightness-75 rounded-full lg:rounded-2xl"
                src={session.user.image}
                alt=""
                layout="fill"
              />
            </>
            <PlusCircleIcon
              height={50}
              width={50}
              className="max-lg:top-4 max-md:h-7 max-md:w-17 text-white absolute bottom-10"
            />

            <input
              ref={filepickerRef}
              type="file"
              onChange={addImageToStory}
              accept="image/*, video/*"
              hidden
            />

            <p className="hidden lg:flex text-white absolute bottom-2">
              Add Story
            </p>
          </div>

          {uniqueStories.map((story) => (
            <StoryCard
              key={story.id}
              id={story.id}
              name={story.data().name}
              timestamp={story.data().timestamp}
              image={story.data().image}
              postImage={story.data().postImage}
              postVideo={story.data().postVideo} // Add this line
            />
          ))}
        </div>
      )}
    </>
  );
};

export default Stories;
