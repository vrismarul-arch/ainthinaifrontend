import { message } from "antd";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
  import "./Login.css";

export default function LoginGoogle() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsEmailLoading(true);
    
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        rememberMe
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      message.success("Login successful");
      
      // Small delay to show loading state before navigation
      setTimeout(() => {
        navigate(res.data.role === "admin" ? "/admin/dashboard" : "/");
      }, 500);
    } catch (err) {
      console.error(err);
      message.error("Login failed");
      setIsEmailLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setIsGoogleLoading(true);
    
    try {
      const res = await api.post("/auth/google", {
        token: credentialResponse.credential,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      message.success("Google login successful");
      
      // Small delay to show loading state before navigation
      setTimeout(() => {
        navigate(res.data.role === "admin" ? "/admin/dashboard" : "/");
      }, 500);
    } catch (err) {
      console.error(err);
      message.error("Google login failed");
      setIsGoogleLoading(false);
    }
  };

  const handleAppleLogin = () => {
    setIsAppleLoading(true);
    // Simulate Apple login (replace with actual Apple login logic)
    setTimeout(() => {
      message.error("Apple login not implemented yet");
      setIsAppleLoading(false);
    }, 1500);
  };

  return (
    <div className="auth-container">
      {/* LEFT SIDE - Background Image */}
      <div className="auth-left">

      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="auth-right">
        <div className="onboarding-box">
          <div className="txt-center">
            <h1 className="welcome-title">Welcome back</h1>
            <p className="welcome-subtitle">Please enter your details.</p>
          </div>

         

          {/* Google Login with Loading */}
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              message.error("Google login failed");
              setIsGoogleLoading(false);
            }}
            useOneTap={false}
            render={({ onClick }) => (
              <button
                className={`custom-google-btn ${isGoogleLoading ? 'loading' : ''}`}
                onClick={() => {
                  setIsGoogleLoading(true);
                  onClick();
                }}
                type="button"
                disabled={isGoogleLoading || isEmailLoading || isAppleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <LoadingOutlined style={{ marginRight: 8 }} />
                    Signing in with Google...
                  </>
                ) : (
                  'Continue with Google'
                )}
              </button>
            )}
          />

          <p className="signup-prompt">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
}