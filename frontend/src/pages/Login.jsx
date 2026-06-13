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
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", flexDirection:"column", gap: "12px", padding: "0 16px" }}>
                  <h1 style={{ fontSize: "4rem", marginBottom: "8px", fontWeight: "700", fontFamily: "Outfit, sans-serif", textShadow: "3px 3px 0px rgba(0,0,0,0.15)" }}>
                        Eventra
                  </h1>
                  <h3 style={{ color: "#4B3A32", fontWeight: "normal", marginBottom: "8px", textAlign: "center", maxWidth: "500px", lineHeight: "1.6" }}>"Turn college email clutter into your next opportunity"</h3>
                  <button onClick= {handleLogin} style={{ padding: "10px 24px", border:"1px solid #ccc", borderRadius:"6px", cursor: "pointer", fontSize: "14px", transform: "translateY(-2px)" }}> 
                        Continue with Google 
                  </button>
                  <p style={{ color: "#999", margin: "4px 0", fontSize: "12px" }}>or Try a demo</p>
                  <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={() => handleDemoLogin("User")} style={{ padding: "10px 20px", border:"1px solid #ccc", borderRadius:"6px", cursor: "pointer", fontSize: "14px"}}> Demo User </button>
                        <button onClick={() => handleDemoLogin("Admin")} style={{ padding: "10px 20px", border:"1px solid #ccc", borderRadius:"6px", cursor: "pointer", fontSize: "14px"}}> Demo Admin </button>
                  </div>
            </div>
      )
};

export default Login;