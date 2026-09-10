import React, {createContext, useContext, useEffect, useState} from 'react';
import authService from '../services/authService';

const AuthContext=createContext(null);
export const useAuth=()=>useContext(AuthContext);

export const AuthProvider=({children})=>{
  const [user,setUser]=useState(authService.getCurrentUser());
  const [loading,setLoading]=useState(false);
  const login=async(c)=>{const d=await authService.login(c);setUser(d.user);return d;};
  const register=async(c)=>{const d=await authService.register(c);setUser(d.user);return d;};
  const logout=()=>{authService.logout();setUser(null);};
  useEffect(()=>{setLoading(false)},[]);
  return <AuthContext.Provider value={{user,login,register,logout,isAuthenticated:!!user,loading}}>{children}</AuthContext.Provider>
};
