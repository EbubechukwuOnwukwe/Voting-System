import React, {lazy,Suspense} from 'react';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

const Login=lazy(()=>import('./pages/Login'));
const Register=lazy(()=>import('./pages/Register'));
const ForgotPassword=lazy(()=>import('./pages/ForgotPassword'));
const ResetPassword=lazy(()=>import('./pages/ResetPassword'));
const Dashboard=lazy(()=>import('./pages/Dashboard'));
const Vote=lazy(()=>import('./pages/Vote'));
const Results=lazy(()=>import('./pages/Results'));
const AIInsights=lazy(()=>import('./pages/AIInsights'));
const CMS=lazy(()=>import('./pages/CMS'));
const NotFound=lazy(()=>import('./pages/NotFound'));

export default function App(){
 return <AuthProvider><BrowserRouter><Suspense fallback={<LoadingSpinner message="Loading..." />}><Routes>
  <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
  <Route path="/forgot-password" element={<ForgotPassword/>}/>
  <Route path="/reset-password/:uid/:token" element={<ResetPassword/>}/>
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
  <Route path="/vote" element={<ProtectedRoute><Vote/></ProtectedRoute>}/>
  <Route path="/results" element={<ProtectedRoute><Results/></ProtectedRoute>}/>
  <Route path="/ai-insights" element={<ProtectedRoute><AIInsights/></ProtectedRoute>}/>
  <Route path="/cms" element={<ProtectedRoute adminOnly><CMS/></ProtectedRoute>}/>
  <Route path="/" element={<Navigate to="/dashboard" replace/>}/><Route path="*" element={<NotFound/>}/>
 </Routes></Suspense></BrowserRouter></AuthProvider>
}
