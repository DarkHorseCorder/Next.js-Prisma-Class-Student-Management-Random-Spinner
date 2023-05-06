import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="flex flex-wrap items-center justify-between bg-teal-500 p-6">
      <div className="mr-6 flex flex-shrink-0 items-center text-white">
        <span className="text-xl font-semibold tracking-tight">
          Teacher Dashboard
        </span>
      </div>
      <div className="block w-full flex-grow lg:flex lg:w-auto lg:items-center">
        <div className="text-sm lg:flex-grow">
          <Link href="/">
            <div className="mr-4 mt-4 block cursor-pointer text-teal-200 hover:text-white lg:mt-0 lg:inline-block">
              Home
            </div>
          </Link>
          <Link href="/random">
            <div className="mr-4 mt-4 block cursor-pointer text-teal-200 hover:text-white lg:mt-0 lg:inline-block">
              Random
            </div>
          </Link>
        </div>
        {session && (
          <div>
            <button
              onClick={() => void signOut()}
              className="mt-4 inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-teal-500 lg:mt-0"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
