/* Main navbar link styling
.custom-nav-dropdown .nav-dropdown-title {
  color: black;
  font-weight: 400;
  display: inline-block;
  transition: background-color 0.2s ease;
}


.nav-dropdown-title:hover {
  font-weight: 400;
  background-color: #408cdd !important;
  color: white !important;
  border-right: 2px double rgb(207, 10, 102);
  border-left: 2px double rgb(207, 10, 102);
}


.custom-submenu .dropdown-menu {
  background-color: #c1d1e0 !important;
  display: none;
  margin-top: 0;
  border-radius: 4px;
  transition: all 0.3s ease-in-out;
}


.custom-submenu:hover > .dropdown-menu {
  display: block !important;
  opacity: 1;
  visibility: visible;
}


.custom-nav-dropdown .dropdown-item {
  color: black;
  font-weight: 500;
  background-color: white;

  transition: background-color 0.2s ease;
}

.custom-nav-dropdown .dropdown-item:hover {
  color: white !important;
  background-color: #408cdd !important;
  font-weight: 400 !important;

  font-size: 14px !important;

}


.nav-dropdown-titleSubUnder {
  display: inline-block;
  width: 100%;

  color: black;
  font-weight: 500;
  transition: background-color 0.2s ease;
}


.nav-dropdown-titleSubUnder:hover {
  background-color: #408cdd !important;
  color: white !important;
}


.custom-submenu .dropdown-item {
  color: black !important;

  font-weight: 500;
  font-size: 14px !important;
  background-color: white !important;
}


.custom-submenu .dropdown-item:hover {
  background-color: #408cdd !important;
  color: white !important;
}


.custom-submenu {
  position: relative;
}

.custom-submenu .dropdown-menu {
  top: 0;
  left: 100%;
  margin-top: -1px;
}

.nav-title-top {
  color: black;
  font-weight: 900;
  padding: 0px 10px;
  display: inline-block;
}


.nav-title-sub {
  display: inline-block;
  width: 100%;

  color: black;
  font-weight: 500;
  transition: background-color 0.2s ease;
}


.nav-title-sub:hover {
  background-color: #408cdd !important;
  color: white !important;
} */
/* above code is previous code working fine now the below code is the design for dymanic navbar */

/* Main navbar link styling */
.custom-nav-dropdown .nav-dropdown-title {
  color: black;
  font-weight: 400;
  display: inline-block;
  transition: background-color 0.2s ease;
}
.nav-dropdown-title {
  font-weight: 900;
}

/*  Hover: only background color changes */
/* .nav-dropdown-title:hover {
  font-weight: 400;
  background-color: #408cdd !important;
  color: white !important;
  border-right: 2px double rgb(207, 10, 102);
  border-left: 2px double rgb(207, 10, 102);
} */

