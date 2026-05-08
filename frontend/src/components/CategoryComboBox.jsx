// frontend/src/components/CategoryComboBox.jsx
//
// A "combobox" = text input + dropdown combined.
// The admin can:
//   a) Type a new category name (free text)
//   b) Pick an existing one from the filtered dropdown
//
// HOW IT WORKS:
//   1. Fetches all unique categories from /api/products/ on mount
//   2. Shows a text input (controlled by parent via value/onChange)
//   3. As the user types, filters the list → shows matching pills below
//   4. Clicking a pill fills the input with that value
//   5. User can also just leave it as free text (new category)
//   6. Dropdown closes when user clicks outside (onBlur with delay)
//      The delay is needed because onClick on the pill fires AFTER
//      onBlur — without it the dropdown would close before the click
//      registers.
//
// PROPS:
//   value     → current category string (controlled from parent)
//   onChange  → called with new string when user types or picks

import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags, faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";

function CategoryComboBox({ value, onChange }) {
  const [allCategories,      setAllCategories]      = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [dropdownOpen,       setDropdownOpen]       = useState(false);
  const blurTimer = useRef(null);   // holds the setTimeout reference

  // Fetch existing categories once on mount
  useEffect(() => {
    API.get("products/")
      .then(res => {
        const unique = [...new Set(res.data.map(p => p.category).filter(Boolean))].sort();
        setAllCategories(unique);
      })
      .catch(err => console.log(err));
  }, []);

  // Filter categories whenever the input value changes
  useEffect(() => {
    if (!value.trim()) {
      setFilteredCategories(allCategories);  // show all if input empty
    } else {
      const q = value.toLowerCase();
      setFilteredCategories(
        allCategories.filter(cat => cat.toLowerCase().includes(q))
      );
    }
  }, [value, allCategories]);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setDropdownOpen(true);
  };

  const handlePickCategory = (cat) => {
    onChange(cat);
    setDropdownOpen(false);
  };

  const handleBlur = () => {
    // Delay closing so that a click on a pill fires first
    blurTimer.current = setTimeout(() => setDropdownOpen(false), 150);
  };

  const handleFocus = () => {
    clearTimeout(blurTimer.current);
    setDropdownOpen(true);
  };

  const handleClear = () => {
    onChange("");
    setDropdownOpen(true);
  };

  const showDropdown = dropdownOpen && filteredCategories.length > 0;

  return (
    <div className="category-combobox">

      {/* Text input */}
      <div className="category-combobox-input-wrap">
        <span className="category-combobox-icon">
          <FontAwesomeIcon icon={faTags} />
        </span>

        <input
          type="text"
          className="category-combobox-input"
          placeholder="Type or select a category..."
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"
        />

        {/* Clear button — only shows when there's text */}
        {value && (
          <button type="button" className="category-combobox-clear" onClick={handleClear}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}

        <span className="category-combobox-chevron">
          <FontAwesomeIcon icon={faChevronDown} />
        </span>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <ul className="category-combobox-dropdown">
          {filteredCategories.map(cat => (
            <li
              key={cat}
              className={`category-combobox-option ${cat === value ? "category-combobox-option--active" : ""}`}
              onMouseDown={() => handlePickCategory(cat)}
              // onMouseDown fires before onBlur, so the pick registers
              // before the dropdown closes — that's why we use mouseDown
              // instead of onClick here
            >
              {cat}
            </li>
          ))}
          {/* "New category" option when typed text doesn't match any existing */}
          {value.trim() && !allCategories.some(c => c.toLowerCase() === value.toLowerCase()) && (
            <li
              className="category-combobox-option category-combobox-option--new"
              onMouseDown={() => handlePickCategory(value.trim())}
            >
              + Create "{value.trim()}"
            </li>
          )}
        </ul>
      )}

    </div>
  );
}

export default CategoryComboBox;