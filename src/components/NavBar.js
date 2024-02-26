import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const Navbar = ({ navLinks }) => { // Add curly braces around navLinks to destructure the prop
        const location = useLocation();
        return (
                <nav className="navbar">
                    <h1> MND PLATFORM  </h1>
                    <ul>
                        {navLinks.map((link, index) => ( 
                            <li key={index}>
                                <Link to={link.to} className={location.pathname === link.to ? "active" : ""}>{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            );
}

export default Navbar;
