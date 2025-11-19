// // // This is the
// // import styles from "../CSS/Notification.module.css";

// // export default function NotificationsPanel() {
// //   return (
// //     <div className={`${styles.notification} `}>
// //       <h6 className={styles.notificationHeading}>General Instructions:</h6>
// //       <ul className={` mb-4 font-medium ${styles.list}`}>
// //         <li>
// //           The application can be accessed from the school website by clicking on
// //           the "ACEVENTURA LOGIN" menu.
// //         </li>
// //         <li>Please login to the application and change your password.</li>
// //         <li>
// //           If you haven’t received your user id. Please send an email to
// //           supportsacs@aceventura.in with the “Name of the student, Class,
// //           Division and Roll no.”
// //         </li>
// //         <li>
// //           Once you login there are "Help" videos provided in the application to
// //           guide you with the use of application.
// //         </li>
// //         <li>
// //           The application is best viewed on Mozilla Firefox, Google Chrome
// //           browser and on any mobile device.
// //         </li>
// //         <li>
// //           For any change in “Student name, Middle Name, Surname, Father name,
// //           Mother name, Date of birth, Date of admission, GRN No., Religion,
// //           Caste and Category”, please send an email to
// //           <br />
// //           nutan@arnoldcentralschool.org
// //         </li>
// //         <li>
// //           For any query related to the application, please send an email to
// //           <br />
// //           supportsacs@aceventura.in
// //         </li>
// //       </ul>
// //     </div>
// //   );
// // }

// import { useEffect, useState } from "react";
// import styles from "../CSS/Notification.module.css";

// // 🍪 Helper to get a cookie value
// const getCookie = (name) => {
//   const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
//   return match ? decodeURIComponent(match[2]) : null;
// };

// export default function NotificationsPanel() {
//   const [instructions, setInstructions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchInstructions = async () => {
//       const shortName = getCookie("short_name");

//       if (!shortName) {
//         console.warn("short_name cookie not found.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch(
//           `https://sms.evolvu.in/arnolds_test/public/api/get_generalinstructions?short_name=${shortName}`
//         );
//         const result = await response.json();

//         if (result.success && Array.isArray(result.data)) {
//           // Filter only active instructions and map to text
//           const activeInstructions = result.data
//             .filter((item) => item.is_active === "Y")
//             .map((item) => item.general_instructions);

//           setInstructions(activeInstructions);
//         } else {
//           console.error("Unexpected API response:", result);
//         }
//       } catch (error) {
//         console.error("Failed to fetch general instructions:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInstructions();
//   }, []);

//   return (
//     <div className={styles.notification}>
//       <h6 className={`${styles.notificationHeading} z-10`}>
//         General Instructions:
//       </h6>

//       {loading ? (
//         <p className="text-gray-500">Loading instructions...</p>
//       ) : instructions.length > 0 ? (
//         <ul className={`mb-4 relative -top-3 font-medium ${styles.list}`}>
//           {instructions.map((instruction, index) => (
//             <li key={index}>{instruction}</li>
//           ))}
//         </ul>
//       ) : (
//         <p className="text-gray-500">No instructions available.</p>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import styles from "../CSS/Notification.module.css";

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

export default function NotificationsPanel() {
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchInstructions = async () => {
      const shortName = getCookie("short_name");
      console.log("Using short_name:", shortName); // debug

      if (!shortName) {
        console.warn("short_name cookie not found.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/get_generalinstructions?short_name=${shortName}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const activeInstructions = result.data
            .filter((item) => item.is_active === "Y")
            .map((item) => item.general_instructions);

          setInstructions(activeInstructions);
        } else {
          console.warn("Unexpected API response:", result);
        }
      } catch (error) {
        console.error("Failed to fetch general instructions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, []);

  return (
    <div className={styles.notification}>
      <h6 className={`${styles.notificationHeading} z-10`}>
        General Instructions:
      </h6>

      {loading ? (
        <p className="text-gray-500">Loading instructions...</p>
      ) : instructions.length > 0 ? (
        <ul className={`mb-4 relative -top-3 font-medium ${styles.list}`}>
          {instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm  text-red-500 font-medium md:text-xl border border-dashed  p-3 rounded text-center">
          No instructions available.
        </p>
      )}
    </div>
  );
}
