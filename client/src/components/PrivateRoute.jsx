import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null; // or spinner while auth loading
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
