import { useContext } from "react";
import { PostContext } from "../../../components/PostContext";
import Head from "next/head";
import Image from "next/image";

const ImageComment = () => {
  const { postImage } = useContext(PostContext);

  if (!postImage) {
    return null; // or render a placeholder image or handle the null case
  }

  return (
    <>
      <Head>
        <title>Coolbook</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=1, maximum-scale=1"
        />
      </Head>
      <div className="flex flex-col md:flex-row">
        <div className="flex items-center justify-center w-full md:w-2/3">
          <div className="flex justify-center w-screen h-screen">
            <Image src={postImage} alt="Image" width={500} height={500} />
          </div>
        </div>
        <div className="w-full md:w-1/3 md:ml-4">
          <div className="px-4 py-2">
            <h1 className="text-2xl font-bold">Right Column Content</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sed
              ligula sed neque efficitur condimentum.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageComment;
