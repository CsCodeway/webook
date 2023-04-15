import Image from "next/image";

const StoryCard = ({ name, src, profile }) => {
  return (
    <div className="relative flex items-center justify-center h-14 w-14 md:h-20 md:w-20 lg:h-56 lg:w-36 overflow-hidden p-3 transition duration-200 transform ease-in hover:scale-105 hover:animate-pulse cursor-pointer shrink-0">
      <Image
        className="absolute h-14 w-14 opacity-0 lg:opacity-100 rounded-full top-2 left-1 z-50"
        height={40}
        width={40}
        src={src}
        alt=""
        layout="fixed"
        objectFit="cover"
      />
      <Image
        className="object-cover h-14 w-14 filter brightness-75 rounded-full lg:rounded-2xl"
        src={profile}
        alt=""
        layout="fill"
      />
      <p className="hidden lg:flex text-white absolute bottom-2">
        {name}
      </p>
    </div>
  );
};
export default StoryCard
