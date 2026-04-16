// Navbar este bara de sus a aplicației.
// Aici punem linkuri simple către paginile principale.

import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Link în React este ca <a>, dar fără reload complet de pagină */}
        <Link to="/" className="logo">
          MicroJobs
        </Link>
      </div>

      <nav className="navbar-right">
        <Link to="/" className="nav-link">
          Home
        </Link>

        <Link to="/login" className="nav-link">
          Login
        </Link>

        <Link to="/register" className="nav-link">
          Register
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;