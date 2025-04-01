import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, reset } from '../../features/auth/authSlice';
import '../../styles/Navigation.css';

const Nav = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    const logoDestination = user ? '/dashboard' : '/';

    return (
        <nav className="navbar">
            <NavLink className="logo" to={logoDestination}>
                SOMNiA
            </NavLink>
            <ul className="nav-links">
                {user && ( // Only render if user is logged in
                    <>
                        <NavLink className="nav-childs" to="/dashboard">
                            Dashboard
                        </NavLink>
                        <NavLink className="nav-childs" to="/" onClick={handleLogout}>
                            Logout
                        </NavLink>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Nav;