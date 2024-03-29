import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupForm from './components/signuplogin/SignupForm';
import { useEffect, useState } from "react";
import { axiosBase } from "./api/axios";
import { AppContext } from "./context/AppContext";
import { DeviceContextProvider } from "./context/DeviceContext";
import { UserContext } from "./context/UserContext";
import Home from "./pages/Home";
import SignupLogin from "./pages/SignupLogin";

export default function App() {
  const [appState, setAppState] = useState(""); // 1."login", 2."otp", 3."home"
  const [user, setUser] = useState({
    phoneNumber: "",
  });

  async function refreshJWT() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      setAppState("login");
      return;
    }
    await axiosBase
      .post(
        "/auth/jwt/refresh",
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
            "Content-Type": "application/json",
          },
        },
      )
      .then((res) => {
        if (res.data.is_valid) {
          const newAccessToken = res.data.new_access_token;
          localStorage.setItem("accessToken", newAccessToken);
          setAppState("home");
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setAppState("login");
        }
      });
  }

  async function validateJWT() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setAppState("login");
      return;
    }
    await axiosBase
      .post(
        "/auth/jwt/validate",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      )
      .then((res) => {
        if (res.data.is_valid) {
          setAppState("home");
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          refreshJWT();
        }
      });
  }

  useEffect(() => {
    setUser({ phoneNumber: localStorage.getItem("phoneNumber") });
    validateJWT();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full w-full">
      <DeviceContextProvider>
        <Router>
          <AppContext.Provider value={{ appState, setAppState }}>
            <UserContext.Provider value={{ user, setUser }}>
              <Routes>
              <Route path="/signup" element={<SignupForm />} />
              {appState === "login" || appState === "otp" ? (
                <Route path="/login" element={<SignupLogin />} />
              ) : appState === "home" ? (
                <Route path="/home" element={<Home />} />
              ) : null}
              <Route path="*" element={<SignupLogin />} />
            </Routes>
            </UserContext.Provider>
          </AppContext.Provider>
        </Router>
      </DeviceContextProvider>
    </div>
  );
}
