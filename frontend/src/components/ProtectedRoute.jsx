import React from 'react';
import {Navigate} from 'react-router-dom';
import {Spinner} from 'react-bootstrap';
import {useAuth} from '../context/AuthContext';

export default function ProtectedRoute({children,adminOnly=false}){
 const {isAuthenticated,user,loading}=useAuth();
 if(loading) return <div className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border"/></div>;
 if(!isAuthenticated) return <Navigate to="/login" replace/>;
 if(adminOnly && !user?.is_staff) return <Navigate to="/dashboard" replace/>;
 return children;
}
