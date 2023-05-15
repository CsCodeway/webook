import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import userDarkMode from "../../hooks/userDarkMode";
import { PostProvider } from "../../components/PostContext";
import { StoryProvider } from "../../components/StoryContext";

export default function App({ Component, pageProps }) {
  userDarkMode();
  return (
    <SessionProvider session={pageProps.session}>
      <StoryProvider>
        <PostProvider>
          <Component {...pageProps} />
        </PostProvider>
      </StoryProvider>
    </SessionProvider>
  );
}
