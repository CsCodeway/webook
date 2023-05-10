import Head from "next/head";
import Header from "../../components/Header";
import { getSession } from "next-auth/react";
// import Login from "./Login";
import Sidebar from "../../components/Sidebar";
import Feed from "../../components/Feed";
import Widgets from "../../components/Widgets";
import { db } from "../../firebase";
import Login from "./Login";
export default function Home({ session, posts, story }) {

  if (!session) return <Login />;

  return (
    <div className="h-screen bg-gray-100 overflow-hidden dark:bg-gray-800 dark:text-white">
      <Head>
        <title>Coolbook</title>
      </Head>
      <Header />
      <main className="flex">
        <Sidebar />
        <Feed posts={posts} story={story} />
        <Widgets />
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  //get the user
  const session = await getSession(context);

  const posts = await db.collection("posts").orderBy("timestamp", "desc").get();
  const story = await db.collection("story").orderBy("timestamp", "desc").get();

  const docs = posts.docs.map((post) => ({
    id: post.id,
    ...post.data(),
    timestamp: null,
  }));

  const storydocs = story.docs.map((store) => ({
    id: store.id,
    ...store.data(),
    timestamp: null,
  }));

  return {
    props: {
      session,
      posts: docs,
      story: storydocs,
    },
  };
}
