import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

function ImpersonationBanner({ data, onExit, loading = false }) {
  if (!data) return null;

  return (
    <div className="fixed bottom-0 z-[9999] w-full bg-red-600 text-white px-3 py-2 flex items-center justify-between text-xs shadow-sm">
      {/* Message */}
      <div className="flex items-center gap-2 truncate">
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className="animate-pulse"
        />
        <span className="truncate">
          Impersonating: {" "}
          <strong>
            {data.user.name} ({data.user.user_id})
          </strong>
        </span>
      </div>

      {/* Exit */}
      <button
        onClick={onExit}
        disabled={loading}
        className="flex items-center gap-1 bg-white/90 text-red-700 px-2 py-0.5 rounded text-xs font-semibold hover:bg-white transition disabled:opacity-60"
      >
        <FontAwesomeIcon icon={faRightFromBracket} />
        {loading ? "Exiting..." : "Exit"}
      </button>
    </div>
  );
}

export default ImpersonationBanner;
