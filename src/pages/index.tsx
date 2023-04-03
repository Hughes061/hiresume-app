import Head from "next/head";
import Header from "./components/layout/header";
import IntroSection from "./components/layout/intro";
import Meet from "./components/layout/meet";
import Categories from "./components/layout/categories";
import prisma from "../../lib/prisma";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

export default function Home({ data }: { data: Data }) {
  const { categories } = data;
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 50) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <>
      <Head>
        <title>Hiresume </title>
        <meta name="description" content="join us" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="">
        <Header fixed={isFixed} />
        <IntroSection />
        <Categories categories={categories} />
        <Meet />
      </main>
    </>
  );
}

type Data = {
  categories: {
    id: number;
    name: string;
    avgRatings: number;
    skills: number;
  }[];
};

//@ts-ignore
export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
  context
) => {
  const categories = await prisma.category.findMany({
    include: {
      Freelancer: {
        include: {
          Rating: true,
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
    };
  });
  console.log(categoriesWithAvgRatings);
  return {
    props: {
      data: {
        categories: categoriesWithAvgRatings,
      },
    },
  };
};
