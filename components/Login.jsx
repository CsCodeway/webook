import Image from "next/image";
import logo from "../public/f-logo.png";
import { signIn } from "next-auth/react";

const Login = () => {
  return (
    <>
      <div className="grid place-items-center mt-10">
        <Image
        className="hover:animate-pulse"
          src={logo}
          alt="/"
          height={300}
          width={300}
          objectFit="contain"
        />
        <h1 className="text-xl mb-10 text-gray-400">F A C E B O O K</h1>
        <h1 onClick={signIn} className="p-5 bg-blue-500 text-white text-center cursor-pointer rounded-full hover:animate-pulse">
          Login with FaceBook
        </h1>
      </div>
    </>
  );
};
export default Login;
