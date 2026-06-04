import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const loginUser = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      if (!token) {
        navigate("/");
        return;
      }
      localStorage.setItem("token", token);

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const user = response.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        if (user.role === "Admin") {
          navigate("/admin-dashboard");
        } 
        else {
          navigate("/dashboard");
        }
      } 
      catch (error) {
        console.error("Error fetching user data: ", error);
        navigate("/");
      }
    };
    loginUser();
  }, [navigate]);
  return <h2>Auth success.. Loading..</h2>;
}

export default AuthSuccess;