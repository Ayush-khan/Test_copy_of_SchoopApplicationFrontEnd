import { faChevronLeft, faChevronRight, faLightbulb, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function InfoCard({ slides, setOpen, stepp = 0 }) {
  const [step, setStep] = useState(stepp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white w-[90%] max-w-md rounded-xl shadow-2xl overflow-hidden">

        {/* Top accent */}
        <div style={{background: '#C03078'}} className="h-1" />

        {/* Close button */}
        <span
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <FontAwesomeIcon icon={faXmark} size="lg" />
        </span>

        {/* Content */}
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <FontAwesomeIcon icon={faLightbulb} className="text-yellow-500" />
            {slides[step].title}
          </h4>


          <div className="mt-4 text-gray-700">
            {slides[step].content}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-between bg-gray-50">
          <button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="btn btn-outline-primary text-sm font-medium rounded-md transition disabled:btn-outline-secondary disabled:opacity-40 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            Previous
          </button>
          <span className="text-xs text-gray-400">
            Step {step + 1} of {slides.length}
          </span>
          {step === slides.length - 1 ? (
            <button
              onClick={() => setOpen(false)}
              className="btn btn-outline-primary text-sm font-medium rounded-md transition flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faXmark} size="lg" />
              End
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              className="btn btn-outline-primary text-sm font-medium rounded-md transition flex items-center gap-2"
            >
              Next
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default InfoCard;
