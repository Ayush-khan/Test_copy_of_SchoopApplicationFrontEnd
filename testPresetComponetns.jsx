<div className="flex flex-wrap items-center justify-end gap-2 md:gap-4 w-full">
  {/* Select Menu Dropdown */}
  <div className="flex items-center w-full md:w-[40%]">
    <div className="w-3/4">
      <Select
        value={selectedMenu}
        onChange={handleMenuSelect}
        options={menuOptions}
        placeholder="Search Menu"
        isSearchable
        isClearable
        className="text-sm"
      />
    </div>
  </div>

  {/* GR No Input */}
  <div className="flex items-center">
    <input
      type="text"
      id="search"
      name="search"
      disabled
      placeholder="GR NO"
      value={inputValueGR}
      onChange={(e) => setInputValueGR(e.target.value)}
      onKeyPress={handleKeyPress}
      className="w-20 lg:w-24 outline-none border border-gray-400 rounded-md py-1 px-2 text-xs lg:text-sm"
    />
  </div>

  {/* Academic Year Dropdown */}
  <div className="flex items-center">
    <NavDropdown
      title={
        <span className="text-sm font-semibold">
          {selectedYear || "Academic Year"}
        </span>
      }
      className={`${styles.dropNaveBarAcademic} outline-none border border-gray-400 rounded-md px-2 py-1 text-xs lg:text-sm`}
      style={{
        width: "160px", // fixed width to match others
        textAlign: "center",
      }}
      onSelect={handleSelect}
    >
      <div className="text-start text-sm bg-gray-50 text-gray-700 max-h-28 overflow-y-scroll">
        {academicYear &&
          academicYear.map((year) => (
            <NavDropdown.Item key={year} eventKey={year}>
              {year}
            </NavDropdown.Item>
          ))}
      </div>
    </NavDropdown>
  </div>
</div>;
