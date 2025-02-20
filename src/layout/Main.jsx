import { Outlet } from "react-router-dom";
import Navbar from "../component/shared/Navbar";

const Main = () => {
  return (
    <div>
      <div className="sticky top-0 z-50 backdrop-blur-2xl ">
        <Navbar />
      </div>
      <Outlet />
    </div>
  );
};

export default Main;
