import { useCollection } from "react-firebase-hooks/firestore";
import { db, storage } from "../firebase";
import Post from "./Post";
import { useSession } from "next-auth/react";

const Posts = ({ posts }) => {
  const { data: session, loading } = useSession();
  const [realtimePosts] = useCollection(
    db.collection("posts").orderBy("timestamp", "desc")
  );

  const deletePost = (postId, currentUser) => {
    if (postId && currentUser) {
      db.collection("posts")
        .where("postId", "==", postId)
        .where("email", "==", currentUser.email) // Check if the post's email matches the current user's email
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const postRef = doc.ref;

            // Get the post image URL from the document data
            const postImageURL = doc.data().postImage;

            postRef.delete().then(() => {
              console.log("Post deleted successfully!");

              // Delete the post image from Firebase Storage using the URL
              if (postImageURL) {
                const imageRef = storage.refFromURL(postImageURL);
                imageRef
                  .delete()
                  // .then(() => {
                  //   console.log("Post image deleted successfully!");
                  // })
                  .catch((error) => {
                    console.error("Error deleting post image:", error);
                  });
              }
            });
          });
        })
        .catch((error) => {
          console.error("Error deleting post:", error);
        });
    } else {
      console.error("Invalid postId or currentUser provided.");
    }
  };

  return (
    <>
      {realtimePosts
        ? realtimePosts?.docs.map((post) => {
            return (
              <Post
                key={post.id}
                id={post.data().id}
                postId={post.data().postId || post.postId} // Use post.data().postId if available, otherwise fallback to post.postId
                name={post.data().name}
                email={post.data().email}
                message={post.data().message}
                timestamp={post.data().timestamp}
                image={post.data().image}
                postImage={post.data().postImage}
                currentUser={session ? session.user : null}
                deletePost={() =>
                  deletePost(
                    post.data().postId || post.postId,
                    session ? session.user : null
                  )
                }
              />
            );
          })
        : posts.map((post) => {
            return (
              <Post
                key={post.id}
                id={post.id}
                postId={post.postId}
                name={post.name}
                email={post.email}
                message={post.message}
                timestamp={post.timestamp}
                image={post.image}
                postImage={post.postImage}
                currentUser={session ? session.user : null}
                deletePost={deletePost}
              />
            );
          })}
    </>
  );
};

export default Posts;
