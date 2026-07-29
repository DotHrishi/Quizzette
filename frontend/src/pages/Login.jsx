import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // If redirected from a protected route, go back there after login
  const from = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await toast.promise(
        axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
        }),
        {
          loading: "Logging in...",
          success: "Login successful!",
          error: "Email or Password is incorrect!",
        }
      );

      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("authChange"));
      setMessage(res.data.message);
      navigate(from, { replace: true });
    } catch (error) {
      setMessage("Email or Password is incorrect!");
    }
  };

  return (
    <>
    <Navbar />
    <div className="flex flex-col w-full h-full">
      <div
        style={{
          background: "white",
          backgroundImage: `
        radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.2) 1px, transparent 0),
        radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.18) 1px, transparent 0),
        radial-gradient(circle at 1px 1px, rgba(236, 72, 153, 0.15) 1px, transparent 0)
      `,
          backgroundSize: "20px 20px, 30px 30px, 25px 25px",
          backgroundPosition: "0 0, 10px 10px, 15px 5px",
        }}
      >
        <div class="lg:col-span-2 w-full p-8 max-w-lg mx-auto bg-black m-20 border border-blue-600 border-r-8 border-b-8">
          <form onSubmit={handleSubmit}>
            <div class="mb-8">
              <h1 class="text-white text-2xl font-bold">Login</h1>
            </div>

            <div class="space-y-6">
              <div>
                <label class="text-white text-sm font-medium mb-2 block">
                  Email Id
                </label>
                <div class="relative flex items-center">
                  <input
                    name="email"
                    type="email"
                    onChange={handleChange}
                    value={formData.email}
                    required
                    class="text-slate-900 bg-white border border-gray-300 w-full text-sm pl-4 pr-8 py-2.5 rounded-md outline-blue-500"
                    placeholder="Enter email"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#bbb"
                    stroke="#bbb"
                    class="w-4 h-4 absolute right-4"
                    viewBox="0 0 682.667 682.667"
                  >
                    <defs>
                      <clipPath id="a" clipPathUnits="userSpaceOnUse">
                        <path
                          d="M0 512h512V0H0Z"
                          data-original="#000000"
                        ></path>
                      </clipPath>
                    </defs>
                    <g
                      clip-path="url(#a)"
                      transform="matrix(1.33 0 0 -1.33 0 682.667)"
                    >
                      <path
                        fill="none"
                        stroke-miterlimit="10"
                        stroke-width="40"
                        d="M452 444H60c-22.091 0-40-17.909-40-40v-39.446l212.127-157.782c14.17-10.54 33.576-10.54 47.746 0L492 364.554V404c0 22.091-17.909 40-40 40Z"
                        data-original="#000000"
                      ></path>
                      <path
                        d="M472 274.9V107.999c0-11.027-8.972-20-20-20H60c-11.028 0-20 8.973-20 20V274.9L0 304.652V107.999c0-33.084 26.916-60 60-60h392c33.084 0 60 26.916 60 60v196.653Z"
                        data-original="#000000"
                      ></path>
                    </g>
                  </svg>
                </div>
              </div>
              <div></div>
              <div>
                <label class="text-white text-sm font-medium mb-2 block">
                  Password
                </label>
                <div class="relative flex items-center">
                  <input
                    name="password"
                    type="password"
                    onChange={handleChange}
                    value={formData.password}
                    required
                    class="text-slate-900 bg-white border border-gray-300 w-full text-sm pl-4 pr-8 py-2.5 rounded-md outline-blue-500"
                    placeholder="Enter password"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#bbb"
                    stroke="#bbb"
                    class="w-4 h-4 absolute right-4 cursor-pointer"
                    viewBox="0 0 128 128"
                  >
                    <path
                      d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                      data-original="#000000"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            <div class="mt-8">
              <button
                type="submit"
                class="px-6 py-2.5 rounded-md text-white text-sm cursor-pointer font-semibold tracking-wide border-0 outline-0 bg-gradient-to-l from-[#1aff00] via-[#03f] to-[#c0f] transition-all duration-300 ease-in-out hover:saturate-200 hover:scale-105 hover:shadow-lg w-full"
              >
                Log In
              </button>
            </div>

            {message && (
              <p className="text-green-400 mt-4 text-center">{message}</p>
            )}

            <p className="text-[#b300ff] text-sm mt-6 text-center">
              Don't have an account yet?{" "}
              <a
                href="/signup"
                className="text-blue-600 font-medium hover:underline ml-1"
              >
                Register here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default Login;
