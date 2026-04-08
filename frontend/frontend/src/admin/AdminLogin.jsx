import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/admin";
import { FiLogIn } from "react-icons/fi";
import logo from "../assets/matat-logo-new1.svg";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // handle login form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await loginAdmin(email, password);

    if (result && result.data?.accessToken) {
      navigate("/matat-admin");
    } else {
      setError("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* login card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            {/* company logo */}
            <img src={logo} alt="Matat" className="h-12 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-800 mb-1">Admin Panel</h1>
            <p className="text-gray-500 text-sm">Sign in to manage your portfolio</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@matat.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* error message */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {/* submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiLogIn size={16} />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* back to site link */}
        <p className="text-center mt-4 text-sm text-gray-400">
          <a href="/" className="hover:text-blue-600 transition-colors">&larr; Back to site</a>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
