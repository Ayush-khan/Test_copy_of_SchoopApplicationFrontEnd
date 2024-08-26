// AllotSubjectTab.js
import React from "react";
import { RxCross1 } from "react-icons/rx";

const AllotSubjectTab = ({
  ClassNameDropdown,
  handleChangeClassSectionForAllotSubjectTab,
  classesforsubjectallot,
  allotSubjectTabData,
  handleDivisionChange,
  selectedDivisions,
  uniqueDivisions,
  handleSubjectChange,
  selectedSubjects,
  uniqueSubjects,
  handleSubmitAllotment,
  handleAllotSubjectCloseModal,
}) => {
  return (
    <div>
      <div className="container mb-4">
        <div className="card-header flex justify-between items-center">
          {/* Optional header content */}
        </div>
        <div className="w-full mx-auto">
          <div className="form-group  flex justify-center gap-x-1 md:gap-x-6">
            <label
              htmlFor="classSection"
              className="w-1/4 pt-2 items-center text-center"
            >
              Select class <span className="text-red-500">*</span>
            </label>
            <select
              id="classSection"
              className="border w-full md:w-[30%] h-10 md:h-auto rounded-md px-3 py-2  mr-2"
              value={ClassNameDropdown}
              onChange={handleChangeClassSectionForAllotSubjectTab}
            >
              <option value="">Select</option>
              {classesforsubjectallot.length === 0 ? (
                <option value="">No classes available</option>
              ) : (
                classesforsubjectallot.map((cls) => (
                  <option key={cls.classId} value={cls.class_id}>
                    {` ${cls?.name}`}
                  </option>
                ))
              )}
            </select>
          </div>
          {allotSubjectTabData.length > 0 && (
            <div className="container mt-4">
              <div className="card mx-auto relative left-1 lg:w-full shadow-lg">
                <div className="card-header flex justify-between items-center">
                  <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
                    Allot Subjects
                  </h3>
                  <RxCross1
                    className="float-end relative top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    type="button"
                    onClick={handleAllotSubjectCloseModal}
                  />
                </div>
                <div className="card-body w-full">
                  <div className="lg:overflow-x-hidden">
                    <div className="mb-4 flex gap-x-4">
                      <h5 className="px-2 mt-2 lg:px-3 py-2 text-[1em] text-gray-700">
                        Select divisions <span className="text-red-500">*</span>
                      </h5>
                      {uniqueDivisions.length > 0 && (
                        <>
                          {uniqueDivisions.map((division) => (
                            <div key={division} className="pt-3">
                              <label>
                                <input
                                  type="checkbox"
                                  className="mr-0.5 shadow-lg"
                                  value={division.id}
                                  checked={selectedDivisions.includes(
                                    division.name
                                  )}
                                  onChange={handleDivisionChange}
                                />
                                <span className="font-semibold text-gray-600">
                                  {division}
                                </span>
                              </label>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                    <div className="flex">
                      <h5 className="px-2 relative -top-2 lg:px-3 py-2 text-[1em] text-gray-700">
                        Select subjects <span className="text-red-500">*</span>
                      </h5>
                      <div className="mb-4 grid grid-cols-5 mx-4 w-[75%]">
                        {uniqueSubjects.map((subject) => (
                          <div key={subject}>
                            <label>
                              <input
                                type="checkbox"
                                className="mr-0.5 shadow-lg"
                                value={subject.id}
                                checked={selectedSubjects.includes(subject.id)}
                                onChange={handleSubjectChange}
                              />
                              <span className="font-semibold text-gray-600">
                                {subject}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end p-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 mb-2"
                    onClick={handleSubmitAllotment}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllotSubjectTab;
