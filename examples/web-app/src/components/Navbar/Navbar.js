import React from "react";

export default function Navbar() {
  return (
    <div>
      <nav class="navbar navbar-expand-lg bg-light mb-5">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">
            <img
              src="https://polygon.technology/_nuxt/img/nightfall.03d98e7.svg"
              alt="Logo"
              width="40"
              height="30"
              class="d-inline-block align-text-top"
            />
          </a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarTogglerDemo02"
            aria-controls="navbarTogglerDemo02"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="#">
                  Demo
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">
                  Use Cases
                </a>
              </li>
              <li class="nav-item">
                <a
                  class="nav-link"
                  target="_blank"
                  href="https://wiki.polygon.technology/docs/nightfall/introduction/overview/"
                >
                  Docs
                </a>
              </li>
            </ul>
            <form class="px-4">
              <button class="btn btn-outline-success ml-2" type="submit">
                Wallet address
              </button>
            </form>
          </div>
        </div>
      </nav>
    </div>
  );
}
