import React from 'react';

const Footer = () => {
  const date = new Date().getFullYear();

  return (
    <footer className="border-t bg-white text-black">
      <div className="container mx-auto px-4 py-6 text-center text-sm">
        &copy; {date} <a href="https://bmtechx.in/" target="_blank" rel="noopener noreferrer" className="underline">BMtechx.in</a>. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
