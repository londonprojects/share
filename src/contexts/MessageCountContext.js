// MessageCountContext.js
import React, { createContext, useState } from 'react';

export const MessageCountContext = createContext();

export const MessageCountProvider = ({ children }) => {
  const [messageCount, setMessageCount] = useState({
    rides: 0,
    airbnbs: 0,
    items: 0,
    experiences: 0,
  });

  return (
    <MessageCountContext.Provider value={{ messageCount, setMessageCount }}>
      {children}
    </MessageCountContext.Provider>
  );
};
