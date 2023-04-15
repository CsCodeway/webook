import { useSession } from "next-auth/react";
import StoryCard from "./StoryCard";
import Image from "next/image";
import { PlusCircleIcon } from "@heroicons/react/outline";


const stories = [
  {
    name: "Sonny Sangha",
    src: "/../public/assets/elon.jpg",
    profile: "/../public/assets/elon1.jpg",
  },
  {
    name: "Elon Musk",
    src: "/../public/assets/mark.jpg",
    profile: "/../public/assets/mark1.jpg",
  },
  {
    name: "Jeff Bezoz",
    src: "/../public/assets/tata.jpg",
    profile: "/../public/assets/tata1.jpg",
  },
  {
    name: "Elon Musk",
    src: "/../public/assets/mark.jpg",
    profile: "/../public/assets/mark1.jpg",
  },
  {
    name: "Jeff Bezoz",
    src: "/../public/assets/tata.jpg",
    profile: "/../public/assets/tata1.jpg",
  },
  {
    name: "Elon Musk",
    src: "/../public/assets/mark.jpg",
    profile: "/../public/assets/mark1.jpg",
  },
  {
    name: "Jeff Bezoz",
    src: "/../public/assets/tata.jpg",
    profile: "/../public/assets/tata1.jpg",
  },
];

const Stories = () => {
  const {data: session} = useSession();
  return (
    <div className="flex gap-[10px] mt-5 pb-5 overflow-x-scroll scrollbar-hide">
    <div className="relative flex items-center justify-center h-14 w-14 md:h-20 md:w-20 lg:h-56 lg:w-36 overflow-hidden p-3 transition duration-200 transform ease-in hover:scale-105 hover:animate-pulse cursor-pointer shrink-0">
      <Image
        className="absolute h-14 w-14 opacity-0 lg:opacity-100 rounded-full top-2 left-1 z-50"
        height={40}
        width={40}
        src={session.user.image}
        alt=""
        layout="fixed"
        objectFit="cover"
      />
      <Image
        className="object-cover h-14 w-14 filter brightness-75 rounded-full lg:rounded-2xl"
        src={session.user.image}
        alt=""
        layout="fill"
      />
      <PlusCircleIcon height={50} width={50} className="hidden lg:flex text-white absolute bottom-10" />

      <p className="hidden lg:flex text-white absolute bottom-2">Add Story</p>

    
    </div>
      {stories.map((story) => {
        return (
          <StoryCard
            key={story.src}
            name={story.name}
            src={story.src}
            profile={story.profile}
          />
        );
      })}
    </div>
  );
};
export default Stories;
