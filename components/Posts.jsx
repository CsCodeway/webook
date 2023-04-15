import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebase";
import Post from "./Post";

const Posts = ({ posts }) => {
  const [realtimePosts] = useCollection(
    db.collection("posts").orderBy("timestamp", "desc")
  );
  return (
    <>
      {realtimePosts
        ? realtimePosts?.docs.map((post) => {
            return (
              <Post
                key={post.id}
                name={post.data().name}
                message={post.data().message}
                timestamp={post.data().timestamp}
                image={post.data().image}
                postImage={post.data().postImage}
              />
            );
          })
        : posts.map((post) => {
            <Post
              key={post.id}
              name={post.name}
              message={post.message}
              timestamp={post.timestamp}
              image={post.image}
              postImage={post.postImage}
            />;
          })}
    </>
  );
};
export default Posts;
