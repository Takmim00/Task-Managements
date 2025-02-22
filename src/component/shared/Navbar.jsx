import { useContext, useEffect, useState } from "react";
import { MdDarkMode, MdOutlineLightMode } from "react-icons/md";
import { Link, NavLink } from "react-router-dom";
import task from "../../assets/task.png";
import { AuthContext } from "../../provider/AuthProvider";
import "./navbar.css";

const Navbar = () => {
  const { user, logOut } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.documentElement.className =
      theme === "dark" ? "dark-theme" : "light-theme";
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  const handleLogOut = () => {
    logOut()
      .then(() => {})
      .catch((err) => console.error(err));
  };
  return (
    <div className="shadow-sm  py-2">
      <div className="  navbar w-11/12 mx-auto ">
        <div className="flex-1">
          <Link to="/" className="flex gap-2 items-center">
            <img src={task} alt="" className="h-8" />
            <p className="text-2xl font-semibold text-gray-800">Task</p>
          </Link>
        </div>
        <div className=" flex items-center">
          <div className="flex justify-end p-4">
            <button
              onClick={toggleTheme}
              className="px-3 py-3 rounded-full bg-gray-800 text-white dark:bg-gray-300 dark:text-black transition-colors"
            >
              {theme === "light" ? <MdDarkMode /> : <MdOutlineLightMode />}
            </button>
          </div>
          <ul className="flex gap-4 justify-center items-center py-2">
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            {user ? (
              <>
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar"
                  >
                    <div
                      title={user?.displayName || "Profile"}
                      className="w-10 rounded-full"
                    >
                      <img
                        referrerPolicy="no-referrer"
                        alt="User Profile"
                        src={user?.photoURL}
                      />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <button
                        onClick={handleLogOut}
                        className="btn  transition "
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="btn bg-blue-500 hover:bg-blue-700 transition text-white"
                  >
                    Log-in
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
