import { getSession } from "next-auth/react";
import { api } from "~/utils/api";
import Navbar from "~/components/Navbar";
import { type GetServerSideProps } from "next";
import { PrismaClient, type Class, type Student } from "@prisma/client";
import { useState } from "react";
import CreateStudentModal from "~/components/CreateStudentModal";
import { FaSearch } from "react-icons/fa";

const ClassPage = ({ classData }: { classData: Class }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updateStudent = api.student.update.useMutation();
  const deleteStudent = api.student.delete.useMutation();
  const deleteClass = api.class.delete.useMutation();

  const students = api.student.getAllByClass.useQuery({
    classId: classData.id,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    void students.refetch();
  };

  const handleExclude = (studentId: string, exclude: boolean) => {
    updateStudent.mutate(
      {
        id: studentId,
        exclude: exclude,
      },
      {
        onSuccess: () => {
          void students.refetch();
        },
      }
    );
  };

  const handleRotation = (studentId: string, rotation: string) => {
    updateStudent.mutate(
      {
        id: studentId,
        rotation: rotation,
      },
      {
        onSuccess: () => {
          void students.refetch();
        },
      }
    );
  };

  const deleteConfirm = (student: Student) => {
    if (confirm(`Are you sure you want to delete ${student.name}?`)) {
      deleteStudent.mutate(
        {
          id: student.id,
        },
        {
          onSuccess: () => {
            void students.refetch();
          },
        }
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Class: {classData.name}
        </h1>
        <div className="flex items-center space-x-5">
          <h2 className="mt-2 text-lg font-medium text-gray-900">
            Students: {students.data?.length ?? 0}
          </h2>
          <h2
            className={`mt-2 rounded-md p-2 text-lg text-white
            ${classData.rotation === "A" ? "bg-green-500" : "bg-blue-500"}`}
          >
            Current Rotation:{" "}
            <span className="font-bold"> {classData.rotation} </span>
          </h2>
        </div>
        <div className="flex items-center space-x-5">
          <button
            onClick={openModal}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Add Student
          </button>
          <button
            className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            onClick={() => {
              if (confirm("Are you sure you want to delete this class?")) {
                deleteClass.mutate(
                  {
                    id: classData.id,
                  },
                  {
                    onSuccess: () => {
                      window.location.href = "/";
                    },
                  }
                );
              }
            }}
          >
            Delete Class
          </button>
        </div>

        {isModalOpen && (
          <CreateStudentModal closeModal={closeModal} classId={classData.id} />
        )}

        <ul className="mt-8 space-y-4">
          <div>
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FaSearch
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-gray-300 p-3 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Search"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {(students.data
            ? searchTerm
              ? students.data.filter((s) => s.name.includes(searchTerm))
              : students.data
            : []
          ).map((student) => (
            <li key={student.id} className="rounded border p-4 shadow">
              <p className="text-lg font-medium text-gray-900">
                {student.name}
              </p>
              <div className="mt-2 flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={student.exclude}
                    onChange={() => handleExclude(student.id, !student.exclude)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span>Exclude</span>
                </label>
                <button
                  onClick={() =>
                    handleRotation(
                      student.id,
                      student.rotation === "A" ? "B" : "A"
                    )
                  }
                  className={`rounded px-3 py-2 text-white ${
                    student.rotation === "A"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  Rotation {student.rotation}
                </button>
                <button
                  onClick={() => deleteConfirm(student)}
                  className="rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ req: context.req });

  const prisma = new PrismaClient();

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  const id = context.params?.id;

  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }

  const classData = await prisma.class.findUnique({
    where: {
      id,
    },
  });

  if (classData?.teacherId !== session.user.id || !classData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      classData,
    },
  };
};

export default ClassPage;
