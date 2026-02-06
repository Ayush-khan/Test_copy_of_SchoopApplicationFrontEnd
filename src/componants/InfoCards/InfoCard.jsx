import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function InfoCard({ slides , setOpen }) {

	const [step, setStep] = useState(0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-[90%] max-w-md shadow-lg p-6 relative">
                {/* Close button */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <FontAwesomeIcon icon={faXmark} size="lg" />
                </button>

                {/* Slide content */}
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {slides[step].title}
                </h4>

                <p className="text-sm text-gray-600 mb-6">
                    {slides[step].content}
                </p>

                {/* Footer controls */}
                <div className="flex items-center justify-between">
                    <button
                        disabled={step === 0}
                        onClick={() => setStep(step - 1)}
                        className="text-black-600
					  btn btn-primary
						hover:text-gray-100
						active:text-blue-800
						focus:text-blue-600"
                    >
                        Previous
                    </button>

                    <span className="text-xs text-gray-500">
                        {step + 1} / {slides.length}
                    </span>

                    {step === slides.length - 1 ? (
                        <button
                            onClick={() => setOpen(false)}
                            className="
						px-4 py-2 text-sm
						bg-blue-600 text-white
						hover:bg-blue-700 hover:text-gray-100
						rounded-md
						transition-colors duration-200
					  "
                        >
                            Done
                        </button>
                    ) : (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InfoCard;
