import Image from "next/image";
import React from "react";

type Props = {};

export default function Meet({}: Props) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl">
            Meet the Team
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-slate-300 lg:mx-auto">
            We are a local team based in Kenya, dedicated to helping our
            country&apos;s people get jobs.
          </p>
        </div>
        <div className="mt-16 flex justify-center">
          <Image
            width={500}
            height={500}
            className="h-[500px] w-full  rounded-md object-cover"
            src="/team.png"
            alt="Team Photo"
          />
        </div>
      </div>
    </section>
  );
}
