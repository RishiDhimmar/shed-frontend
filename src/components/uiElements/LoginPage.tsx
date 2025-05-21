import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-[calc(100vh)]">
      <div className="w-3/4 h-full bg-gray-200">
        <img
          src="assets/login-page.png"
          alt="Building"
          className="w-full h-full object-cover"
        />
      </div>
      <div className=" flex flex-col justify-center items-center p-10">
        <div className="w-full max-w-sm">
          <img
            src="assets/resolute-logo.png"
            alt="Resolute Consultants"
            className="w-32 mb-6"
          />
          <h2 className="text-2xl font-semibold mb-4">Login</h2>
          <p className="text-gray-600 mb-6">Welcome back!</p>
          <form>
            <label className="block text-gray-700">Email ID*</label>
            <input
              type="email"
              className="w-full p-3 border rounded mb-4"
              placeholder="Enter your email"
            />
            <label className="block text-gray-700">Password*</label>
            <input
              type="password"
              className="w-full p-3 border rounded mb-2"
              placeholder="Enter your password"
            />
            <a href="#" className="text-blue-600 text-sm float-right mb-4">
              Forgot password?
            </a>
            <button
              className="w-full bg-gray-800 text-white p-3 rounded-lg cursor-pointer"
              onClick={() => navigate("/app/listView")}
            >
              Sign In
            </button>
          </form>
          <p className="mt-4 text-gray-600 text-center">
            Do not have an account?{" "}
            <a href="#" className="text-blue-600">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
