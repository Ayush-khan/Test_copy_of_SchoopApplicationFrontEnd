export default function CommonTable({ periods, subjects }) {
  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Periods</th>
            <th className="border p-2">Monday</th>
            <th className="border p-2">Tuesday</th>
            <th className="border p-2">Wednesday</th>
            <th className="border p-2">Thursday</th>
            <th className="border p-2">Friday</th>
            <th className="border p-2">Saturday</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: periods }).map((_, idx) => (
            <tr key={idx}>
              <td className="border p-2">{idx + 1}</td>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day) => (
                <td key={day} className="border p-2">
                  <select className="border p-1 w-full">
                    <option value="">Select Subject</option>
                    {subjects.map((subject, i) => (
                      <option key={i} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
