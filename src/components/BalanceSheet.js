import React, { useState, useEffect } from "react";

const BalanceSheet = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [filter, setFilter] = useState("");
  const [dateRange, setDateRange] = useState(""); // State for date range
  const [startDate, setStartDate] = useState(""); // State for custom start date
  const [endDate, setEndDate] = useState(""); // State for custom end date
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/dummy_balance_sheet_data.json");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setSessions(data);
        applyFilters(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setError(error.message || "An error occurred while fetching sessions.");
      }
    };

    fetchSessions();
  }, []);

  const applyFilters = (sessionsToFilter) => {
    let filtered = sessionsToFilter;

    // Apply date range filter
    const now = new Date();
    let start = new Date("1900-01-01");
    let end = now;

    switch (dateRange) {
      case "week":
        start = new Date();
        start.setDate(start.getDate() - 7);
        break;
      case "month":
        start = new Date();
        start.setMonth(start.getMonth() - 1);
        break;
      case "3months":
        start = new Date();
        start.setMonth(start.getMonth() - 3);
        break;
      case "6months":
        start = new Date();
        start.setMonth(start.getMonth() - 6);
        break;
      case "year":
        start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        break;
      case "custom":
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = new Date("1900-01-01");
        end = now;
    }

    filtered = filtered.filter((session) => {
      const sessionStartTime = new Date(session.start_time);
      return sessionStartTime >= start && sessionStartTime <= end;
    });

    // Apply name filter
    filtered = filtered.filter((session) =>
      session.name.toLowerCase().includes(filter.toLowerCase())
    );

    setFilteredSessions(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    applyFilters(sessions); // Apply filters when name changes
  };

  const handleDateRangeChange = (e) => {
    const range = e.target.value;
    setDateRange(range);
    applyFilters(sessions); // Apply filters when date range changes
  };

  useEffect(() => {
    applyFilters(sessions); // Reapply filters if filter or date range changes
  }, [filter, dateRange, startDate, endDate, sessions]);

  const formatPrice = (price) => {
    const numericPrice = parseFloat(price);
    return isNaN(numericPrice) ? "0.00" : numericPrice.toFixed(2);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredSessions.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="overflow-y page-overflow page-balance-sheet">
      <h2 className="section-heading">Balance Sheet</h2>
      <p className="sub-heading">
        Here you can view and manage the balance sheet.
      </p>

      <div className="select-filter">
        <input
          type="text"
          placeholder="Filter by name..."
          value={filter}
          onChange={handleFilterChange}
        />
        <select value={dateRange} onChange={handleDateRangeChange}>
          <option value="">Select Date Range</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="year">Last Year</option>
          <option value="custom">Custom Range</option>
        </select>
        {dateRange === "custom" && (
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {/* Data summary */}
      <div className="data-summary">
        <p>
          Showing {startIndex + 1}-{Math.min(endIndex, filteredSessions.length)}{" "}
          of {filteredSessions.length} entries
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Adults</th>
            <th>Kids</th>
            <th>Total Price</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((session) => (
              <tr key={session.id}>
                <td>{session.id}</td>
                <td>{session.name}</td>
                <td>{session.adults}</td>
                <td>{session.kids}</td>
                <td>{formatPrice(session.total_price)}</td>
                <td>{new Date(session.start_time).toLocaleString()}</td>
                <td>{new Date(session.end_time).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No data available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`pagination-btn ${
                currentPage === page ? "active" : ""
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .data-summary {
          margin: 10px 0;
          font-size: 14px;
          color: #666;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 0;
          gap: 5px;
        }

        .pagination-btn {
          padding: 8px 12px;
          border: 1px solid #ddd;
          background-color: #fff;
          cursor: pointer;
          border-radius: 4px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background-color: #f5f5f5;
          border-color: #999;
        }

        .pagination-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
          background-color: #f9f9f9;
        }

        .pagination-btn.active {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }

        .pagination-btn.active:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default BalanceSheet;
