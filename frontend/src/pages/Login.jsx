import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
      return (
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", flexDirection:"column" }}>
                  <h1>Eventra</h1>
                  <h3>Never miss out on important Event updates anymore..</h3>
                  <button onClick= {handleLogin}> Login with Google </button>
            </div>
      )
};

export default Login;