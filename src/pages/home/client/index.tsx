import React from "react";
import Header from "../../components/layout/header";
import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prisma";
import { DecodedToken, LoggedInUser } from "../../../backend-utils/types";
import jwtDecode from "jwt-decode";
import Link from "next/link";
import Image from "next/image";

type Props = {
  data: Data;
};

export default function index({ data }: Props) {
  const { user, categories } = data;
  console.log(user);
  return (
    <>
      <Header user={user} />
      <div className="bg-transparent py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-slate-50 font-bold mb-8">for all your needs</h2>
          <div className=" w-full grid grid-cols-1 gap-3 md:grid-cols-3 ">
            {categories.map((category) => (
              <Link href={`/home/client/${category.id}`} key={category.id}>
                <div className="w-full h-fit">
                  <div className="bg-gradient-to-tl h-full gap-y-3 flex flex-col from-green-300 via-green-400 to-green-500 rounded-md p-6 py-8">
                    <div className="text-lg font-bold mb-4">
                      {category.name}
                    </div>
                    <div className="flex items-center text-sm">
                      <div className=" sm mr-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="mr-2">{category.skills} skills</div>
                      <div className="mr-2">|</div>
                      <div>{category.avgRatings}/5</div>
                    </div>
                    <div className="flex -space-x-2 overflow-hidden">
                      {category.freelancers &&
                        category.freelancers.slice(0, 3).map((freelancer) => {
                          return (
                            <div
                              key={freelancer.freelancer_id}
                              className="inline-block h-12 w-12 rounded-full ring-2 ring-green hover:mr-2 hover:z-10"
                            >
                              <Image
                                src={`${freelancer.freelancer_profile}`}
                                alt="profile image"
                                width={50}
                                height={50}
                                className="rounded-full w-full h-full object-cover"
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

type Data = {
  categories: {
    id: number;
    name: string;
    avgRatings: number;
    skills: number;
    freelancers: {
      freelancer_id: number;
      freelancer_first_name: string;
      freelancer_profile: string | null;
    }[];
  }[];
  user: LoggedInUser;
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

  const categories = await prisma.category.findMany({
    include: {
      Freelancer: {
        include: {
          Rating: true,
          user: true,
        },
      },
    },
  });
  const categoriesWithAvgRatings = categories.map((category) => {
    const { id, name, Freelancer } = category;

    const avgRatings =
      Freelancer.reduce((acc, curr) => {
        const ratingsSum = curr.Rating.reduce(
          (sum, rating) => sum + rating.rating,
          0
        );
        const ratingsCount = curr.Rating.length;
        return acc + ratingsSum / ratingsCount;
      }, 0) / Freelancer.length || 0;

    return {
      id,
      name,
      avgRatings,
      skills: Math.floor(Math.random() * 100),
      freelancers: Freelancer.map((freelancer) => {
        return {
          freelancer_id: freelancer.id,
          freelancer_first_name: freelancer.user.firstName,
          freelancer_profile: freelancer.user.pictureUrl,
        };
      }),
    };
  });
  console.log(categoriesWithAvgRatings);
  return {
    props: {
      data: {
        categories: categoriesWithAvgRatings,
        user: loggedInUser,
      },
    },
  };
};
