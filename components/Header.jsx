import Image from "next/image";
import logo from "../public/f-logo.png";
import {
  BellIcon,
  ChatIcon,
  ChevronDownIcon,
  HomeIcon,
  UserGroupIcon,
  ViewGridIcon,
} from "@heroicons/react/solid";
import {
  FlagIcon,
  LogoutIcon,
  PlayIcon,
  SearchIcon,
  ShoppingCartIcon,
} from "@heroicons/react/outline";
import HeaderIcon from "./HeaderIcon";
import { signOut, useSession } from "next-auth/react";
import { LightBulbIcon, MoonIcon } from "@heroicons/react/solid";
import userDarkMode from "../hooks/userDarkMode";
import { useEffect, useRef, useState } from "react";

const Header = () => {
  const { data: session, loading } = useSession();
  const [colorTheme, setTheme] = userDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen((prevState) => !prevState);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        className="sticky top-0 z-50 bg-white flex items-center p-0.5 lg:px-5 shadow-md dark:bg-gray-800 dark:text-white"
        ref={dropdownRef}
      >
        {/* Left */}

        <div className="flex items-center">
          <Image src={logo} width={40} height={40} layout="fixed" alt="/" />
          <div className="hidden min-[370px]:flex ml-2 items-center rounded-full bg-gray-100 p-2">
            <SearchIcon className="h-6 text-gray-600" />
            <input
              className="hidden lg:inline-flex ml-2 items-center bg-transparent outline-none placeholder-gray-500 dark:text-black flex-shrink"
              type="text"
              placeholder="Search Coolbook"
            />
          </div>
        </div>

        {/* Center */}
        <div className="flex justify-center flex-grow">
          <div className="flex space-x-6 md:space-x-0">
            <HeaderIcon active Icon={HomeIcon} />
            <HeaderIcon Icon={FlagIcon} />
            <HeaderIcon Icon={PlayIcon} />
            <HeaderIcon Icon={ShoppingCartIcon} />
            <HeaderIcon Icon={UserGroupIcon} />
          </div>
        </div>

        {/* Right */}

        <div className="flex items-center sm:space-x-2 justify-end">
          {colorTheme === "light" ? (
            <LightBulbIcon
              onClick={() => setTheme("light")}
              className="h-8 text-gray-400 dark:text-gray-200 mr-3 cursor-pointer"
            />
          ) : (
            <MoonIcon
              onClick={() => setTheme("dark")}
              className="h-8 text-[#023047]  ml-2 cursor-pointer"
            />
          )}

          <div className="flex items-center space-x-2">
            <Image
              className="rounded-full cursor-pointer"
              src={session?.user.image}
              width={40}
              height={40}
              layout="fixed"
              alt={session?.user.name}
            />
            <p className="hidden sm:flex whitespace-nowrap font-semibold pr-3">
              {session?.user.name}
            </p>
          </div>

          <ViewGridIcon className="icon" />
          <ChatIcon className="icon" />

          <BellIcon className="icon" />
          <ChevronDownIcon className="icon" onClick={toggleDropdown} />
          {isOpen && (
            <div className="absolute top-14 right-1 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-200 dark:text-white dark:bg-gray-700 rounded-md shadow-lg outline-none">
              <a
                onClick={signOut}
                className="flex items-center justify-center cursor-pointer"
              >
                <LogoutIcon className="icon bg-transparent hover:bg-transparent dark:text-white dark:hover:bg-transparent" />
                <p className="bg-transparent"></p> Log Out
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default Header;
