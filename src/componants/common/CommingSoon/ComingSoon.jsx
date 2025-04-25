import React, { useEffect, useState } from "react";

const ComingSoon = () => {
  const [animationClass, setAnimationClass] = useState("animate-float");

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationClass("animate-bounce");
    }, 5000); // Change the animation every 5 seconds

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  return (
    <div className="h-[70vh] flex items-center justify-center px-4 overflow-hidden">
      <div
        className={`relative bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-10 w-full max-w-2xl text-center text-white transform transition-all duration-500 ${animationClass}`}
      >
        {/* Heading with Emojis */}
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-blue-400 animate-slideInUp text-shadow-lg">
          🚀 Something Exciting is Coming Soon! 🎁
        </h1>

        {/* Emoji-Based Fun Message */}
        <p className="text-lg md:text-xl mb-6 text-gray-900 dark:text-gray-100 leading-relaxed animate-slideInUp text-shadow-md">
          Hang tight! We're preparing something amazing just for you. Stay
          tuned, you won’t want to miss it! 🌟
        </p>

        {/* Fun Waiting Animation with Emojis */}
        <div className="animate-pulse text-md md:text-lg text-gray-900 dark:text-gray-100 opacity-80 mt-4 text-shadow-sm">
          ⏳ The magic is brewing... ✨ Stay tuned! 🍿
        </div>

        {/* Glowing Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-400 to-blue-500 opacity-30 animate-glow"></div>

        {/* Inner Glow Shadow */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-purple-300 to-blue-300 opacity-40 blur-xl shadow-inner"></div>
      </div>
    </div>
  );
};

export default ComingSoon;
