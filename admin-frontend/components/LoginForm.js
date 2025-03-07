import { useState } from "react";
import axiosInstance from "./AxiosInstance";

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/auth/admin/login", { email, password });
      const { access_token } = response.data;
    
      localStorage.setItem("token", access_token);
      onLoginSuccess(access_token);
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="bg-bgGray w-screen h-screen flex items-center">
      <h1 className="text-3xl font-bold mb-4 w-1/2">System Admin: Second Chance</h1>
      <div className="text-center w-full">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl mb-4">Login</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <button type="submit" className="bg-primary text-white p-2 px-4 rounded-lg">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}