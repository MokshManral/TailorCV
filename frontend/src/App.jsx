import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Hero from "./pages/Hero.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import TailorPage from "./pages/TailorPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.jsx";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("tailorcv-theme") === "dark";
  });

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Theme
  useEffect(() => {
    localStorage.setItem(
      "tailorcv-theme",
      dark ? "dark" : "light"
    );

    document.documentElement.classList.toggle(
      "dark",
      dark
    );
  }, [dark]);

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch(
          `${API_URL}/auth/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    checkUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Hero
              dark={dark}
              setDark={setDark}
              user={user}
              setUser={setUser}
            />
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage
              dark={dark}
              setDark={setDark}
              user={user}
              setUser={setUser}
            />
          }
        />

        <Route
          path="/tailor"
          element={
            <TailorPage
              dark={dark}
              setDark={setDark}
              user={user}
              setUser={setUser}
            />
          }
        />

        <Route
          path="/terms"
          element={
            <TermsPage
              dark={dark}
              setDark={setDark}
            />
          }
        />

        <Route
          path="/privacy"
          element={
            <PrivacyPolicyPage
              dark={dark}
              setDark={setDark}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
