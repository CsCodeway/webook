import { useCollection } from "react-firebase-hooks/firestore";
import { db, storage } from "../../firebase";
import Stories from "react-insta-stories";
import { useRouter } from "next/router";

const StoriesPage = ({ name }) => {
  const [stories, loading, error] = useCollection(
    db
      .collection("story")
      .where("name", "==", name)
      .orderBy("timestamp", "desc")
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const storiesData = stories.docs.map((story) => ({
    url: story.data().postImage,
    // seeMore: () => {
    //   // You can add a link or any other action here
    //   console.log("See more clicked");
    // },
  }));

  return (
    <div className="sm:story-bg">
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-center flex-grow">
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const AllImagesPage = () => {
  const router = useRouter();
  const { name } = router.query;

  if (!name) {
    return <p>Loading...</p>;
  }

  return <StoriesPage name={name} />;
};

export default AllImagesPage;
