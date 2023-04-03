import { useRouter } from "next/router";
import React, { useState } from "react";

import useForm from "../components/hooks/form";
import axios from "axios";
import Image from "next/image";
import ErrorMessage from "../components/utils/error";
import Success from "../components/utils/success";
import Link from "next/link";
import Input from "../components/utils/input";
import Radio from "../components/utils/radio";
import { HandleError, LoggedInUser } from "../../backend-utils/types";
import Header from "../components/layout/header";

type Props = {};

export default function Register({}: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<HandleError[]>([]);
  const [success, setSuccess] = useState(false);
  const initialState = {
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    role: "",
  };
  const router = useRouter();
  const login = async (values: any) => {
    setLoading(true);
    setErrors([]);
    try {
      const res = await axios.post(`/api/auth/signup`, {
        ...values,
      });

      const {
        created,
        errors: serverErrors,
      }: {
        created: boolean;
        errors: HandleError[] | [];
      } = await res.data;

      if (serverErrors.length > 0 || !created) {
        setLoading(false);

        setErrors([...serverErrors]);
        return;
      }

      const login = await axios.post(`/api/auth/login`, {
        ...values,
      });

      const {
        loggedin,
        errors: loginErrors,
      }: {
        loggedin: LoggedInUser | null;
        errors: HandleError[] | [];
      } = await login.data;

      if (loginErrors.length > 0 || !loggedin) {
        setLoading(false);

        setErrors([...loginErrors]);
        return;
      }

      setLoading(false);
      setSuccess(true);
      setErrors([]);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);
console.log(loggedin.role)
      setTimeout(() => {
        loggedin.role === "client"
          ? router.push("/home/client")
          : router.push("/home/freelancer");
      }, 2000);
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      error.response?.data.errors && error.response.data.errors.length > 0
        ? setErrors([...error.response.data.errors])
        : setErrors([
            {
              message: "something unexpected happened try again later",
            },
          ]);
      setLoading(false);
      setTimeout(() => {
        setErrors([]);
      }, 2000);
    }
  };

  const { handleChange, handleSubmit, values } = useForm(initialState, login);
  return (
    <>
      <Header />
      <div className="w-full py-24">
        <div className="mx-auto max-w-5xl flex items-center justify-center h-96 px-2">
          <form
            className="flex z-10 md:-ml-16 mt-20 flex-col h-fit items-center justify-center gap-y-4 bg-transparent shadow rounded-lg py-10 px-2 md:px-8  w-full md:w-1/2"
            onSubmit={handleSubmit}
          >
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                value={values.firstName}
                onChange={handleChange}
                name="firstName"
                label="first name"
              />
              <Input
                value={values.lastName}
                onChange={handleChange}
                name="lastName"
                label="last name"
              />
            </div>
            <Input
              value={values.email}
              onChange={handleChange}
              name="email"
              label="email"
              type="email"
            />
            <Input
              value={values.password}
              onChange={handleChange}
              name="password"
              label="password"
              type="password"
            />
            <Input
              value={values.confirmPassword}
              onChange={handleChange}
              name="confirmPassword"
              label="confirm password"
              type="password"
            />

            <div className="flex flex-col py-1 gap-y-2  w-full">
              <p className="text-slate-50 font-bold">Join us as </p>
              <div className="flex gap-x-2 ">
                <Radio
                  handleChange={handleChange}
                  checked={values.role === "client"}
                  value="client"
                  label="client"
                  name="role"
                />
                <Radio
                  handleChange={handleChange}
                  checked={values.role === "freelancer"}
                  value="freelancer"
                  label="freelancer"
                  name="role"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 py-2 w-full rounded-full  bg-gradient-to-tr from-green-600 to-green-500 shadow text-white text-sm font-medium focus:ring-1 focus:border ring-green-400 border-green-300"
            >
              {loading ? "loading..." : "sign up"}
            </button>
            <div className="w-fit ml-auto mt-2">
              <Link
                href="/"
                className="text-blue-500 text-sm font-semibold hover:underline cursor-pointer"
              >
                already have an account? login
              </Link>
            </div>
            <ErrorMessage errors={errors} />
            <Success
              message={`welcome ${values.firstName}`}
              success={success}
            />
          </form>
        </div>
      </div>
    </>
  );
}
