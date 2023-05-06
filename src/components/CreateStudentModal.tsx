import { useState, type FormEvent } from "react";
import { api } from "~/utils/api";

const CreateStudentModal = ({
  closeModal,
  classId,
}: {
  closeModal: () => void;
  classId: string;
}) => {
  const [studentName, setStudentName] = useState("");

  const createStudent = api.student.create.useMutation();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Call your API to create the student
    createStudent.mutate(
      {
        name: studentName,
        classId: classId,
      },
      {
        onSuccess: () => {
          closeModal();
        },
      }
    );

    // Clear the input
    setStudentName("");

    // Close the modal
  };

  return (
    <div
      className="fixed inset-0 z-10 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={closeModal}
    >
      <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div
          className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3
                  className="text-lg font-medium leading-6 text-gray-900"
                  id="modal-title"
                >
                  Create a new student
                </h3>
                <div className="mt-2">
                  <form
                    onSubmit={(e: FormEvent<HTMLFormElement>) =>
                      handleSubmit(e)
                    }
                  >
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                      placeholder="Student name"
                    />
                    <button
                      type="submit"
                      className="focus:shadow-outline mt-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    >
                      Create student
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStudentModal;
