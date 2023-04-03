import { Category } from "@prisma/client";
import React from "react";

type Props = {
  categories: {
    id: number;
    name: string;
    avgRatings: number;
    skills: number;
  }[];
};

export default function Categories({ categories }: Props) {
  return (
    <div className="bg-transparent py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl text-white font-bold mb-8">
          Browse our different categories
        </h2>
        <div className=" w-full grid grid-cols-1 gap-3 md:grid-cols-3 ">
          {categories.map((category) => (
            <div key={category.name} className="">
              <div className="bg-gradient-to-tl from-green-300 via-green-400 to-green-500 rounded-md p-6 py-8">
                <div className="text-lg font-bold mb-4">{category.name}</div>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
