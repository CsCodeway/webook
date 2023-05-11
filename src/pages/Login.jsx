import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Login = () => {
  const router = useRouter();

  const { data: session, status } = useSession();

  const handleSignIn = async () => {
    await signIn("google", {
      provider: "google",
      callbackUrl: `${window.location.origin}/`,
    });
    router.replace("/");
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  return (
    <>
    <title>Login</title>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=1, maximum-scale=1"
        />
      </Head>
      <div className="flex flex-col items-center justify-center h-screen">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="flex flex-col gap-2 text-lg shadow-lg px-14 pt-10 rounded-xl"
        >
          <p className="flex items-center justify-center text-2xl text-gray-300">
            C o o l b o o k
          </p>
          <button
            className="bg-gray-600 rounded-full text-white my-5 px-3 py-2 font-medium"
            onClick={handleSignIn}
          >
            Login with Google
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
