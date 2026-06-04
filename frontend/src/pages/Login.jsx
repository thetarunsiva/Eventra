function Login() {
      const handleLogin = () => {
            window.location.href = "http://localhost:5000/api/auth/google";
      }
      return (
            <div>
                  <h2>Login Page</h2>
                  <button onClick= {handleLogin}> Login with Google </button>
            </div>
      )
};

export default Login;