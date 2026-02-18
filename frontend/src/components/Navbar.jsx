import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";  

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser } from '@fortawesome/free-regular-svg-icons'



function Navbar() {

  const { token, logout, user } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);        
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">

        <Link className="navbar-brand" to="/">
          JVVG Store
        </Link>

        {user && (
          <span className="text-white me-3 mt-auto">
            Hello, {user.username}
          </span>
        )}


        <div className="d-flex ms-auto align-items-center">

          <Link className="nav-link text-white" to="/">Home</Link>
          &nbsp;

          <Link className="nav-link text-white" to="/products">Products</Link>
          &nbsp;

          {/* Cart with badge */}
          <Link
            className="nav-link text-white position-relative"
            to="/cart"
          >
            Cart

            {cartCount > 0 && token && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{fontSize:"10px"}}
              >
                {cartCount}
              </span>
            )}
          </Link>
          &nbsp;

          {token ? (
            <>
              <button className="btn btn-danger ms-2" onClick={handleLogout}>
                Logout
              </button>
              <div
                className="rounded-circle bg-light text-primary d-flex align-items-center justify-content-center ms-3"
                style={{ width: "35px", height: "35px", cursor: "pointer", fontWeight:"bold"}}
                onClick={() => navigate("/profile")}
              >
                <FontAwesomeIcon icon={faCircleUser} />
              </div>
            </>
          ) : (
            <Link className="btn btn-success ms-2" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
