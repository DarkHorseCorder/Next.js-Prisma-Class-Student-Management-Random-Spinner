import { getSession } from "next-auth/react";
import { api } from "~/utils/api";
import Navbar from "~/components/Navbar";
import { type GetServerSideProps } from "next";
import { PrismaClient, type Class, type Student } from "@prisma/client";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

const RandomPage = ({ classes }: { classes: Class[] }) => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [randomStudent, setRandomStudent] = useState<Student | null>(null);
  const [randomStudentIndex, setRandomStudentIndex] = useState<number | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  const generateRandomStudent = () => {
    if (selectedClassId === "") {
      alert("Please select a class and a mode.");
      return;
    }

    pickStudent.mutate(
      {
        classId: selectedClassId,
      },
      {
        onSuccess: (data) => {
          setRandomStudent(data as Student);
          if(data)
          setRandomStudentIndex(allStudents.findIndex((item) => item.id === data.id))
        },
      }
    );
  };

  const getAllStudents = () => {
    if(selectedClassId === "") {
      alert("Please select a class and a mode.");
      return;
    }

    pickAllStudent.mutate(
      {
        classId: selectedClassId,
      },
      {
        onSuccess: (data: Student[]) => {
          setAllStudents(data)
        },
      }
    );
  };

  const modes = [
    {
      name: "Simple",
      component: (
        <SimplePicker
          generateRandomStudent={generateRandomStudent}
          randomStudent={randomStudent}
        />
      ),
    },
    {
      name: "Wheel",
      component: (
        <WheelPicker
          allStudents={allStudents}
          generateRandomStudent={generateRandomStudent}
          randomStudentIndex={randomStudentIndex}
          setRandomStudentIndex = {setRandomStudentIndex}
        />
      ),
    },
  ];

  const [modeIndex, setModeIndex] = useState(0);

  const pickStudent = api.student.pickRandom.useMutation();
  const pickAllStudent = api.student.getAvailableStudents.useMutation();

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassId(e.target.value);
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModeIndex(parseInt(e.target.value));
    getAllStudents()
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Random Student Generator
        </h1>
        <div className="mt-4 flex items-center space-x-5">
          <div>
            <label htmlFor="class" className="block font-medium text-gray-700">
              Class:
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <select
                id="class"
                name="class"
                className="block w-full rounded-md border-2 border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                onChange={handleClassChange}
                value={selectedClassId}
              >
                <option value="">Select a class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="mode" className="block font-medium text-gray-700">
              Mode:
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <select
                id="mode"
                name="mode"
                className="block w-full rounded-md border-2 border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                onChange={handleModeChange}
                value={modeIndex}
              >
                {modes.map((m, i) => (
                  <option key={m.name} value={i}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div>{modes[modeIndex]?.component ?? ""}</div>
      </div>
    </>
  );
};

const SimplePicker = ({
  generateRandomStudent,
  randomStudent,
}: {
  generateRandomStudent: () => void;
  randomStudent: Student | null;
}) => {
  const [names, setNames] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [animate, setAnimate] = useState<boolean>(false);
  const [showPreviousNames, setShowPreviousNames] = useState<boolean>(false);

  useEffect(() => {
    if (randomStudent) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
      setAnimate(true);
      setTimeout(() => setAnimate(false), 2000); // Reset animation after 1 second
    }
  }, [randomStudent]);

  return (
    <div className="mt-8 text-center">
      {showConfetti && <Confetti />}
      <button
        type="button"
        className="inline-flex items-center rounded-lg border border-transparent bg-purple-500 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        onClick={() => {
          randomStudent?.name &&
            setNames((prev) => [...prev, randomStudent.name]);
          generateRandomStudent();
        }}
      >
        Generate
      </button>
      <div
        className={`animate m-5 rounded-md border-2  border-purple-900 p-10 text-7xl font-bold text-purple-900 `}
      >
        <span className={`${animate ? "animate-pop-in" : ""}`}>
          {randomStudent?.name ?? "No student generated yet"}
        </span>
      </div>

      <button
        type="button"
        className="inline-flex items-center rounded-lg border border-transparent bg-purple-500 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        onClick={() => setShowPreviousNames((prev) => !prev)}
      >
        {showPreviousNames ? "Hide" : "Show"} Previous Names
      </button>

      {showPreviousNames && (
        <div className="mt-6">
          {names.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-purple-900">
                Previous Names
              </h2>
              <ul className="mt-3 space-y-2">
                {names.map((name, index) => (
                  <li
                    key={name + index.toString()}
                    className="text-2xl font-medium text-purple-900"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// create a wheel spin animaiton in framer motion

const WheelPicker = ({
  generateRandomStudent,
  randomStudentIndex,
  allStudents,
  setRandomStudentIndex
}: {
  generateRandomStudent: () => void;
  randomStudentIndex: number | null;
  allStudents: Student[];
  setRandomStudentIndex : React.Dispatch<React.SetStateAction<number | null>>;
}) => {
    const wheelVars = {
      '--nb-item': allStudents.length,
      '--selected-item': randomStudentIndex ? randomStudentIndex : "",
    } as React.CSSProperties;
    const spinning = randomStudentIndex !== null ? 'spinning' : '';
  
    const selectItem = () => {
      if(randomStudentIndex === null)
      generateRandomStudent()
      else{
        setRandomStudentIndex(null)
        setTimeout(generateRandomStudent, 1)
      }
    }
    {
  
      return(
        <div>
          <div className="wheel-container">
            <div className={`wheel ${spinning}`} style={wheelVars} onClick={selectItem}>
              {allStudents.map((item, index) => (
                <div className="wheel-item" key={item.id} style={{ '--item-nb': index } as React.CSSProperties}>
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
      
    }
    // CAN BE ACCESSED AS availbleStudents.data
  
    return <div>{/* content */}</div>;
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

  const classes = await prisma.class.findMany({
    where: {
      teacherId: session.user.id,
    },
  });

  return {
    props: {
      classes,
    },
  };
};

export default RandomPage;
