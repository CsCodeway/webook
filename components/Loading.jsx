import Head from "next/head";

const Loading = () => {
  return (
    <>
      <Head>
        <title>Loading...</title>
        <meta name="description" content="webook" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=1, maximum-scale=1"
        />
      </Head>
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="h-[100px] w-[100px] rounded-[200px] border-[3px] border-t-[#efefef] border-b-[#0b3142] animate-spin"></div>
      </div>
    </>
  );
};
export default Loading;
