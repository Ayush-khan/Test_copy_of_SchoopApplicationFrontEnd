

// src/helpers/helpInfoFlow.js

export const HELP_INFO_SLIDES = (navigate) => [
  {
    key: "exams",
    title: "Exams",
    content: (
      <div className="space-y-4 text-sm">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
          <p className="font-medium text-gray-800">Overview</p>
          <p className="text-gray-600">
            Create and manage exams that will be used for marks entry and report cards.
          </p>
        </div>

        <div>
          <p className="font-medium text-gray-800 mb-1">What you can define</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Exam name and term (Term 1 / Term 2)</li>
            <li>Start date, end date, and open day date</li>
            <li>Optional comments for internal reference</li>
          </ul>
        </div>

        <div>
          <p className="font-medium text-gray-800 mb-1">Management</p>
          <p className="text-gray-600">
            All exams are listed with edit and delete options.
          </p>
        </div>

        <div className="pt-2">
          <a
            onClick={() => navigate("/Exams")}
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline cursor-pointer"
          >
            Go to Exams
          </a>
        </div>
      </div>
    )
  },
  {
    key: "grades",
    title: "Grades",
    content: (
      <div className="space-y-4 text-sm">
        <div className="bg-green-50 border border-green-100 rounded-md p-3">
          <p className="font-medium text-gray-800">Overview</p>
          <p className="text-gray-600">
            Define grading rules based on marks range.
          </p>
        </div>

        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Grade name (A, B, C)</li>
          <li>Scholastic / Co-Scholastic</li>
          <li>Marks range</li>
          <li>Applicable classes</li>
        </ul>

        <div className="pt-2">
          <a
            onClick={() => navigate("/grades")}
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline cursor-pointer"
          >
            Go to Grades
          </a>
        </div>
      </div>
    )
  },
  {
    key: "marksHeading",
    title: "Marks Headings",
    content: (
      <div className="space-y-4 text-sm">
        <div className="bg-purple-50 border border-purple-100 rounded-md p-3">
          <p className="font-medium text-gray-800">Overview</p>
          <p className="text-gray-600">
            Create headings under which marks will be entered.
          </p>
        </div>

        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Marks heading name</li>
          <li>Sequence order</li>
          <li>Written exam flag</li>
        </ul>

        <div className="pt-2">
          <a
            onClick={() => navigate("/marksHeading")}
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline cursor-pointer"
          >
            Go to Marks Headings
          </a>
        </div>
      </div>
    )
  },
  {
    key: "allotMarks",
    title: "Allot Marks Headings",
    content: (
      <div className="space-y-4 text-sm">
        <div className="bg-orange-50 border border-orange-100 rounded-md p-3">
          <p className="font-medium text-gray-800">Overview</p>
          <p className="text-gray-600">
            Map marks headings to exams based on class and subject.
          </p>
        </div>

        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Select class</li>
          <li>Select subject</li>
          <li>Select exam</li>
          <li>Set highest marks</li>
          <li>Set report card marks</li>
        </ul>

        <div className="pt-2">
          <a
            onClick={() => navigate("/allot_Marks_Heading")}
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline cursor-pointer"
          >
            Go to Allot Marks Headings
          </a>
        </div>
      </div>
    )
  }
];

/**
 * Helper to start InfoCard from a specific step
 */
export const getHelpSlidesWithStep = (navigate, startKey) => {
  const slides = HELP_INFO_SLIDES(navigate);
  const step = slides.findIndex(s => s.key === startKey);
  return {
    slides,
    stepp: step === -1 ? 0 : step
  };
};
