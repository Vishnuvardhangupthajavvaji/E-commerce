import { createContext, useState, useEffect } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {

  const [token,setToken] = useState(localStorage.getItem("access"));
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);

  // Load user when token exists
  useEffect(()=>{
    if(token){
      API.get("users/me/")
        .then(res => setUser(res.data))
        .catch(()=>logout())
        .finally(()=>setLoading(false))
    }
  },[token]);

  const login = (data)=>{
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    setToken(data.access);
  };

  const logout = ()=>{
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setToken(null);
    setUser(null);
  };

  return(
    <AuthContext.Provider value={{token,user,login,logout, loading}}>
      {children}
    </AuthContext.Provider>
  )
}
