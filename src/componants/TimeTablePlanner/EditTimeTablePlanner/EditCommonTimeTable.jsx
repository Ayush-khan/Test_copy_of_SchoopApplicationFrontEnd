import { useState, useEffect } from "react";
import LoaderStyle from "../../common/LoaderFinal/LoaderStyle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditCommonTimeTable({
  periods,
  subjects,
  loading,
  selectedSubjects,
  handleTableData,
  activeTab,
  tabs,
  rowCounts,
  allocatedPeriods,
  usedPeriods,
  setUsedPeriods,
  classSectionNames,
}) {
  const [localSelectedSubjects, setLocalSelectedSubjects] = useState({});
  const [globalSubjectSelection, setGlobalSubjectSelection] = useState({});

  // const classSectionMapping = {
  //   455: "1-D",
  //   458: "2-C",
  //   462: "3-C",
  //   465: "4-B",
  //   471: "5-D",
  //   473: "6-B",
  //   474: "6-C",
  //   476: "7-A",
  //   479: "7-D",
  //   482: "8-C",
  //   483: "8-D",
  //   485: "9-B",
  //   488: "10-A",
  //   490: "10-C",
  //   492: "11-A",
  //   452: "1-A",
  //   453: "1-B",
  //   454: "1-C",
  //   456: "2-A",
  //   457: "2-B",
  //   459: "2-D",
  //   460: "3-A",
  //   461: "3-B",
  //   463: "3-D",
  //   464: "4-A",
  //   466: "4-C",
  //   467: "4-D",
  //   468: "5-A",
  //   469: "5-B",
  //   470: "5-C",
  //   472: "6-A",
  //   475: "6-D",
  //   477: "7-B",
  //   478: "7-C",
  //   480: "8-A",
  //   487: "9-D",
  //   484: "9-A",
  //   489: "10-B",
  //   491: "10-D",
  //   493: "11-B",
  //   494: "11-C",
  //   495: "11-D",
  //   496: "12-A",
  //   497: "12-B",
  //   498: "12-C",
  //   499: "12-D",
  // };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const classId = activeTabData?.class_id;
  const sectionId = activeTabData?.section_id;
  const key = `${classId}-${sectionId}`;

  useEffect(() => {
    if (!periods || !Array.isArray(periods)) return;

    const updated = {};
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    days.forEach((day) => {
      const dayPeriods = periods.filter((period) => period.day === day);
      if (!updated[day]) updated[day] = {};

      dayPeriods.forEach((period) => {
        updated[day][period.period_no] = {
          id: period.subject_id || "",
          name: period.subject || "",
        };
      });
    });

    setLocalSelectedSubjects(updated);
    setGlobalSubjectSelection((prev) => ({
      ...prev,
      [key]: updated,
    }));
  }, [periods]);

  const isAnySubjectAlreadySelectedInOtherSection = (day, period_no) => {
    for (const sectionKey in globalSubjectSelection) {
      if (sectionKey === key) continue;
      const sectionData = globalSubjectSelection[sectionKey];
      const selectedSubject = sectionData[day]?.[period_no];
      if (selectedSubject?.id && selectedSubject.id !== "") {
        return true;
      }
    }
    return false;
  };

  const handleSubjectChange = (day, period_no, selectedSubject) => {
    if (!classId || !sectionId) return;
    const currentSelectedSubject = localSelectedSubjects?.[day]?.[period_no];

    if (
      selectedSubject.id &&
      isAnySubjectAlreadySelectedInOtherSection(day, period_no)
    ) {
      let conflictingClassSection = "";
      for (const sectionKey in globalSubjectSelection) {
        if (sectionKey === key) continue;
        const sectionData = globalSubjectSelection[sectionKey];
        const selectedSubjectInOtherSection = sectionData[day]?.[period_no];
        if (selectedSubjectInOtherSection?.id) {
          const [, conflictingSectionId] = sectionKey.split("-");
          const classSectionName = classSectionNames[conflictingSectionId];
          conflictingClassSection = `${classSectionName}`;
          break;
        }
      }

      toast.error(
        <div>
          <strong style={{ color: "#e74c3c" }}>
            Subject already selected in another section (
            {conflictingClassSection})
          </strong>
          <br />
          <span style={{ color: "#2980b9" }}>
            for {day}, Period {period_no}.
          </span>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      return;
    }

    const updatedSubjects = {
      ...localSelectedSubjects,
      [day]: {
        ...(localSelectedSubjects[day] || {}),
        [period_no]: selectedSubject.id
          ? { id: selectedSubject.id, name: selectedSubject.name }
          : null,
      },
    };

    if (selectedSubject.id) {
      if (!currentSelectedSubject || currentSelectedSubject.id === "") {
        setUsedPeriods((prev) => (prev < allocatedPeriods ? prev + 1 : prev));
      }
    } else {
      if (currentSelectedSubject) {
        setUsedPeriods((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }

    setLocalSelectedSubjects(updatedSubjects);
    setGlobalSubjectSelection((prevState) => ({
      ...prevState,
      [key]: updatedSubjects,
    }));

    handleTableData(classId, sectionId, day, period_no, selectedSubject);
  };

  const renderRows = (days) => {
    const rows = [];
    const maxRows = Math.max(rowCounts.mon_fri, rowCounts.sat);

    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      rows.push(
        <tr key={`row-${rowIndex}`}>
          <td className="border p-2 text-center bg-gray-100 w-16">
            {rowIndex + 1}
          </td>

          {days.map((day) => {
            if (day === "Saturday" && rowIndex >= rowCounts.sat) {
              return <td key={day} className="border p-2"></td>;
            }

            const selectedPeriod = localSelectedSubjects?.[day]?.[rowIndex + 1];
            const periodData = periods.find(
              (period) =>
                period.day === day && period.period_no === rowIndex + 1
            );

            const subjectName = periodData ? periodData.subject : "";
            const teacherName = periodData ? periodData.teachers : "";

            const handleSubjectSelection = (e) => {
              const selectedSub = {
                id: e.target.value,
                name:
                  subjects.find((s) => s.sm_id === e.target.value)
                    ?.subjectname || "",
              };
              handleSubjectChange(day, rowIndex + 1, selectedSub);
            };

            const isSelectedInOtherSection =
              isAnySubjectAlreadySelectedInOtherSection(day, rowIndex + 1);
            const highlightClass =
              selectedPeriod?.id === ""
                ? ""
                : isSelectedInOtherSection
                ? "bg-pink-100"
                : "";

            return (
              <td key={day} className="border p-2">
                <div className="flex text-center flex-col w-full text-sm text-gray-600">
                  {subjectName && teacherName && (
                    <>
                      <div className="mb-1">
                        <span className="break-words text-xs font-medium">
                          {subjectName}
                        </span>
                      </div>
                      <div>
                        <span className="break-words text-pink-600 font-medium text-xs">
                          {teacherName}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <select
                  className={`border p-1 w-full mt-2 ${highlightClass}`}
                  value={selectedPeriod?.id || ""}
                  onChange={handleSubjectSelection}
                  disabled={
                    usedPeriods >= allocatedPeriods && !selectedPeriod?.id
                  }
                >
                  <option value="">Select</option>
                  {subjects.map((subject) => (
                    <option key={subject.subject_id} value={subject.sm_id}>
                      {subject.subjectname}
                    </option>
                  ))}
                </select>
              </td>
            );
          })}
        </tr>
      );
    }

    return rows;
  };

  const daysForTable = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    ...(rowCounts.sat > 0 ? ["Saturday"] : []),
  ];

  const renderTable = () => {
    if (!periods?.length || !subjects.length || !rowCounts?.mon_fri) {
      return (
        <div className="flex w-[100%]  text-center  justify-center mt-14 flex-col items-center space-y-2">
          <span className="text-4xl animate-bounce">⚠️</span>
          <p className="text-xl font-medium text-red-700 tracking-wide drop-shadow-md">
            Oops! No data found..
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-200 w-16 text-center">
                Period
              </th>
              {daysForTable.map((day) => (
                <th key={day} className="border p-2 bg-gray-200 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderRows(daysForTable)}</tbody>
        </table>
        <ToastContainer />
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="mt-24 border-1 border-white flex justify-center items-center p-5 ">
          <LoaderStyle />
        </div>
      ) : (
        renderTable()
      )}
      <ToastContainer />
    </div>
  );
}
