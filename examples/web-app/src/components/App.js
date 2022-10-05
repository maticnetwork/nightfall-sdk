import React, { useState, useEffect } from "react";
import Navbar from "./Navbar/Navbar";
import User from "./User/User";
import "bootstrap/dist/css/bootstrap.css";

export default function App() {
  //set the user in the state of the application

  return (
    <div>
      <Navbar></Navbar>
      <User></User>
    </div>
  );
}
