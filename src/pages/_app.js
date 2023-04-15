import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import userDarkMode from "../../hooks/userDarkMode";

export default function App({ Component, pageProps }) {
  userDarkMode();
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
