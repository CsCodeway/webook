import { useEffect } from "react";
import Head from "next/head";
import Header from "../../components/Header";
import { getSession } from "next-auth/react";
import Sidebar from "../../components/Sidebar";
import Feed from "../../components/Feed";
import Widgets from "../../components/Widgets";
import { db } from "../../firebase";
import Login from "./Login";
import { useRouter } from "next/router";

export default function Home({ session, posts, story }) {
  const router = useRouter();
  useEffect(() => {
    // Fetch session on the client-side
    getSession().then((res) => {
      if (!res) {
        router.replace("/")
      }
    });
  }, []);

  if (!session) return <Login />;

  return (
    <div className="h-screen bg-gray-100 overflow-hidden dark:bg-gray-800 dark:text-white">
      <Head>
        <title>Coolbook</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=1, maximum-scale=1"
        />
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
  //get the user session
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
