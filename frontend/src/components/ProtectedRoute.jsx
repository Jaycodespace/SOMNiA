import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        // Redirect to login if user is not logged in
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;