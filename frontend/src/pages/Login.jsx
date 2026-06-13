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
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", flexDirection:"column", gap: "12px" }}>
                  <h1 style={{ fontSize: "2rem", marginBottom: "4px" }}>Eventra</h1>
                  <h3 style={{ color: "#666", fontWeight: "normal", marginBottom: "8px" }}>Never miss out on Important Event Updates anymore..</h3>
                  <button onClick= {handleLogin} style={{ padding: "10px 24px", border:"1px solid #ccc", borderRadius:"6px", cursor: "pointer", fontSize: "14px"}}> Login with Google </button>
                  <p style={{ color: "#999", margin: "4px 0", fontSize: "12px" }}>or Try a demo</p>
                  <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={() => handleDemoLogin("User")} style={{ padding: "10px 20px", border:"1px solid #ccc", borderRadius:"6px", cursor: "pointer", fontSize: "14px"}}> Demo User </button>
                        <button onClick={() => handleDemoLogin("Admin")} style={{ padding: "10px 20px", border:"1px solid #ccc", borderRadius:"6px", cursor: "pointer", fontSize: "14px"}}> Demo Admin </button>
                  </div>
            </div>
      )
};

export default Login;