import React from "react";
import { useDarkMode } from "../particles/hooks/useDarkModeTest";

function DarkLightSwitcher() {
const [theme,toggleTheme]=useDarkMode()
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        value={theme}
        className="peer sr-only"
        onChange={()=>toggleTheme()}
      />
      <div className="shadow-inner-light peer relative h-6 w-11 rounded-full bg-blue-500 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full peer-focus:border-none peer-focus:ring-4 dark:bg-gray-700 rtl:peer-checked:after:-translate-x-full">
        <svg
          width="21px"
          height="21px"
          className="absolute left-1 top-1/2 -translate-y-1/2 fill-blue-400 pr-1 transition-all peer-checked:block"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 11.807A9.002 9.002 0 0 1 10.049 2a9.942 9.942 0 0 0-5.12 2.735c-3.905 3.905-3.905 10.237 0 14.142 3.906 3.906 10.237 3.905 14.143 0a9.946 9.946 0 0 0 2.735-5.119A9.003 9.003 0 0 1 12 11.807z" />
        </svg>
        <svg
          fill="currentColor"
          viewBox="0 0 512 512"
          height="20px"
          width="20px"
          className="absolute right-1 top-1/2 -translate-y-1/2 transform fill-yellow-300 pl-1 transition-all peer-checked:after:hidden"
        >
          <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391l-19.9 107.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121l19.9-107.9c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1l90.3-62.3c4.5-3.1 10.2-3.7 15.2-1.6zM352 256c0 53-43 96-96 96s-96-43-96-96 43-96 96-96 96 43 96 96zm32 0c0-70.7-57.3-128-128-128s-128 57.3-128 128 57.3 128 128 128 128-57.3 128-128z" />
        </svg>
      </div>
    </label>
  );
}

export default DarkLightSwitcher;
