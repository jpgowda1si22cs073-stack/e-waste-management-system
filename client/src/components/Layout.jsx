import React from 'react';
import ChatBot from './chatbot/ChatBot';

const Layout = ({ children }) => {
    return (
        <>
            {children}
            <ChatBot />
        </>
    );
};

export default Layout;
