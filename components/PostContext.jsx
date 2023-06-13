import React, { createContext, useState } from "react";

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [postImage, setPostImage] = useState(null);
  const [postVideo, setPostVideo] = useState(null);

  const updatePostImage = (image) => {
    setPostImage(image);
  };
  const updatePostVideo = (video) => {
    setPostVideo(video);
  };

  return (
    <PostContext.Provider value={{ postImage, updatePostImage, postVideo, updatePostVideo }}>
      {children}
    </PostContext.Provider>
  );
};
