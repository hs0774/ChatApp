"use client"
import React, { createContext, useContext,useState,useEffect} from 'react';


interface User {
  token: string;
  username: string;
  id:string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}



const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider = ({ children } : {children:any}) => {
  const [user, setUser] = useState<User | null>(null);

    useEffect(() => {

        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username')
        const id = localStorage.getItem('id');
        if(token && username && id){
            setUser({ token, username,id });
        }
      }, []);

    const login = (userData: User) => {
        setUser(userData);
    };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};




