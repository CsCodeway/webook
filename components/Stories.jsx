import { useSession } from "next-auth/react";
import Image from "next/image";
import { PlusCircleIcon } from "@heroicons/react/outline";
import { useRef, useState } from "react";
import { db, storage } from "../firebase";
import firebase from "firebase/compat/app";
import { useCollection } from "react-firebase-hooks/firestore";
import StoryCard from "./StoryCard";

const Stories = ({ story }) => {
  const { data: session } = useSession();
  const filepickerRef = useRef(null);
  const [imageToPost, setimageToPost] = useState(null);

  const addimageToPost = (e) => {
    const reader = new FileReader();
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  
    if (e.target.files[0]) {
      const fileSize = e.target.files[0].size;
      const fileType = e.target.files[0].type;
  
      if (fileSize > maxSize) {
        alert("File size is too large");
        return;
      }
  
      if (!allowedTypes.includes(fileType)) {
        alert("Only JPEG, PNG, and GIF files are allowed");
        return;
      }
  
      reader.readAsDataURL(e.target.files[0]);
    }
  
    reader.onload = (readerEvent) => {
      setimageToPost(readerEvent.target.result);
    };
  };
  

  const removeImage = () => {
    setimageToPost(null);
  };

  const sendPost = (e) => {
    e.preventDefault();

    db.collection("story")
      .add({
        id: session.user.uid,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((doc) => {
        if (imageToPost) {
          const uploadTask = storage
            .ref(`story/${doc.id}`)
            .putString(imageToPost, "data_url");

          removeImage();

          uploadTask.on(
            "state_change",
            null,
            (error) => console.error(error),
            () => {
              //when the upload complete
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
            }
          );
        }
      });
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
      <div className="flex gap-[10px] mt-5 pb-5 overflow-x-scroll scrollbar-hide">
        <div className="flex flex-col justify-evenly">
          {imageToPost && (
            <div
              onClick={removeImage}
              className="flex flex-col filter-none hover:brightness-110 transition duration-150 transform hover:scale-105 cursor-pointer"
            >
              <img className="h-10 object-contain" src={imageToPost} alt="/" />
              <p className="text-xs text-red-500 text-center">Remove</p>
            </div>
          )}
          {imageToPost && (
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
            onChange={addimageToPost}
            accept="image/*"
            capture="camera"
            hidden
          />
          <p className="hidden lg:flex text-white absolute bottom-2">
            Add Story
          </p>
        </div>

        {uniqueStories.map((story) => (
      <StoryCard
        key={story.id}
        name={story.data().name}
        timestamp={story.data().timestamp}
        image={story.data().image}
        postImage={story.data().postImage}
      />
    ))}
      </div>
    </>
  );
};
export default Stories;
