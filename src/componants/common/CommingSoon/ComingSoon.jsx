// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const ComingSoon = () => {
//   const [animationClass, setAnimationClass] = useState("animate-float");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setAnimationClass("animate-bounce");
//     }, 100);

//     return () => clearInterval(interval);
//   }, []);

//   const handleGoBack = () => {
//     navigate("/dashboard");
//     // navigate(-1);
//   };

//   return (
//     <div className="h-screen flex items-center justify-center">
//       <div
//         className={`relative bg-black/50 border border-white/40 rounded-3xl shadow-2xl p-10 w-full max-w-2xl text-center transform transition-all duration-500 ${animationClass}`}
//       >
//         {/* Glowing Backgrounds */}
//         <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-400 to-blue-500 opacity-20 blur-2xl -z-10"></div>
//         <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-purple-300 to-blue-300 opacity-30 blur-3xl -z-20"></div>

//         {/* Heading */}
//         <h1 className="text-4xl  font-extrabold mb-6 text-white animate-slideInUp drop-shadow-lg">
//           🚀 Something Exciting is Coming Soon! 🎁
//         </h1>

//         {/* Subtext */}
//         <p className="text-lg md:text-xl mb-6 text-white leading-relaxed animate-slideInUp drop-shadow-md">
//           Hang tight! We're preparing something amazing just for you. Stay
//           tuned, you won’t want to miss it! 🌟
//         </p>

//         {/* Fun Message */}
//         <div className="animate-pulse text-md md:text-lg text-white opacity-90 mt-4 drop-shadow-sm">
//           ⏳ The magic is brewing... ✨ Stay tuned! 🍿
//         </div>

//         {/* Button */}
//         <button
//           onClick={handleGoBack}
//           className="mt-6 px-6 py-3 text-[1.1em] bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-300 relative z-10 pointer-events-auto"
//         >
//           Go to Dashboard
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ComingSoon;

import { useNavigate } from "react-router-dom";

const ComingSoon = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div
        className={` relative -top-[7%]  bg-black/50 border border-white/40 rounded-3xl shadow-2xl p-10 w-full max-w-2xl text-center transform transition-all duration-500`}
      >
        {/* Glowing Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-purple-400 to-blue-500 opacity-20 blur-2xl -z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-purple-300 to-blue-300 opacity-30 blur-3xl -z-20"></div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold mb-6 text-white animate-slideInUp drop-shadow-lg">
          🚀 Something Exciting is Coming Soon! 🎁
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl mb-6 text-white leading-relaxed animate-slideInUp drop-shadow-md">
          Hang tight! We're preparing something amazing just for you. Stay
          tuned, you won’t want to miss it! 🌟
        </p>

        {/* Fun Message */}
        <div className="animate-pulse text-md md:text-lg text-white opacity-90 mt-4 drop-shadow-sm">
          ⏳ The magic is brewing... ✨ Stay tuned! 🍿
        </div>

        {/* Button */}
        <button
          onClick={handleGoBack}
          className="mt-6 px-6 py-3 text-[1.1em] bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-300 relative z-10 pointer-events-auto"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
