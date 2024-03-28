import { useContext, useState } from "react";
import { FaChartLine, FaCogs, FaHistory } from "react-icons/fa";
import { IoExit, IoWallet } from "react-icons/io5";
import { MdAccountCircle } from "react-icons/md";
import { Link } from "react-scroll";
import { DeviceContext } from "../../context/DeviceContext";
import { UserContext } from "../../context/UserContext";

export default function Navbar() {
  const { user } = useContext(UserContext);
  const { device } = useContext(DeviceContext);
  const [isDropdownActive, setIsDropdownActive] = useState(false);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.reload();
  }

  return (
    <>
      {/* Navbar (Desktop) */}
      {device === "desktop" && (
        <>
          <nav
            className="fixed z-20 flex h-16 w-[1024px] items-center justify-between rounded border-b border-l border-primary/30
          bg-background-3/70 px-4 py-1 shadow-[-5px_10px_25px] shadow-primary/10 backdrop-blur-sm"
          >
            {/* logo */}
            <div className="px-5 py-5 font-extrabold">
              <h1>
                <span className="text-primary shadow-primary drop-shadow-[1px_1px_10px]">
                  Almas
                </span>
                <span className="text-secondary shadow-secondary drop-shadow-[1px_1px_10px]">
                  Talayi
                </span>
              </h1>
            </div>

            {/* Navbar Links */}
            <ul className="flex gap-4 text-sm">
              <li>
                <button className="rounded-2xl">
                  <Link
                    className="flex cursor-pointer gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-primary/5 hover:text-primary"
                    to="assets"
                    activeClass="text-primary bg-primary/10"
                    smooth
                    spy
                  >
                    <IoWallet className="h-4 w-4" />
                    <span>دارایی ها</span>
                  </Link>
                </button>
              </li>
              <li>
                <button className="rounded-2xl">
                  <Link
                    className="flex cursor-pointer gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-primary/5 hover:text-primary"
                    to="current-positions"
                    activeClass="text-primary bg-primary/10"
                    smooth
                    spy
                  >
                    <FaChartLine className="h-4 w-4" />
                    <span>معاملات فعلی</span>
                  </Link>
                </button>
              </li>
              <li>
                <button className="rounded-2xl">
                  <Link
                    className="flex cursor-pointer gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-primary/5 hover:text-primary"
                    to="bot-setting"
                    activeClass="text-primary bg-primary/10"
                    smooth
                    spy
                  >
                    <FaCogs className="h-4 w-4" />
                    <span>تنظیمات ربات</span>
                  </Link>
                </button>
              </li>
              <li>
                <button className="rounded-2xl">
                  <Link
                    className="flex cursor-pointer gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-primary/5 hover:text-primary"
                    to="positions-history"
                    activeClass="text-primary bg-primary/10"
                    smooth
                    spy
                  >
                    <FaHistory className="h-4 w-4" />
                    <span>تاریخچه معاملات</span>
                  </Link>
                </button>
              </li>
            </ul>

            {/* User Area */}
            <div className="relative flex items-center justify-center gap-3">
              <button
                className={`grid h-7 w-7 place-items-center rounded-full bg-primary font-extrabold text-white shadow-[0_0_15px] shadow-primary transition-all
            hover:bg-primary/80 hover:text-background-2 hover:shadow-none active:bg-primary/60 active:shadow-inner active:shadow-background-3 ${isDropdownActive && "bg-primary/60 shadow-inner shadow-background-3 *:text-background-2 hover:bg-primary/80"}`}
                onClick={() => setIsDropdownActive(!isDropdownActive)}
              >
                <MdAccountCircle className="h-5 w-5" />
              </button>
              {isDropdownActive && (
                <div className="absolute left-0 top-0 -ml-4 mt-14 grid w-44 place-items-center gap-5 rounded border-b border-l border-primary/30 bg-background-3/50 p-5 shadow-[-5px_10px_25px] shadow-primary/10 backdrop-blur-sm">
                  <div className="grid w-full place-items-center gap-1 text-sm">
                    <span className="text-xs text-gray-400">
                      شماره همراه شما
                    </span>
                    <span>{"0" + user.phoneNumber}</span>
                  </div>
                  <button
                    className="flex w-full items-center justify-evenly rounded-lg bg-bearish/10 px-3 py-2 text-xs font-bold text-bearish shadow-bearish transition-all hover:drop-shadow-[1px_1px_5px]"
                    onClick={handleLogout}
                  >
                    <IoExit className="h-5 w-5" />
                    <span>خروج از حساب</span>
                  </button>
                </div>
              )}

              {/* <button className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 transition-colors hover:bg-primary/80">
            <NotifIcon
              stroke={tailwindConfig.theme.extend.colors.iconDefault}
              ping
            />
          </button> */}
            </div>
          </nav>

          {/* Fixed Nav Template */}
          <div className="h-16" />
        </>
      )}

      {/* Navbar (Mobile) */}
      {device === "mobile" && (
        <>
          {/* Header */}
          <header
            className="z-20 flex h-16 w-[90vw] items-center justify-between rounded border-b border-l border-primary/30
          bg-background-3/70 px-4 py-1 shadow-[-5px_10px_25px] shadow-primary/10 backdrop-blur-sm"
          >
            {/* logo */}
            <div className="mr-2 font-extrabold">
              <h1>
                <span className="text-primary shadow-primary drop-shadow-[1px_1px_5px]">
                  Almas
                </span>
                <span className="text-secondary shadow-secondary drop-shadow-[1px_1px_5px]">
                  Talayi
                </span>
              </h1>
            </div>

            {/* User Area */}
            <div className="relative flex items-center justify-center gap-3">
              <button
                className={`grid h-7 w-7 place-items-center rounded-full bg-primary font-extrabold text-white shadow-[0_0_10px] shadow-primary transition-all
                  hover:bg-primary/80 hover:text-background-2 hover:shadow-none active:bg-primary/60 active:shadow-inner active:shadow-background-3
                    ${isDropdownActive && "bg-primary/60 shadow-inner shadow-background-3 *:text-background-2 hover:bg-primary/80"}`}
                onClick={() => setIsDropdownActive(!isDropdownActive)}
              >
                <MdAccountCircle className="h-5 w-5" />
              </button>
              {isDropdownActive && (
                <div className="absolute left-0 top-0 -ml-4 mt-14 grid w-44 place-items-center gap-5 rounded border-b border-l border-primary/30 bg-background-3/50
                    p-5 shadow-[-5px_10px_25px] shadow-primary/10 backdrop-blur-sm">
                  <div className="grid w-full place-items-center gap-1 text-sm">
                    <span className="text-xs text-gray-400">
                      شماره همراه شما
                    </span>
                    <span>{"0" + user.phoneNumber}</span>
                  </div>
                  <button
                    className="flex w-full items-center justify-evenly rounded-lg bg-bearish/10 px-3 py-2 text-xs font-bold
                        text-bearish shadow-bearish transition-all active:drop-shadow-[1px_1px_5px]"
                    onClick={handleLogout}
                  >
                    <IoExit className="h-5 w-5" />
                    <span>خروج از حساب</span>
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Footer Fixed Navbar */}
          <nav className="fixed bottom-0 left-0 right-0 z-20 grid h-20 w-screen place-items-center rounded-t bg-background-3/95 px-4 py-2 shadow-[-5px_10px_25px] shadow-primary/10 backdrop-blur-sm">
            {/* Navbar Links */}
            <ul className="flex gap-4 text-xs max-sm:text-[2.75vw]">
              <li>
                <button>
                  <Link
                    className="grid cursor-pointer place-items-center gap-2 rounded-2xl px-2 py-1 transition-colors hover:text-primary"
                    to="assets"
                    activeClass="text-primary bg-primary/10"
                    smooth
                    spy
                  >
                    <IoWallet className="h-6 w-6" />
                    <span>دارایی ها</span>
                  </Link>
                </button>
              </li>
              <li>
                <button>
                  <Link
                    className="grid cursor-pointer place-items-center gap-2 rounded-2xl px-2 py-1 transition-colors hover:text-primary"
                    to="current-positions"
                    activeClass="text-primary bg-primary/10"
                    smooth
                    spy
                  >
                    <FaChartLine className="h-6 w-6" />
                    <span>معاملات فعلی</span>
                  </Link>
                </button>
              </li>
              <li>
                <button>
                  <Link
                    className="grid cursor-pointer place-items-center gap-2 rounded-2xl px-2 py-1 transition-colors hover:text-primary"
                    to="bot-setting"
                    activeClass="text-primary bg-primary/10"
                    smooth
                    spy
                  >
                    <FaCogs className="h-6 w-6" />
                    <span>تنظیمات ربات</span>
                  </Link>
                </button>
              </li>
              <li>
                <button>
                  <Link
                    className="grid cursor-pointer place-items-center gap-2 rounded-2xl px-2 py-1 transition-colors hover:text-primary"
                    to="positions-history"
                    activeClass="text-primary bg-primary/10"
                    smooth
                    spy
                  >
                    <FaHistory className="h-6 w-6" />
                    <span>تاریخچه معاملات</span>
                  </Link>
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
