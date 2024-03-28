import { useContext } from "react";
import robotWallpaper from "../assets/images/robot-wallpaper.png";
import robotWallpaperMobile from "../assets/images/robot-wallpaper-mobile.png";
import OTPCard from "../components/signuplogin/OTPCard";
import SignupLoginCard from "../components/signuplogin/SignupLoginCard";
import { AppContext } from "../context/AppContext";

export default function SignupLogin() {
  const { appState } = useContext(AppContext);

  return (
    <div className="relative flex h-screen w-full max-md:flex-col-reverse">
      {/* Right Side - Card Background */}
      <div className="grid w-1/2 place-items-center bg-gradient-to-r from-background-3 to-background-1 max-md:w-full">
        {appState === "login" ? <SignupLoginCard /> : <OTPCard />}
      </div>

      {/* Left Side - Background Image */}
      <img
        src={robotWallpaper}
        className="h-screen w-1/2 max-md:hidden max-md:h-full"
      />
      <img
        src={robotWallpaperMobile}
        className="fixed top-0 -z-10 min-w-full md:hidden"
      />
      <span className="fixed bottom-0 left-0 right-0 -z-20 h-full bg-gradient-to-t from-background-3 to-background-1 md:hidden" />
    </div>
  );
}
