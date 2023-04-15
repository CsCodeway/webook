import Image from "next/image";

const Contact = ({ src, name }) => {
  return (
    <a href="https://cscodeway.vercel.app" target="_CsCodeway">
      <div className="flex items-center space-x-3 mb-2 relative hover:bg-gray-200 cursor-pointer p-2 rounded-xl dark:hover:bg-blue-700">
        <Image
          className="rounded-full h-14 w-14"
          objectFit="cover"
          src={src}
          width={50}
          height={50}
          layout="fixed"
          alt="/"
        />
        <div className="absolute bottom-2 left-7 bg-green-400 h-3 w-3 rounded-full animate-bounce"></div>
        <div className="flex flex-col items-center justify-center">
          <p className="font-medium text-lg">{name}</p>
          <p className="text-sm">(`CsCodeway`)</p>
        </div>
      </div>
    </a>
  );
};
export default Contact;
