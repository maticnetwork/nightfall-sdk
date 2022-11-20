import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const userAddress = localStorage.getItem("userAddress");
  const truncateHex = (hex) => {
    const first = hex.slice(0, 6);
    const last = hex.slice(-4);
    const concat = first + "...." + last;
    return concat;
  };
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-light mb-5">
        <div className="container-fluid">
          <a className="navbar-brand" href="">
            <img
              src="https://polygon.technology/_nuxt/img/nightfall.03d98e7.svg"
              alt="Logo"
              width="40"
              height="30"
              className="d-inline-block align-text-top"
            />
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarTogglerDemo02"
            aria-controls="navbarTogglerDemo02"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/" className="styled-link">
                  <a className="nav-link">Demo</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/about" className="styled-link">
                  <a className="nav-link">Use Cases</a>
                </Link>
              </li>
              <li className="nav-item">
                <Link></Link>
                <a
                  className="nav-link"
                  target="_blank"
                  href="https://wiki.polygon.technology/docs/nightfall/introduction/overview/"
                >
                  Docs
                </a>
              </li>
            </ul>
            <form className="px-4">
              <button className="btn connect-wallet ml-2 wallet-address">
                {userAddress ? truncateHex(userAddress) : "Wallet Address"}
              </button>
            </form>
          </div>
        </div>
      </nav>
    </div>
  );
}
