<table className="table-auto border-collapse border border-gray-300 w-full">
  <thead className="bg-gray-200">
    <tr>
      <th className="border p-2 font-semibold text-center">Sr No.</th>
      {timetable.map((day, index) => (
        <th key={index} className="border p-2 font-semibold text-center">
          {day.day}
        </th>
      ))}
    </tr>
  </thead>
  <tbody className="bg-gray-50">
    {timetable.length > 0 &&
      [...Array(Math.max(...timetable.map((day) => day.lectures.length)))].map(
        (_, lectureIndex) => (
          <tr key={lectureIndex}>
            <td className="border p-1 text-center">{lectureIndex + 1}</td>

            {timetable.map((day, dayIndex) => (
              <td key={dayIndex} className="border border-gray-300 p-2">
                {/*Ensure lecture exists for this day */}
                {console.log(
                  "day.lectures[lectureIndex]--->Start",
                  day.lectures[lectureIndex]?.["Time In"]
                )}
                {console.log("Lecture Data:", day.lectures[lectureIndex])}
                {console.log(
                  "Time In--->:",
                  day.lectures[lectureIndex]?.["Time In"]
                )}
                {console.log(
                  "Time Out--->:",
                  day.lectures[lectureIndex]?.["Time Out"]
                )}
                {console.log(
                  "Sat Time In--->:",
                  day.lectures[lectureIndex]?.["Sat Time In"]
                )}
                {console.log(
                  "Sat Time Out--->:",
                  day.lectures[lectureIndex]?.["Sat Time Out"]
                )}
                {day.lectures[lectureIndex] ? (
                  <>
                    {day.lectures[lectureIndex] &&
                    (day.lectures[lectureIndex]?.["Time In"] == "" ||
                      day.lectures[lectureIndex]?.["Time Out"] == "" ||
                      day.lectures[lectureIndex]?.["Sat Time In"] == " " ||
                      day.lectures[lectureIndex]?.["Sat Time Out"] == " ") ? (
                      <>
                        {/* Mon-Fri Time Dropdowns */}
                        {dayIndex < 5 ? (
                          <>
                            <select
                              className="w-full px-1 py-1 border border-gray-300"
                              value={
                                day.lectures[lectureIndex]?.["Time In"] || ""
                              }
                              onChange={(e) =>
                                handleStartSelect(
                                  dayIndex,
                                  lectureIndex,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select Time-In</option>
                              {timeOptions.map((time, i) => (
                                <option key={i} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                            <select
                              className="w-full px-1 py-1 border border-gray-300 mt-1"
                              value={
                                day.lectures[lectureIndex]?.["Time Out"] || ""
                              }
                              onChange={(e) =>
                                handleEndSelect(
                                  dayIndex,
                                  lectureIndex,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select Time-Out</option>
                              {getFilteredEndTimeOptions(
                                dayIndex,
                                lectureIndex
                              ).map((time, i) => (
                                <option key={i} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </>
                        ) : (
                          // Saturday Time Dropdowns
                          <>
                            <select
                              className="w-full px-1 py-1 border border-gray-300"
                              value={
                                day.lectures[lectureIndex]?.["Sat Time In"] ||
                                ""
                              }
                              onChange={(e) =>
                                handleSatStartSelect(
                                  dayIndex,
                                  lectureIndex,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select Time-In</option>
                              {satTimeOptions.map((time, i) => (
                                <option key={i} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                            <select
                              className="w-full px-1 py-1 border border-gray-300 mt-1"
                              value={
                                day.lectures[lectureIndex]?.["Sat Time Out"] ||
                                ""
                              }
                              onChange={(e) =>
                                handleSatEndSelect(
                                  dayIndex,
                                  lectureIndex,
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select Time-Out</option>
                              {getFilteredSatEndTimeOptions(
                                dayIndex,
                                lectureIndex
                              ).map((time, i) => (
                                <option key={i} value={time}>
                                  {time}
                                </option>
                              ))}
                            </select>
                          </>
                        )}
                      </>
                    ) : (
                      // Only show Subject Dropdown when there is a lecture and no time fields exist
                      day.lectures[lectureIndex]?.subject && (
                        <select
                          className="w-full px-1 py-1 border border-gray-300 mt-1"
                          value={
                            selectedSubjects[dayIndex]?.lectures[lectureIndex]
                              ?.subject?.sm_id || ""
                          }
                          onChange={(e) =>
                            handleSubjectSelect(
                              dayIndex,
                              lectureIndex,
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Subject</option>
                          {subjects.map((subject, i) => (
                            <option key={i} value={subject.sm_id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      )
                    )}
                  </>
                ) : (
                  "" // Hide empty cells
                )}
              </td>
            ))}
          </tr>
        )
      )}
  </tbody>
</table>;
