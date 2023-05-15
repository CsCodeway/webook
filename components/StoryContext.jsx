import React, { createContext, useState } from "react";

export const StoryContext = createContext();

export const StoryProvider = ({ children }) => {
  const [name, setName] = useState(null);

  const updateName = (name) => {
    setName(name);
  };

  return (
    <StoryContext.Provider value={{ name, updateName }}>
      {children}
    </StoryContext.Provider>
  );
};
