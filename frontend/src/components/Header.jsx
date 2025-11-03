import axios from "axios";
import Button from "./Button";
import { BiTask } from "react-icons/bi";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../redux/features/auth/authSlice";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

const logoutUser = async () => {
  const { data } = await axios.post(`${baseURL}/api/v1/user/logout`, {}, { withCredentials: true });
  return data;
};

const Header = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userinfo = useSelector((state) => state.auth.userInfo);
  const { darkMode, setDarkMode } = useTheme();

  const isLoginPage = window.location.pathname === "/login";
  const isSignupPage = window.location.pathname === "/signup";

  const mutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(logout());
      queryClient.removeQueries(["user"]);
      toast.success("Logout successful");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "An error occurred during logout"
      );
    },
  });

  return (
    <div className="bg-blue-600 dark:bg-gray-800 transition-colors duration-300">
      <div className="flex justify-between items-center text-white p-4">
        {/* Left Section */}
        <div className="flex items-center">
          <Link to={"/"}>
            <BiTask className="text-3xl mr-4" />
          </Link>
          <span className="text-xl font-semibold">Task Manager</span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {userinfo ? (
            <Button
              onClick={() => mutation.mutate()}
              className="bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Logout
            </Button>
          ) : (
            <>
              <Link to={"/login"}>
                <Button
                  className={`hover:bg-white hover:text-blue-600 rounded-md ${
                    isLoginPage ? "bg-white text-blue-600" : "text-white"
                  }`}
                >
                  Login
                </Button>
              </Link>
              <Link to={"/signup"}>
                <Button
                  className={`hover:bg-white hover:text-blue-600 rounded-md ${
                    isSignupPage ? "bg-white text-blue-600" : "text-white"
                  }`}
                >
                  Signup
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
