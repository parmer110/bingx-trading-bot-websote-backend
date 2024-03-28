import { createContext, useEffect, useState } from "react";

export const DeviceContext = createContext();

// eslint-disable-next-line react/prop-types
export const DeviceContextProvider = ({ children }) => {
  const [device, setDevice] = useState(""); // "mobile", "desktop"

  useEffect(() => {
    const handleWidthChange = () => {
      if (window.innerWidth >= 1024) setDevice("desktop");
      else if (window.innerWidth >= 0) setDevice("mobile");
    };
    handleWidthChange();
    window.addEventListener("resize", handleWidthChange);
    return () => window.removeEventListener("resize", handleWidthChange);
  }, []);

  return (
    <DeviceContext.Provider value={{ device: device }}>
      {children}
    </DeviceContext.Provider>
  );
};
