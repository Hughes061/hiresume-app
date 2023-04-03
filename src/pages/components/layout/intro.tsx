import Image from "next/image";
import Link from "next/link";

const IntroSection = () => {
  return (
    <section className="py-20 bg-transparent text-slate-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="md:w-[40%] mb-auto">
          <h2 className="text-[80px] font-bold leading-tight  text-green-500 mb-3">
            How work should work
          </h2>
          <p className="text-lg text-slate-100 mb-8">
            Forget the old rules. You can have the best people. Right now. Right
            here.
          </p>
          <Link href="/auth/login">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full ">
              Get Started
            </button>
          </Link>
        </div>
        <div className="md:w-1/2 mt-12 md:mt-0">
          <Image
            width={500}
            height={500}
            src="/banner.svg"
            alt="Intro Image"
            className="w-full rounded object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
