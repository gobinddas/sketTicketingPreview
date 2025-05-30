import React from 'react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../Assets/SkaterHood.png';
import './Sidebar.css'; 
import { FaBars } from 'react-icons/fa';
import { RxCross1 } from "react-icons/rx";

const Sidebar = () => {
  const navigate = useNavigate();
  const [openham, setopenham] =useState(false);

  // function to open hamburger
  const handleopenhamburger =()=>{
    setopenham(true);
  }
  const handleclosehamburger =()=>{
    setopenham(false);
  }



  const handleLogout = () => {
    console.log('Logout button clicked');
  localStorage.removeItem('isAuthenticated');
  console.log('isAuthenticated removed from localStorage');
  // Force a reload of the page to ensure state change is picked up
  window.location.reload();
  };

  return (
    <>
    <div className="sidebar">
      <div className="logo box-white">
        <img src={logo} alt="Logo" />
      </div>
      <nav>
        <ul>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'active-link' : undefined)}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/active-session"
              className={({ isActive }) => (isActive ? 'active-link' : undefined)}
            >
              Active Session
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tickets-price"
              className={({ isActive }) => (isActive ? 'active-link' : undefined)}
            >
              Tickets Price
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/balance-sheet"
              className={({ isActive }) => (isActive ? 'active-link' : undefined)}
            >
              Balance Sheet
            </NavLink>
          </li>
          <li>
            <NavLink
              to="https://bijuwarsp.bluebugsoft.com/support.php"
              className={({ isActive }) => (isActive ? 'active-link' : undefined)} target='blank'
            >
              Support
            </NavLink>
          </li>
        </ul>
      </nav>
      
     

     
    </div>
     {/* hamburger  */}
     <div className="hambars">
        <button onClick={handleopenhamburger}><FaBars/></button>
        {openham && (
          <>
            <div className='ham-nav'>
            <div className="logo box-white">
        <img src={logo} alt="Logo" />
      </div>
      <nav>
        <ul>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'active-link' : undefined)}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/active-session"
              className={({ isActive }) => (isActive ? 'active-link' : undefined)}
            >
              Active Session
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tickets-price"
              className={({ isActive }) => (isActive ? 'active-link' : undefined)}
            >
              Tickets Price
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/balance-sheet"
              className={({ isActive }) => (isActive ? 'active-link' : undefined)}
            >
              Balance Sheet
            </NavLink>
          </li>
          <li>
            <NavLink
              to="https://bijuwarsp.bluebugsoft.com/support.php"
              className={({ isActive }) => (isActive ? 'active-link' : undefined)} target='blank'
            >
              Support
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="logout">
        <button onClick={handleclosehamburger}><RxCross1/></button>
      </div>
            </div>
          </>
        )}
      </div>
        
    </>
  );
};

export default Sidebar;
