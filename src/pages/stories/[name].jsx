import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../../firebase";
import Stories from "react-insta-stories";
import { useRouter } from "next/router";
import { useEffect, useContext, useState } from "react";
import { useSession } from "next-auth/react";
import Loading from "../../../components/Loading";
import Head from "next/head";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import { StoryContext } from "../../../components/StoryContext";

const StoriesPage = () => {
  const { name } = useContext(StoryContext);
  const router = useRouter();
  const { data: session } = useSession();
  const [stories, loading, error] = useCollection(
    db
      .collection("story")
      .where("name", "==", name)
      .orderBy("timestamp", "desc")
  );
  const [loadingStories, setLoadingStories] = useState(true);
  const [storiesData, setStoriesData] = useState([]);

  useEffect(() => {
    if (loading === false) {
      setLoadingStories(false);
    }
  }, [loading]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Pause and remove videos before navigating away
      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        video.pause();
        video.remove();
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    return () => {
      // Pause and remove videos when the component unmounts
      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        video.pause();
        video.remove();
      });
    };
  }, []);

  const handleMain = () => {
    router.replace("/");
  };

  useEffect(() => {
    if (stories && !loading && stories.docs.length > 0) {
      const data = stories.docs.map((story) => {
        const storyData = story.data();
        return {
          url: storyData.postImage || storyData.postVideo,
          type: storyData.postImage ? "image" : "video",
        };
      });
      setStoriesData(data);
      localStorage.setItem("storiesData", JSON.stringify(data));
    } else {
      const storedStoriesData = localStorage.getItem("storiesData");
      if (storedStoriesData) {
        setStoriesData(JSON.parse(storedStoriesData));
      }
    }
  }, [stories, loading]);

  if (loading || loadingStories) {
    return <Loading />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (storiesData.length === 0) {
    return <p>No stories available.</p>;
  }

  return (
    <>
      <Head>
        <title>{session.user.name === name ? "Your Story" : name}</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=1, maximum-scale=1"
        />
      </Head>
      <div className="sm:bg-[#f5f5f5]">
        <div className="flex flex-col sm:flex-row">
          <div className="mt-1">
            <ArrowLeftIcon
              height={30}
              width={30}
              className="md:mt-4 md:ml-4 cursor-pointer"
              onClick={handleMain}
            />
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-center h-screen">
              <div className="relative w-full max-w-sm mx-auto">
                <Stories
                  stories={storiesData}
                  loop
                  keyboardNavigation
                  defaultInterval={3000}
                  className="w-full h-full absolute top-0 left-0"
                  storyStyles={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  width={360}
                  height={640}
                  onAllStoriesEnd={handleMain} 
                  onStoryClose={handleMain}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoriesPage;
