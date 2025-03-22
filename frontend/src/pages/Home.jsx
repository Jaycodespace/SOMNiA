import { Link } from "react-router-dom";
import "../styles/Home.css"; 

function Home() {
  return (
    <div className="home-container">
      <h1 className="main-title">SOMNIA</h1>
      <div className="home-buttons">
        <Link to="/login" className="btn btn-secondary">Login</Link>
        <Link to="/register" className="btn btn-primary">Sign up</Link>
      </div>
    </div>
  );
}

export default Home;
