import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

const SortingIcon = ({ columnName, sortField, sortOrder }) => {
  return (
    <span className="sorting-icon">
      <FontAwesomeIcon
        icon={
          sortField === columnName
            ? sortOrder === "asc"
              ? faSortUp
              : faSortDown
            : faSort
        }
        className={
          sortField === columnName ? "sort-icon filled" : "sort-icon outlined"
        }
      />
    </span>
  );
};

SortingIcon.propTypes = {
  columnName: PropTypes.string.isRequired,
  sortField: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  onTableChange: PropTypes.func.isRequired,
};

export default SortingIcon;
