import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
      const navigate = useNavigate();
      useEffect(() => {
            const token = localStorage.getItem("token");
            if (token) {
                  const user = JSON.parse(localStorage.getItem("user"));
                  if (user?.role === "Admin") {
                        navigate("/admin-dashboard");
                  }
                  else {
                        navigate("/dashboard");
                  }
            }
      }, [navigate]);

      const handleLogin = () => {
            window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
      }

      const handleDemoLogin = async (role) => {
            try {
                  const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/demo-login`, { role });
                  localStorage.setItem("token", response.data.token);
                  if (role === "Admin") {
                        navigate("/admin-dashboard");
                  }
                  else {
                        navigate("/dashboard");
                  }
            }
            catch (error) {
                  console.error("Demo login failed: ", error.message);
            }
      }
      return (
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                  {/* Main Content */}
                  <div style={{ flex: 1, display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column", gap: "18px", padding: "0 16px" }}>
                        <h1 style={{ fontSize: "4rem", marginBottom: "14px", fontWeight: "700", fontFamily: "Outfit, sans-serif", textShadow: "3px 3px 0px rgba(0,0,0,0.15)" }}>
                              Eventra
                        </h1>
                        <h3 style={{ color: "#5C4A40", fontWeight: "normal", marginBottom: "8px", textAlign: "center", maxWidth: "500px", lineHeight: "1.6" }}>Turn college email clutter into your next opportunity</h3>
                        <button onClick= {handleLogin} style={{ padding: "13px 30px", background: "#2D1B12", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "15px", fontWeight: "600", marginTop: "6px", boxShadow: "0 6px 20px rgba(45, 27, 18, 0.15)" }}> 
                              Continue with Google 
                        </button>
                        <p style={{ color: "#999", margin: "4px 0", fontSize: "12px", fontWeight: "500" }}>or Explore with a Demo</p>
                        <div style={{ display: "flex", gap: "12px" }}>
                              <button onClick={() => handleDemoLogin("User")} style={{ padding: "11px 22px", background: "#fff8f4", border: "1px solid #e5d6cc", borderRadius: "12px", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#2D1B12", boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)" }}> Demo User </button>
                              <button onClick={() => handleDemoLogin("Admin")} style={{ padding: "11px 22px", background: "#fff8f4", border: "1px solid #e5d6cc", borderRadius: "12px", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#2D1B12", boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)" }}> Demo Admin </button>
                        </div>
                  </div>

                  <footer style={{ borderTop: "1px solid #eadfd8", background: "#fff8f4", padding: "20px 16px", textAlign: "center" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#5C4A40", fontWeight: "500" }}>
                              Built from scratch to solve a real problem
                        </p>
                        <div style={{ display: "flex", justifyContent: "center", gap: "16px", fontSize: "13px" }}>
                              <a href="https://github.com/thetarunsiva/Eventra" target="_blank" rel="noopener noreferrer" style={{ color: "#2D1B12", textDecoration: "none", fontWeight: "500", cursor: "pointer" }}>
                                    GitHub
                              </a>
                              <span style={{ color: "#ccc" }}>•</span>
                              <a href="https://github.com/thetarunsiva/Eventra#Live-demo" target="_blank" rel="noopener noreferrer" style={{ color: "#2D1B12", textDecoration: "none", fontWeight: "500", cursor: "pointer" }}>
                                    Getting Started
                              </a>
                              <span style={{ color: "#ccc" }}>•</span>
                              <a href="https://github.com/thetarunsiva/Eventra/issues" target="_blank" rel="noopener noreferrer" style={{ color: "#2D1B12", textDecoration: "none", fontWeight: "500", cursor: "pointer" }}>
                                    Contribute
                              </a>
                        </div>
                  </footer>
            </div>
      )
};

export default Login;