import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Hero from "./pages/Hero.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import TailorPage from "./pages/TailorPage.jsx";
import TermsPage from "./pages/TermsPage.jsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.jsx";

export default function App() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("tailorcv-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("tailorcv-theme", dark ? "dark" : "light");

    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Hero dark={dark} setDark={setDark} />}
        />

        <Route
          path="/login"
          element={<LoginPage dark={dark} setDark={setDark} />}
        />

        <Route
          path="/tailor"
          element={<TailorPage dark={dark} setDark={setDark} />}
        />

        <Route
          path="/terms"
          element={<TermsPage dark={dark} setDark={setDark} />}
        />

        <Route
          path="/privacy"
          element={<PrivacyPolicyPage dark={dark} setDark={setDark} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
