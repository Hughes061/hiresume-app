import React, { useState } from "react";
import Header from "../../components/layout/header";
import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prisma";
import { DecodedToken, LoggedInUser } from "../../../backend-utils/types";
import jwtDecode from "jwt-decode";
import Link from "next/link";
import Image from "next/image";
import {
  Category,
  Freelancer as FreelancerType,
  Rating,
  User,
} from "@prisma/client";
import Modal from "../../components/utils/Modal";

type Props = {
  data: Data;
};

export default function Client({ data }: Props) {
  const { user, category, category_name, ratings } = data;
  console.log(ratings);
  return (
    <>
      <Header user={user} />
      <div className="bg-transparent py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-slate-50 font-bold mb-8">
            our top notch in {category_name}
          </h2>
          <div className=" w-full grid grid-cols-1 gap-3 md:grid-cols-4 ">
            {category?.map((freelancer) => (
              <Freelancer
                key={freelancer.userId}
                freelancer={freelancer}
                ratings={ratings}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const star = (
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
);

export function Freelancer({
  freelancer,
  ratings,
}: {
  freelancer: {
    userId: number;
    username: string;
    averageRating: number;
    email: string;
    picture: string;
    freelancer_id: number;
  };
  ratings: {
    id: number;
    comment: string | null;
    client_name: string | undefined;
    client_picture: string | undefined;
    rating: number;
    created_at: Date;
  }[];
}) {
  const [selectedFreelancer, setSelectedFreelancer] = useState({
    freelancer_id: 0,
  });
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="w-full py-2 px-3 border border-slate-300 rounded-md">
      <div className="flex items-center justify-center w-full flex-col gap-y-3">
        <Image
          src={`${freelancer.picture}`}
          alt="user profile"
          width={500}
          height={500}
          className="h-24 w-24 rounded-full object-cover"
        />
        <h1 className="font-bold text-slate-200 text-2xl">{`${freelancer.username}`}</h1>
        <p className="text-slate-200 fonr-semibold">{freelancer.email}</p>
        <p className="text-slate-200 fonr-medium flex items-center gap-x-2">
          {star} {freelancer.averageRating || 0}/5
        </p>
        <button
          onClick={() => {
            setOpenModal(true);
            setSelectedFreelancer({
              freelancer_id: freelancer.freelancer_id,
            });
          }}
          className="bg-green-500 hover:bg-green-700 text-white w-full font-bold py-2 px-4 rounded-full flex items-center justify-center "
        >
          see more
        </button>
      </div>
      <Modal isOpen={openModal} setIsOpen={setOpenModal} span="max-w-2xl">
        <SeeMore
          freelancer={freelancer}
          ratings={ratings}
          setOpen={setOpenModal}
        />
      </Modal>
    </div>
  );
}

const SeeMore = ({
  freelancer,
  ratings,
  setOpen,
}: {
  freelancer: {
    userId: number;
    username: string;
    averageRating: number;
    email: string;
    picture: string;
    freelancer_id: number;
  };
  ratings: {
    id: number;
    comment: string | null;
    client_name: string | undefined;
    client_picture: string | undefined;
    rating: number;
    created_at: Date;
  }[];
  setOpen: any;
}) => {
  return (
    <div className="w-full py-3">
      <div className="flex items-center justify-center w-full flex-col gap-y-3">
        <Image
          src={`${freelancer.picture}`}
          alt="user profile"
          width={500}
          height={500}
          className="h-24 w-24 rounded-full object-cover"
        />
        <h1 className="font-bold text-slate-200 text-2xl">{`${freelancer.username}`}</h1>
        <p className="text-slate-200 fonr-semibold">{freelancer.email}</p>
        <p className="text-slate-200 fonr-medium flex items-center gap-x-2">
          {star} {freelancer.averageRating || 0}/5
        </p>
      </div>
      <div className="w-full flex flex-col gap-y-2 px-2">
        {ratings?.map((rating) => {
          console.log(rating);
          return (
            <div
              key={rating.id}
              className="w-full flex gap-x-4  border border-slate-300 px-2 py-2 "
            >
              <Image
                src={`${rating.client_picture}`}
                alt="user profile"
                width={500}
                height={500}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex items-start flex-col justify-start">
                <span className="flex items-start justify-start gap-x-2">
                  <h1>{rating.client_name} </h1>
                  <p className="text-slate-200 fonr-medium flex items-center gap-x-2">
                    {star} {rating.rating}/5
                  </p>
                </span>
                <p className="font-medium">{rating.comment}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

type Data = {
  category:
    | {
        userId: number;
        username: string;
        averageRating: number;
        email: string;
        picture: string;
        freelancer_id: number;
      }[]
    | undefined;
  category_name: string | null;
  user: LoggedInUser;
  ratings: {
    id: number;
    comment: string | null;
    client_name: string | undefined;
    client_picture: string | undefined;
    rating: number;
    created_at: Date;
  }[];
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

  const { cid } = context.query;

  const category = await prisma.category.findUnique({
    where: {
      id: Number(cid),
    },
    include: {
      Freelancer: {
        include: {
          Rating: {
            include: {
              client: {
                include: {
                  user: true,
                },
              },
            },
          },
          user: true,
        },
      },
    },
  });

  const ratingsByUser = category?.Freelancer?.map((freelancer) => {
    const ratings = freelancer.Rating.map((rating) => rating.rating);
    const averageRating =
      ratings.reduce((total, rating) => total + rating, 0) / ratings.length;

    return {
      userId: freelancer.user.id,
      username: `${freelancer.user.firstName}.${freelancer.user.lastName
        .split("")[0]
        .toUpperCase()}`,
      averageRating,
      email: freelancer.user.email,
      picture: freelancer.user.pictureUrl,
      freelancer_id: freelancer.id,
    };
  });

  const ratings = category?.Freelancer.flatMap((freelancer) => {
    return freelancer.Rating.map((rating) => {
      return {
        id: rating.id,
        comment: rating.comment,
        client_name: rating.client?.user.firstName,
        client_picture: rating.client?.user.pictureUrl,
        rating: rating.rating,
        created_at: rating.createdAt,
      };
    });
  });

  return {
    props: {
      data: {
        category: JSON.parse(JSON.stringify(ratingsByUser)),
        user: loggedInUser,
        category_name: category?.name,
        ratings: JSON.parse(JSON.stringify(ratings)),
      },
    },
  };
};
