import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebase";
import Post from "./Post";
import { useSession } from "next-auth/react";

const Posts = ({ posts }) => {
  const { data: session, loading } = useSession();
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
                postId={post.data().postId}
                name={post.data().name}
                message={post.data().message}
                timestamp={post.data().timestamp}
                image={post.data().image}
                postImage={post.data().postImage}
                currentUser={session ? session.user : null}
              />
            );
          })
        : posts.map((post) => {
            return (
              <Post
                key={post.id}
                postId={post.postId}
                name={post.name}
                message={post.message}
                timestamp={post.timestamp}
                image={post.image}
                postImage={post.postImage}
                currentUser={session ? session.user : null}
              />
            );
          })}
    </>
  );
};

export default Posts;
