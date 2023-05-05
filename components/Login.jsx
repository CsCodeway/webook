import { signIn } from "next-auth/react";

const Login = () => {
  const loginUser = () => {
    
  };
  return (
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
        {/* <input
          className="h-12 mt-4 border-none outline-none"
          type="email"
          placeholder="Email"
        />
        <input
          className="h-12 border-none outline-none"
          type="password"
          placeholder="Password"
        />
        <button
          className="bg-blue-400 rounded-full mt-4 py-1 text-white font-medium"
          onClick={loginUser}
        >
          Sign In
        </button> */}
        <button
          className="bg-gray-600 rounded-full text-white my-5 px-3 py-2 font-medium"
          onClick={signIn}
        >
          Login with Google
        </button>
        {/* <p className="text-blue-500 text-sm font-bold mb-3 text-right">
          Don't have an account?Sign-up
        </p> */}
      </form>
    </div>
  );
};
export default Login;
