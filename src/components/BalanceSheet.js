import React, { useState, useEffect } from 'react';

const BalanceSheet = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState(''); // State for date range
  const [startDate, setStartDate] = useState(''); // State for custom start date
  const [endDate, setEndDate] = useState(''); // State for custom end date
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/dummy_balance_sheet_data.json');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setSessions(data);
        applyFilters(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setError(error.message || 'An error occurred while fetching sessions.');
      }
    };

    fetchSessions();
  }, []);

  const applyFilters = (sessionsToFilter) => {
    let filtered = sessionsToFilter;

    // Apply date range filter
    const now = new Date();
    let start = new Date('1900-01-01');
    let end = now;

    switch (dateRange) {
      case 'week':
        start = new Date();
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start = new Date();
        start.setMonth(start.getMonth() - 1);
        break;
      case '3months':
        start = new Date();
        start.setMonth(start.getMonth() - 3);
        break;
      case '6months':
        start = new Date();
        start.setMonth(start.getMonth() - 6);
        break;
      case 'year':
        start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'custom':
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = new Date('1900-01-01');
        end = now;
    }

    filtered = filtered.filter(session => {
      const sessionStartTime = new Date(session.start_time);
      return sessionStartTime >= start && sessionStartTime <= end;
    });

    // Apply name filter
    filtered = filtered.filter(session =>
      session.name.toLowerCase().includes(filter.toLowerCase())
    );

    setFilteredSessions(filtered);
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
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  return (
    <div className='overflow-y page-overflow page-balance-sheet'>
      <h2 className='section-heading'>Balance Sheet</h2>
      <p className='sub-heading'>Here you can view and manage the balance sheet.</p>

      <div className='select-filter'>
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
        {dateRange === 'custom' && (
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
          {filteredSessions.length > 0 ? (
            filteredSessions.map(session => (
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
    </div>
  );
};

export default BalanceSheet;
