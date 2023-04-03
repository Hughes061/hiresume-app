import React, { useState, useEffect } from "react";
import Header from "../../components/layout/header";
import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prisma";
import { DecodedToken, LoggedInUser } from "../../../backend-utils/types";
import jwtDecode from "jwt-decode";
import useDebounce from "../../components/hooks/debounce";
import { Job } from "@prisma/client";
import axios from "axios";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

type Props = {
  data: Data;
};

export default function Index({ data }: Props) {
  const { user, token, serverJobs } = data;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchedJobs, setSearchedJobs] = useState<Job[]>([])
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedSearch) {
      setLoading(true);
      axios
        .get(`/api/jobs/search-jobs?query=${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setLoading(false);
          setSearchedJobs(response.data.data);
          console.log(response.data.data);
        })
        .catch((error) => {
          setLoading(false);
          console.log(error);
        });
    }
  }, [debouncedSearch, query, token]);

  useEffect(() => {
    setJobs(serverJobs);
  }, [serverJobs]);

  return (
    <>
      <Header user={user} />
      <div className="py-10 flex ">
        <div className="w-full md:w-[1000px] px-4 py-4 mx-auto flex flex-col  bg-transparent">
          <div className="relative w-full col-span-4 md:col-span-9  rounded-full">
            <input
              className="w-full h-full py-2 px-10 rounded-full outline-none disabled:bg-slate-100  border  border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-300 ring-offset-1 hover:border-green-500 "
              onChange={(e) => {
                setQuery(e.target.value);
                setLoading(true);
              }}
              value={query}
              placeholder="Search "
            />
            <div className="absolute top-0 right-0 left-0 bottom-0 w-10 h-full flex  items-center justify-center">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-600 font-seminbold" />
            </div>
          </div>

          <ul
            role="list"
            className="py-5 mt-3 w-full divide-y rounded-md divide-slate-300  border border-slate-300  "
          >
      {query.length > 0 ?  searchedJobs.map((job) => {
              return (
                <div key={job.id} className="py-4 px-4">
                  <h1 className="font-bold text-lg text-slate-100">
                    {job.title}{" "}
                  </h1>
                  <span className="text-white font-semibold">
                    {job.level} . {job.priceType} . {job.price}.
                  </span>
                  <p className="text-slate-100 font-medium">
                    {job.description}
                  </p>
                </div>
              );
            }) :          jobs.map((job) => {
              return (
                <div key={job.id} className="py-4 px-4">
                  <h1 className="font-bold text-lg text-slate-100">
                    {job.title}{" "}
                  </h1>
                  <span className="text-white font-semibold">
                    {job.level} . {job.priceType} . {job.price}.
                  </span>
                  <p className="text-slate-100 font-medium">
                    {job.description}
                  </p>
                </div>
              );
            })}

          </ul>
        </div>
      </div>
    </>
  );
}

type Data = {
  user: LoggedInUser;
  token: string;
  serverJobs: Job[];
};

//@ts-ignore
export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context
) => {
  const { req } = context;

  const access_token = req.cookies.access_token;
  if (!access_token || access_token.trim() === "") {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  const decodedToken: DecodedToken = jwtDecode(access_token);

  if (decodedToken.exp < Date.now() / 1000) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  const loggedInUser = await prisma.user.findUnique({
    where: {
      id: decodedToken.user_id,
    },
    select: {
      password: false,
      id: true,
      role: true,
      email: true,
      firstName: true,
      lastName: true,
      pictureUrl: true,
    },
  });

  const jobs = await prisma.job.findMany({
    include: {
      Category: true,
      Client: {
        include: {
          user: true,
        },
      },
    },
  });

  return {
    props: {
      data: {
        user: loggedInUser,
        token: access_token,
        serverJobs: JSON.parse(JSON.stringify(jobs)),
      },
    },
  };
};
