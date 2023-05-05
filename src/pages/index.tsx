import { type NextPageContext, type NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import { api } from "~/utils/api";
import Navbar from "~/components/Navbar";
import CreateClassModal from "~/components/CreateClassModal";
import { FaChalkboardTeacher } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";

const Home: NextPage = () => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch the teacher's classes from the API
  const classes = api.class.getAll.useQuery();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    void classes.refetch();
  };

  return (
    <>
      <Navbar />
      {session && (
        <>
          <div className="p-5">
            <h1 className="mb-4 text-2xl font-bold">
              Welcome, {session.user.name}
            </h1>
            <button
              onClick={openModal}
              className="my-3 flex items-center rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              Add Class
            </button>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 ">
              {classes.data?.map((classItem) => (
                <Link key={classItem.id} href={`/class/${classItem.id}`}>
                  <div className="flex cursor-pointer items-center rounded border-2 border-gray-200 bg-white p-4 shadow hover:border-cyan-600">
                    <FaChalkboardTeacher className="mr-2 text-blue-500" />
                    <p className="font-semibold">{classItem.name}</p>
                  </div>
                </Link>
              ))}
            </div>

            {isModalOpen && <CreateClassModal closeModal={closeModal} />}
          </div>
        </>
      )}
    </>
  );
};

export const getServerSideProps = async ({ req }: NextPageContext) => {
  const session = await getSession({ req });

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default Home;
