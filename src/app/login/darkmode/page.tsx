"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface IData {
  email: string;
  password: string;
}

export default function LoginDarkmode() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IData>();
  const [isShowPassword, setPassword] = useState(false);
  const onSubmit = (data: IData) => console.log(data);

  function showPassword() {
    setPassword((prevState) => !prevState);
  }

  console.log(watch("email")); // watch input value by passing the name of it

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-mine-shaft flex h-screen w-full items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3">
        {/* register your input into the hook by invoking the "register" function */}
        <input
          type="email"
          className="shadow-custom-dark bg-mine-shaft h-12 w-96 rounded px-3 py-2 font-sans text-white"
          placeholder="Enter your email"
          {...register("email")}
        />
        <div className="relative h-12 w-96">
          <input
            type={isShowPassword ? "text" : "password"}
            className="shadow-custom-dark bg-mine-shaft relative h-12 w-full rounded py-2 pl-3 pr-10 font-sans text-white"
            placeholder="Enter your password"
            {...register("password")}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer text-gray-400">
            {isShowPassword ? (
              <FaEyeSlash onClick={showPassword} />
            ) : (
              <FaEye onClick={showPassword} />
            )}
          </div>
        </div>

        {/* include validation with required or other standard HTML validation rules */}

        {/* errors will return when field validation fails  */}
        {errors.password && (
          <span className="text-red-500">This field is required</span>
        )}

        <div className="w-full text-right">
          <a href="#" className="font-sans text-white">
            Forgot password?
          </a>
        </div>

        <input
          type="submit"
          className="shadow-custom-dark hover:bg-bay-of-many h-10 w-32 rounded bg-yellow-500 font-mono text-white"
          value="Login"
        />
        <div className="group flex w-full items-center justify-end">
          <a
            href="#"
            className="pr-2 font-sans text-sm text-gray-400 group-hover:text-white"
          >
            Go back{" "}
          </a>
          <svg
            fill="currentColor"
            viewBox="0 0 16 16"
            height="1em"
            width="1em"
            className="fill-gray-400 group-hover:fill-white"
          >
            <path
              fillRule="evenodd"
              d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z"
            />
          </svg>
        </div>

        <label className="inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            value=""
            className="peer sr-only"
            defaultChecked
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
      </div>
    </form>
  );
}
