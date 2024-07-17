"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  token: string;
  username: string;
  id: string;
  profilePic: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const id = localStorage.getItem("id");
    const profilePic = localStorage.getItem("profilePic");
    if (token && username && id && profilePic) {
      setUser({ token, username, id, profilePic});
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("username", userData.username);
    localStorage.setItem("id", userData.id);
    localStorage.setItem("profilePic", userData.profilePic);
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    router.push("/");
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
