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
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", flexDirection:"column" }}>
                  <h1>Eventra</h1>
                  <h3>Never miss out on important Event updates anymore..</h3>
                  <button onClick= {handleLogin} style={{ padding: "10px 20px", border:"1px solid #ccc", borderRadius:"6px", cursor: "pointer"}}> Login with Google </button>
                  
                  <div style={{ display: "flex", gap: "15px" }}>
                        <button onClick={() => handleDemoLogin("User")} style={{ padding: "10px 20px", border:"1px solid #ccc", borderRadius:"6px", cursor: "pointer"}}> Demo Login as User </button>
                        <button onClick={() => handleDemoLogin("Admin")} style={{ padding: "10px 20px", border:"1px solid #ccc", borderRadius:"6px", cursor: "pointer"}}> Demo Login as Admin </button>
                  </div>
            </div>
      )
};

export default Login;