import { useState } from "react";
import LoginPage from "./components/LoginPage";
import ProfileSettingsPage from "./components/ProfileSettingsPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <>
      {isLoggedIn ? (
        <ProfileSettingsPage />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;