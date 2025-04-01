import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, reset, getUserInfo } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import "../styles/Login.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = { email, password };
    dispatch(login(userData)).then(() => {
      // Navigate only after the login action is successful
      if (isSuccess && user) {
        navigate("/dashboard");
      }
    });
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(reset());
    dispatch(getUserInfo());
  }, [isError, dispatch]); // Removed isSuccess and user from dependency array

  return (
    <div className="auth__container">
      <h1 className="main__title">Login</h1>

      {isLoading && <Spinner />}

      <form className="auth__form">
        <input
          type="text"
          placeholder="Email"
          name="email"
          onChange={handleChange}
          value={email}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          onChange={handleChange}
          value={password}
          required
        />
        <Link to="/reset-password">Forgot Password?</Link>

        <button className="btn-primary" type="submit" onClick={handleSubmit}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;