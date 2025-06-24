import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

const Analytics = () => {
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState({
    totalSessions: 0,
    totalRevenue: 0,
    totalAdults: 0,
    totalKids: 0,
    avgRevenuePerSession: 0,
    avgRevenuePerUser: 0,
    busiestDay: "",
    sessionsByDay: {},
    revenueByDay: {},
    revenueByMonth: {},
    sessionsByHour: {},
    popularTimeSlots: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [filteredSessions, setFilteredSessions] = useState([]);
  const chartRefs = useRef({});

  // Helper to format time in 12-hour format with AM/PM
  const format12Hour = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    // Only use dummy data, do not fetch from localStorage
    const today = new Date();
    const dummy = [];
    for (let i = 0; i < 180; i++) {
      // 180 days (about 6 months)
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const sessionsToday = Math.floor(Math.random() * 12) + 5; // 5-16 sessions per day
      for (let j = 0; j < sessionsToday; j++) {
        const hour = Math.floor(Math.random() * 12) + 8; // 8am-8pm
        const start = new Date(day);
        start.setHours(hour, Math.floor(Math.random() * 60));
        const duration = [2, 3, 4, 5, 6, 7][Math.floor(Math.random() * 6)];
        const end = new Date(start.getTime() + duration * 60000);
        const adults = Math.floor(Math.random() * 4) + 1; // 1-4 adults
        const kids = Math.floor(Math.random() * 4); // 0-3 kids
        const adultPrice = 200 + Math.floor(Math.random() * 51) * 2; // 200-300
        const kidPrice = 100 + Math.floor(Math.random() * 21) * 2; // 100-140
        const totalPrice = adults * adultPrice + kids * kidPrice;
        dummy.push({
          name: `Customer ${i * 20 + j + 1}`,
          adults,
          kids,
          people: adults + kids,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          totalPrice,
        });
      }
    }
    setSessions(dummy);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = sessions;
    if (dateRange.from) {
      filtered = filtered.filter(
        (s) => s.startTime && new Date(s.startTime) >= new Date(dateRange.from)
      );
    }
    if (dateRange.to) {
      filtered = filtered.filter(
        (s) =>
          s.startTime &&
          new Date(s.startTime) <= new Date(dateRange.to + "T23:59:59")
      );
    }
    setFilteredSessions(filtered);
    calculateSummary(filtered);
  }, [sessions, dateRange]);

  useEffect(() => {
    // Chart.js global defaults for font color
    Chart.defaults.color = "#f9fafb";
    Chart.defaults.plugins.legend.labels.color = "#f9fafb";
    Chart.defaults.plugins.tooltip.bodyColor = "#f9fafb";
    Chart.defaults.plugins.tooltip.titleColor = "#f9fafb";
    // Peak Hours Usage (sessions by hour)
    if (
      chartRefs.current.peakHours &&
      Object.keys(summary.sessionsByHour).length
    ) {
      const ctx = chartRefs.current.peakHours.getContext("2d");
      if (window.peakHoursChart) window.peakHoursChart.destroy();
      window.peakHoursChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(summary.sessionsByHour),
          datasets: [
            {
              label: "Sessions",
              data: Object.values(summary.sessionsByHour),
              backgroundColor: "#64bbb2",
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: {
              title: { display: true, text: "Hour of Day", color: "#f9fafb" },
              ticks: { color: "#f9fafb" },
              grid: { color: "#4b5563" },
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: "Sessions", color: "#f9fafb" },
              ticks: { color: "#f9fafb" },
              grid: { color: "#4b5563" },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
    // Daily Revenue Trend
    if (
      chartRefs.current.dailyRevenue &&
      Object.keys(summary.revenueByDay).length
    ) {
      const ctx = chartRefs.current.dailyRevenue.getContext("2d");
      if (window.dailyRevenueChart) window.dailyRevenueChart.destroy();
      // Format x-axis labels as 'dd MMM'
      const dayLabels = Object.keys(summary.revenueByDay).map((d) => {
        const date = new Date(d);
        if (!isNaN(date)) {
          return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
          });
        }
        return d;
      });
      window.dailyRevenueChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: dayLabels,
          datasets: [
            {
              label: "Revenue",
              data: Object.values(summary.revenueByDay),
              fill: true,
              backgroundColor: "rgba(100,187,178,0.15)",
              borderColor: "#64bbb2",
              tension: 0.3,
              pointRadius: 3,
              pointBackgroundColor: "#64bbb2",
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: {
              title: { display: true, text: "Date", color: "#f9fafb" },
              ticks: {
                color: "#f9fafb",
                maxRotation: 45,
                minRotation: 45,
                autoSkip: true,
                maxTicksLimit: 10, // Show at most 10 ticks
              },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: "Revenue (Rs.)", color: "#f9fafb" },
              ticks: { color: "#f9fafb" },
              grid: { color: "#4b5563" },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
    // Monthly Revenue Trend
    if (
      chartRefs.current.monthlyRevenue &&
      Object.keys(summary.revenueByMonth).length
    ) {
      const ctx = chartRefs.current.monthlyRevenue.getContext("2d");
      if (window.monthlyRevenueChart) window.monthlyRevenueChart.destroy();
      window.monthlyRevenueChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Object.keys(summary.revenueByMonth),
          datasets: [
            {
              label: "Revenue",
              data: Object.values(summary.revenueByMonth),
              backgroundColor: "#64bbb2",
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: {
              title: { display: true, text: "Month", color: "#f9fafb" },
              ticks: { color: "#f9fafb" },
              grid: { color: "#4b5563" },
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: "Revenue (Rs.)", color: "#f9fafb" },
              ticks: { color: "#f9fafb" },
              grid: { color: "#4b5563" },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  }, [summary, chartRefs]);

  const calculateSummary = (data) => {
    let totalRevenue = 0;
    let totalAdults = 0;
    let totalKids = 0;
    let sessionsByDay = {};
    let revenueByDay = {};
    let revenueByMonth = {};
    let sessionsByHour = {};
    let userCount = 0;
    let timeSlotCounts = {};
    data.forEach((s) => {
      let adults = parseInt(s.adults || 0);
      let kids = parseInt(s.kids || 0);
      let price = parseFloat(s.totalPrice || 0);
      totalAdults += adults;
      totalKids += kids;
      totalRevenue += price;
      userCount += adults + kids;
      // By day
      const day = s.startTime
        ? new Date(s.startTime).toLocaleDateString()
        : "Unknown";
      sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
      revenueByDay[day] = (revenueByDay[day] || 0) + price;
      // By month
      const month = s.startTime
        ? new Date(s.startTime).toLocaleString("default", {
            month: "short",
            year: "numeric",
          })
        : "Unknown";
      revenueByMonth[month] = (revenueByMonth[month] || 0) + price;
      // By hour
      if (s.startTime) {
        const hour = new Date(s.startTime).getHours();
        sessionsByHour[hour] = (sessionsByHour[hour] || 0) + 1;
        // Popular time slots (group by 2-hour slots)
        const slot = `${hour.toString().padStart(2, "0")}:00 - ${(hour + 2)
          .toString()
          .padStart(2, "0")}:00`;
        timeSlotCounts[slot] = (timeSlotCounts[slot] || 0) + 1;
      }
    });
    const totalSessions = data.length;
    const avgRevenuePerSession = totalSessions
      ? (totalRevenue / totalSessions).toFixed(2)
      : 0;
    const avgRevenuePerUser = userCount
      ? (totalRevenue / userCount).toFixed(2)
      : 0;
    // Find busiest day
    let busiestDay = "";
    let maxSessions = 0;
    Object.entries(sessionsByDay).forEach(([day, count]) => {
      if (count > maxSessions) {
        maxSessions = count;
        busiestDay = day;
      }
    });
    // Find top 3 popular time slots
    const popularTimeSlots = Object.entries(timeSlotCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([slot, count]) => ({ slot, count }));
    setSummary({
      totalSessions,
      totalRevenue,
      totalAdults,
      totalKids,
      avgRevenuePerSession,
      avgRevenuePerUser,
      busiestDay,
      sessionsByDay,
      revenueByDay,
      revenueByMonth,
      sessionsByHour,
      popularTimeSlots,
    });
  };

  return (
    <div className="analytics-page box-white page-overflow overflow-y">
      <h2 className="section-heading">Business Analytics</h2>
      <div className="analytics-controls">
        <div className="date-range-filter">
          <label>
            From:{" "}
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
            />
          </label>
          <label>
            To:{" "}
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
            />
          </label>
        </div>
      </div>
      {loading ? (
        <div className="analytics-loading">Loading analytics...</div>
      ) : (
        <>
          <div className="analytics-summary-cards">
            <div className="summary-card gradient-card">
              <div className="label">Total Sessions</div>
              <div className="value">{summary.totalSessions}</div>
            </div>
            <div className="summary-card gradient-card">
              <div className="label">Total Revenue</div>
              <div className="value">Rs. {summary.totalRevenue}</div>
            </div>
            <div className="summary-card gradient-card">
              <div className="label">Total Adults</div>
              <div className="value">{summary.totalAdults}</div>
            </div>
            <div className="summary-card gradient-card">
              <div className="label">Total Kids</div>
              <div className="value">{summary.totalKids}</div>
            </div>
            <div className="summary-card gradient-card">
              <div className="label">Avg Revenue/Session</div>
              <div className="value">Rs. {summary.avgRevenuePerSession}</div>
            </div>
            <div className="summary-card gradient-card">
              <div className="label">Avg Revenue/User</div>
              <div className="value">Rs. {summary.avgRevenuePerUser}</div>
            </div>
            <div className="summary-card gradient-card">
              <div className="label">Busiest Day</div>
              <div className="value">{summary.busiestDay}</div>
            </div>
          </div>

          <div className="analytics-chart-section">
            <h3>Peak Hours Usage</h3>
            <div className="chart-container" style={{ height: 220 }}>
              <canvas
                ref={(ref) => {
                  chartRefs.current.peakHours = ref;
                }}
                height={220}
              />
            </div>
          </div>

          <div className="analytics-chart-section">
            <h3>Popular Time Slots</h3>
            <ul
              style={{
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
                marginBottom: 24,
              }}
            >
              {summary.popularTimeSlots.length === 0 && (
                <li style={{ color: "#aaa" }}>No data</li>
              )}
              {summary.popularTimeSlots.map((slot, idx) => (
                <li
                  key={idx}
                  style={{
                    background: "#232946",
                    borderRadius: 8,
                    padding: "10px 18px",
                    minWidth: 120,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{slot.slot}</div>
                  <div style={{ fontSize: 15, color: "#a0aec0" }}>
                    Sessions: {slot.count}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="analytics-chart-section">
            <h3>Daily Revenue Trend</h3>
            <div className="chart-container" style={{ height: 220 }}>
              <canvas
                ref={(ref) => {
                  chartRefs.current.dailyRevenue = ref;
                }}
                height={220}
              />
            </div>
          </div>

          <div className="analytics-chart-section">
            <h3>Monthly Revenue Trend</h3>
            <div className="chart-container" style={{ height: 220 }}>
              <canvas
                ref={(ref) => {
                  chartRefs.current.monthlyRevenue = ref;
                }}
                height={220}
              />
            </div>
          </div>

          <h3>Recent Sessions</h3>
          <table className="analytics-table modern-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Adults</th>
                <th>Kids</th>
                <th>Total People</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", color: "#aaa" }}
                  >
                    No sessions found
                  </td>
                </tr>
              )}
              {filteredSessions
                .slice(-10)
                .reverse()
                .map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td>{s.adults || "-"}</td>
                    <td>{s.kids || "-"}</td>
                    <td>{s.people}</td>
                    <td>{format12Hour(s.startTime)}</td>
                    <td>{format12Hour(s.endTime)}</td>
                    <td>{s.totalPrice ? `Rs. ${s.totalPrice}` : "-"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Analytics;
