import React, { useState, useEffect } from "react";
import { Pagination } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";

const CustomPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  const [selectedValue, setSelectedValue] = useState("10");
  const [visiblePages, setVisiblePages] = useState([]);

  const pageSizeOptions = [10, 50, 100, 200, 300, 400, 500];
  const maxVisiblePages = 5;

  useEffect(() => {
    updateVisiblePages(currentPage);
  }, [currentPage, totalPages]);

  const updateVisiblePages = (page) => {
    let start = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let end = start + maxVisiblePages - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    setVisiblePages(pages);
  };

  const handleClick = (page) => {
    onPageChange(page);
  };

  const handlePageSizeChange = (sizePerPage) => {
    onPageSizeChange(sizePerPage);
  };

  const handleSelect = (eventKey) => {
    setSelectedValue(eventKey);
    handlePageSizeChange(eventKey);
  };

  const renderPageNumbers = () => {
    return visiblePages.map((number) => (
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => handleClick(number)}
      >
        {number}
      </Pagination.Item>
    ));
  };

  return (
    <div className="d-flex justify-content-between pagination mt-5">
      <div className="d-flex justify-content-between align-items-baseline">
        <p className="mr-1 blue">Show</p>
        <Dropdown className="mr-1 small-btn" onSelect={handleSelect}>
          <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
            {selectedValue}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {pageSizeOptions.map((option) => (
              <Dropdown.Item eventKey={option} key={option}>
                {option}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Pagination>
        <Pagination.Prev
          onClick={() => handleClick(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Pagination.Prev>
        {renderPageNumbers()}
        <Pagination.Next
          onClick={() => handleClick(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Pagination.Next>
      </Pagination>
    </div>
  );
};

export default CustomPagination;
