// This is the
import styles from "../CSS/Notification.module.css";

export default function NotificationsPanel() {
  return (
    <div className={`${styles.notification} `}>
      <h6 className={styles.notificationHeading}>General Instructions:</h6>
      <ul className={` mb-4 font-medium ${styles.list}`}>
        <li>
          The application can be accessed from the school website by clicking on
          the "ACEVENTURA LOGIN" menu.
        </li>
        <li>Please login to the application and change your password.</li>
        <li>
          If you haven’t received your user id. Please send an email to
          supportsacs@aceventura.in with the “Name of the student, Class,
          Division and Roll no.”
        </li>
        <li>
          Once you login there are "Help" videos provided in the application to
          guide you with the use of application.
        </li>
        <li>
          The application is best viewed on Mozilla Firefox, Google Chrome
          browser and on any mobile device.
        </li>
        <li>
          For any change in “Student name, Middle Name, Surname, Father name,
          Mother name, Date of birth, Date of admission, GRN No., Religion,
          Caste and Category”, please send an email to
          nutan@arnoldcentralschool.org
        </li>
        <li>
          For any query related to the application, please send an email to
          supportsacs@aceventura.in
        </li>
      </ul>
    </div>
  );
}
