import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Bubble from "../../components/Bubble";
import Image from "next/image";
import Illusion from "../../public/assets/main-image.png";

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
      <Head>
        <title>Login</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=1, maximum-scale=1"
        />
      </Head>
      <Bubble />
      <div className="bg-[#080710] text-white min-h-screen flex items-center justify-center">
        <div className="w-screen h-screen absolute overflow-hidden">
          <div className="bubble">
            <div className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] absolute rounded-full left-[-80px] top-[-80px] shape1"></div>
            <div className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] absolute rounded-full right-[-30px] bottom-[-80px] shape2"></div>
          </div>
        </div>

        <div className="h-[405px] w-[90vw] max-w-[300px] bg-[rgba(255,255,255,0.13)] tracking-widest rounded-lg backdrop-blur-md border-[2px] border-[rgba(255,255,255,0.1)] shadow-[(0 0 40px rgba(8,7,16,0.6))] py-[50px] px-[5%] sm:px-[35px] relative z-10">
          <div className="text-3xl font-medium text-center leading-tight mt-0">
            WeBoook
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="w-[120%] sm:w-[130%] max-w-[500px] mt-4">
              <Image src={Illusion} width="500" height="500" alt="" />
            </div>
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="absolute bottom-5 w-40 rounded px-3 py-2 bg-[rgba(255,255,255,0.27)] text-white text-center hover:bg-[rgba(255,255,255,0.47)]"
                onClick={handleSignIn}
              >
                Login with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
