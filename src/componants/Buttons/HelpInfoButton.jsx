import { faCircleInfo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

function HelpInfoButton({setOpen}) {
	return (
		<span
			onClick={() => setOpen(true)}
			aria-label="Info"
			className="
				text-black-600
				active:text-blue-800
				focus:text-blue-600
				focus:outline-none
				focus:ring-0
				cursor-pointer
			"
			>
			<FontAwesomeIcon icon={faCircleInfo} />
		</span>
	)
}

export default HelpInfoButton
