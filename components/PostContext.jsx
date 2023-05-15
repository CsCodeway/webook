import React, { createContext, useState } from "react";

export const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [postImage, setPostImage] = useState(null);

  const updatePostImage = (image) => {
    setPostImage(image);
  };

  return (
    <PostContext.Provider value={{ postImage, updatePostImage }}>
      {children}
    </PostContext.Provider>
  );
};
