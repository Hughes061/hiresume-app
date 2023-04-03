import Image from "next/image";
import Link from "next/link";
import { LoggedInUser } from "../../../backend-utils/types";
import { useAuth } from "../hooks/auth";
import { ClientLoggedIn } from "@/pages/home/client/profile";

const Header = ({
  fixed,
  user,
}: {
  fixed?: boolean;
  user?: LoggedInUser | null | ClientLoggedIn;
}) => {
  const { logout } = useAuth();
  return (
    <nav
      className={` ${
        fixed ? "fixed bg-white/20" : "bg-transparent"
      } flex z-10 w-full justify-between items-center shadow bg-transparent border-b border-slate-300`}
    >
      <div className="flex items-center justify-center px-2  py-4 hover:bg-transparent hover:shadow-2xl h-full">
        <Link
          href="/"
          className="text-3xl tracking-wide font-bold bg-clip-text text-transparent bg-gradient-to-tr from-green-500 via-green-600 to-green-700"
        >
          Hiresume
        </Link>
      </div>
      {user ? (
        <div className="flex justify-end gap-x-4  py-4 items-center">
              {user.role == "client" && <Link href="/home/client/profile"    className="inline-flex w-12 h-12 rounded-full outline-none items-center justify-center bg-transparent text-white font-bold   "  >
           <Image src={`${user.pictureUrl}`} alt="user profile" width={500} height={500} className="w-full h-full rounded-full" />
        </Link>}
          <button
            onClick={logout}
            className="inline-flex items-center justify-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full "
          >
            Logout
          </button>
    
        </div>
      ) : (
        <div className="flex justify-end  py-4 items-center">
          <Link
            className="text-slate-200 hover:text-slate-300 mr-4"
            href="/auth/login"
          >
            Login
          </Link>
          <Link
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full "
            href="/auth/signup"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Header;
