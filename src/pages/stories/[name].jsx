import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../../firebase";
import Stories from "react-insta-stories";
import { useRouter } from "next/router";
import { useEffect, useContext } from "react";
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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const storiesData = stories.docs.map((story) => {
    const data = story.data();
    return {
      url: data.postImage || data.postVideo,
      type: data.postImage ? "image" : "video",
    };
  });

  const handleMain = () => {
    router.replace("/");
  };

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
              width="30"
              height="30"
              className="mt-4 ml-4 cursor-pointer"
              onClick={handleMain}
            />
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-center h-screen">
              <div className="relative w-full max-w-sm mx-auto">
                {storiesData.length > 0 ? (
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
                    // Add the following prop:
                    onAllStoriesEnd={handleMain}
                    // Add the following prop:
                    onStoryClose={handleMain}
                  />
                ) : (
                  <p className="text-center">No stories available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoriesPage;