.nav-dropdown-sub {
  width: 100px;
  color: black;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

/* .nav-dropdown-sub:hover {
  font-weight: 400;
  background-color: #408cdd !important;
  color: white;
  border-right: 2px double rgb(207, 10, 102);
  border-left: 2px double rgb(207, 10, 102);
} */

/* Dropdown menu default background */
.custom-submenu .dropdown-menu {
  background-color: #c1d1e0 !important;
  display: none;
  margin-top: 0;
  border-radius: 4px;
  transition: all 0.3s ease-in-out;
}

/* Show submenu on hover */
.custom-submenu:hover > .dropdown-menu {
  display: block !important;
  opacity: 1;
  visibility: visible;
}

/* Top-level dropdown items */
.custom-nav-dropdown .dropdown-item {
  color: black;
  font-weight: 500;
  background-color: white;
  transition: background-color 0.2s ease;
}

.custom-nav-dropdown .dropdown-item:hover {
  color: white !important;
  background-color: #408cdd !important;
  font-weight: 400 !important;
  font-size: 14px !important;
}

/* Nested dropdown title styling */
.nav-dropdown-titleSubUnderIs {
  display: inline-block;
  width: 100%;
  color: black;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

/* Hover: only background color changes */
.nav-dropdown-titleSubUnderIs:hover {
  background-color: #408cdd !important;
  color: white;
}
.custom-submenuIs {
  /* color: black !important; */
  font-weight: 500;
  font-size: 14px !important;
  background-color: white !important;
}
.custom-submenuIs:hover {
  background-color: #408cdd !important;
  color: white !important;
}

/* Submenu dropdown items */
.custom-submenu .dropdown-item {
  color: black !important;
  font-weight: 500;
  font-size: 14px !important;
  background-color: white !important;
}

/*  Hover: only background color changes */
.custom-submenu .dropdown-item:hover {
  background-color: #408cdd !important;
  color: white !important;
}

/* Nested submenu positioning */
.custom-submenu {
  position: relative;
}

.custom-submenu .dropdown-menu {
  top: 0;
  left: 100%;
  margin-top: -1px;
}

/* Top-level menu title */
.nav-title-top {
  color: black;
  font-weight: 900;
  padding: 0px 6px;
  display: inline-block;
}
.nav-title-topIs {
  color: black;
  font-weight: 900;
  padding: 0px 6px;
  display: inline-block;
}

/* Submenu title */
.nav-title-sub {
  display: inline-block;
  width: 100%;
  /* padding: 6px 10px; */
  color: black;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

/*  Hover: only background color changes */
.nav-title-sub:hover {
  background-color: #408cdd !important;
  color: white !important;
  border-right: 2px double rgb(207, 10, 102);
  border-left: 2px double rgb(207, 10, 102);
}

.nav-dropdown-sub-new > .dropdown-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  /* or a fixed width if needed */
  color: black !important;
  background-color: transparent !important;
}

.nav-dropdown-sub-new > .dropdown-toggle::after {
  margin-left: 0 !important;
  /* remove Bootstrap's spacing */
  position: static !important;
}
.nav-dropdown-sub-new {
  color: black;
}

.nav-dropdown-sub-new:hover {
  font-weight: 400;
  background-color: #408cdd !important;
  color: white !important;
  border-right: 2px double rgb(207, 10, 102);
  border-left: 2px double rgb(207, 10, 102);
}
.nav-dropdown-sub-new-Dynamic {
  color: black;
}
.nav-dropdown-sub-new:hover .nav-dropdown-sub-new-Dynamic {
  color: white !important;
}
.custom-hover-styleForchildLevel {
  color: black;
}

.custom-hover-styleForchildLevel:hover {
  color: white !important;
}
/* This one for the scoller in the navbar in dynamic for student in the report */
.dropdown-scrollableForChild {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}
/* Apply max height and scrolling to dropdown items */
.scrollable-parent .dropdown-menu {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}
/* Ensures submenus open to the left */
/* Forces 3rd-level submenu to open to the right of its parent */
.open-right-submenu .dropdown-menu {
  top: 0;
  left: 100% !important; /* Pushes submenu to the right of parent */
  right: auto !important;
  margin-left: 0.1rem;
  margin-right: 0;
  transform: none !important;
  z-index: 1051; /* Make sure it's above parents */
}

/* Optional: Prevent hover glitches */
.dropdown-menu {
  pointer-events: auto;
  border: 3px solid green;
}

/* Make sure parent NavDropdown is relatively positioned */
.nav-dropdown-sub-new {
  position: relative;

  /* max-height: 300px; */
  /* overflow-y: auto; */
}

/* Position 3rd-level submenu to the right */
.dropdown-submenu-right > .dropdown-menu {
  top: 0;
  left: 100%;
  margin-left: 0.1rem;
  border: 3px solid red;
  margin-top: -1px; /* optional tweak to align vertically */
}
.dropdown-submenu-right > .dropdown-menu {
  max-height: 300px;
  overflow-y: auto;
}


