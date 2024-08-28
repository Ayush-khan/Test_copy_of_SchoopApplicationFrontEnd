import { ThreeCircles } from "react-loader-spinner";

const Loader = () => (
  <div className="flex justify-center items-center h-full">
    <ThreeCircles
      visible={true}
      height="100"
      width="100"
      color="#4fa94d"
      ariaLabel="three-circles-loading"
      wrapperStyle={{}}
      wrapperClass=""
    />
  </div>
);

export default Loader;
