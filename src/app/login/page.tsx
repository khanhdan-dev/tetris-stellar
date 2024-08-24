"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import DarkLightSwitcher from "../../components/DarkLightS";

interface IData {
  email: string;
  password: string;
}

export default function Login() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IData>();
  const [isShowPassword, setPassword] = useState(false);
  const onSubmit = (data: IData) => console.log(data);
  console.log("====================================");
  console.log("LocalStr: ", localStorage.getItem("THEME-SWITCHMODE"));
  console.log("====================================");
  function showPassword() {
    setPassword((prevState) => !prevState);
  }

  console.log(watch("email")); // watch input value by passing the name of it

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-screen w-full items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3">
        {/* register your input into the hook by invoking the "register" function */}
        <input
          type="email"
          className="shadow-custom-light h-12 w-96 rounded px-3 py-2 font-sans"
          placeholder="Enter your email"
          {...register("email")}
        />
        <div className="relative h-12 w-96">
          <input
            type={isShowPassword ? "text" : "password"}
            className="shadow-custom-light relative h-12 w-full rounded py-2 pl-3 pr-10 font-sans"
            placeholder="Enter your password"
            {...register("password")}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer text-gray-500">
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

        <input
          type="submit"
          className="bg-bay-of-many alig shadow-custom-light 0 mt-3 h-10 w-32 rounded font-mono text-white hover:bg-yellow-600"
          value="Login"
        />

        <DarkLightSwitcher />
      </div>
    </form>
  );
}
