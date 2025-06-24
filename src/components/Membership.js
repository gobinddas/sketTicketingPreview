// src/components/Membership.js

import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
// --- Import the icons for the benefits ---
import { FaTicketAlt, FaTshirt, FaPlus } from "react-icons/fa";
import { BiCalendarStar } from "react-icons/bi";

// Helper to generate more realistic dummy data
const generateInitialMembers = () => {
  const members = [];
  const today = new Date();
  const statuses = ["Active", "Inactive"];
  for (let i = 0; i < 85; i++) {
    const joinedDate = new Date(today);
    joinedDate.setDate(today.getDate() - Math.floor(Math.random() * 365)); // Joined in the last year
    const name = `Member ${i + 1}`;
    members.push({
      id: i + 1,
      name: name,
      email: `${name.replace(" ", ".").toLowerCase()}@example.com`,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      joined: joinedDate.toISOString().split("T")[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return members;
};

const pageSize = 10;

const Membership = () => {
  const [members, setMembers] = useState(generateInitialMembers);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    joined: "",
    status: "Active",
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState({});

  // --- UPDATED Membership Benefits State (with icons and better descriptions) ---
  const [benefits, setBenefits] = useState([
    {
      id: 1,
      title: "Free Guest Pass",
      description:
        "Bring a friend for free once every month to share the experience.",
      icon: <FaTicketAlt />,
    },
    {
      id: 2,
      title: "10% Off Merchandise",
      description: "Get a 10% discount on all in-store apparel and gear.",
      icon: <FaTshirt />,
    },
    {
      id: 3,
      title: "Priority Event Access",
      description: "Get early access and preferred seating for special events.",
      icon: <BiCalendarStar />,
    },
  ]);
  const [benefitForm, setBenefitForm] = useState({
    title: "",
    description: "",
  });
  const [showBenefitForm, setShowBenefitForm] = useState(false);
  const [editBenefitId, setEditBenefitId] = useState(null);

  // Refs for canvas elements
  const chartRefs = useRef({});
  // Ref to hold the Chart.js instances for cleanup
  const chartInstances = useRef({});

  // Calculate analytics summary
  useEffect(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === "Active").length;
    const inactiveMembers = totalMembers - activeMembers;
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const newThisMonth = members.filter((m) => {
      const joinedDate = new Date(m.joined);
      return (
        joinedDate.getMonth() === thisMonth &&
        joinedDate.getFullYear() === thisYear
      );
    }).length;

    const growth = members.reduce((acc, m) => {
      const monthYear = new Date(m.joined).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});
    const sortedGrowth = Object.entries(growth)
      .sort(
        (a, b) =>
          new Date(`01 ${a[0].replace(" '", "'")}`) -
          new Date(`01 ${b[0].replace(" '", "'")}`)
      )
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    setSummary({
      totalMembers,
      activeMembers,
      inactiveMembers,
      newThisMonth,
      growth: sortedGrowth,
    });
  }, [members]);

  // REFACTORED CHARTING EFFECT
  useEffect(() => {
    Chart.defaults.color = "#f9fafb";

    // Status Distribution Chart
    if (chartRefs.current.statusChart && summary.totalMembers) {
      const ctx = chartRefs.current.statusChart.getContext("2d");
      chartInstances.current.statusChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Active", "Inactive"],
          datasets: [
            {
              data: [summary.activeMembers, summary.inactiveMembers],
              backgroundColor: ["#64bbb2", "#e57373"],
              borderColor: "#374151",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top" } },
        },
      });
    }

    // Membership Growth Chart
    if (chartRefs.current.growthChart && summary.growth) {
      const ctx = chartRefs.current.growthChart.getContext("2d");
      chartInstances.current.growthChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: Object.keys(summary.growth),
          datasets: [
            {
              label: "New Members",
              data: Object.values(summary.growth),
              fill: true,
              backgroundColor: "rgba(100,187,178,0.15)",
              borderColor: "#64bbb2",
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: "#4b5563" } },
            x: { grid: { color: "#4b5563" } },
          },
        },
      });
    }

    // --- The crucial cleanup function ---
    return () => {
      Object.values(chartInstances.current).forEach((chart) => {
        if (chart) chart.destroy();
      });
      chartInstances.current = {}; // Clear instances after destroying
    };
  }, [summary]); // Re-run effect when summary data changes

  // Filtered and paginated members
  const filtered = members
    .filter((m) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm) ||
        m.email.toLowerCase().includes(searchTerm) ||
        m.phone.includes(searchTerm);
      const matchesStatus = statusFilter === "All" || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.joined) - new Date(a.joined));

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCancel = () => {
    setForm({ name: "", email: "", phone: "", joined: "", status: "Active" });
    setShowForm(false);
    setEditId(null);
  };

  const handleAddOrEdit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.joined) return;
    if (editId) {
      setMembers(
        members.map((m) => (m.id === editId ? { ...form, id: editId } : m))
      );
    } else {
      setMembers([...members, { ...form, id: Date.now() }]);
    }
    handleCancel();
  };

  const handleRemove = (id) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  const handleEdit = (member) => {
    setForm({ ...member });
    setEditId(member.id);
    setShowForm(true);
  };

  const handleStatusToggle = (id) => {
    setMembers(
      members.map((m) =>
        m.id === id
          ? { ...m, status: m.status === "Active" ? "Inactive" : "Active" }
          : m
      )
    );
  };

  const avatar = (name) => {
    const n = name.split(" ");
    return n.length > 1 ? n[0][0] + n[1][0] : n[0][0];
  };

  // Membership Benefits Handlers
  const handleBenefitChange = (e) => {
    setBenefitForm({ ...benefitForm, [e.target.name]: e.target.value });
  };
  const handleBenefitAddOrEdit = (e) => {
    e.preventDefault();
    if (!benefitForm.title || !benefitForm.description) return;
    if (editBenefitId) {
      setBenefits(
        benefits.map((b) =>
          b.id === editBenefitId ? { ...benefitForm, id: editBenefitId } : b
        )
      );
    } else {
      // For a new benefit, we'll add a placeholder icon.
      // A more robust solution might involve letting the user choose an icon.
      setBenefits([
        ...benefits,
        { ...benefitForm, id: Date.now(), icon: <FaPlus /> },
      ]);
    }
    setBenefitForm({ title: "", description: "" });
    setShowBenefitForm(false);
    setEditBenefitId(null);
  };
  const handleBenefitEdit = (benefit) => {
    setBenefitForm({
      title: benefit.title,
      description: benefit.description,
    });
    setEditBenefitId(benefit.id);
    setShowBenefitForm(true);
  };
  const handleBenefitRemove = (id) => {
    setBenefits(benefits.filter((b) => b.id !== id));
  };
  const handleBenefitCancel = () => {
    setBenefitForm({ title: "", description: "" });
    setShowBenefitForm(false);
    setEditBenefitId(null);
  };

  return (
    <div className="membership-page page-overflow overflow-y">
      <h2 className="section-heading">Membership Management</h2>

      {/* Summary Cards */}
      <div className="analytics-summary-cards">
        <div className="summary-card">
          <div className="label">Total Members</div>
          <div className="value">{summary.totalMembers}</div>
        </div>
        <div className="summary-card">
          <div className="label">Active Members</div>
          <div className="value">{summary.activeMembers}</div>
        </div>
        <div className="summary-card">
          <div className="label">Inactive Members</div>
          <div className="value">{summary.inactiveMembers}</div>
        </div>
        <div className="summary-card">
          <div className="label">New This Month</div>
          <div className="value">{summary.newThisMonth}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="membership-charts-section">
        <div className="analytics-chart-section">
          <h3>Status Distribution</h3>
          <div className="chart-container">
            <canvas ref={(ref) => (chartRefs.current.statusChart = ref)} />
          </div>
        </div>
        <div className="analytics-chart-section">
          <h3>Membership Growth</h3>
          <div className="chart-container">
            <canvas ref={(ref) => (chartRefs.current.growthChart = ref)} />
          </div>
        </div>
      </div>

      {/* --- UPDATED Membership Benefits Section --- */}
      <h3>Membership Benefits</h3>
      <div className="benefits-list">
        {benefits.map((b) => (
          <div className="benefit-card" key={b.id}>
            <div className="benefit-icon">{b.icon}</div>
            <div className="benefit-title">{b.title}</div>
            <div className="benefit-desc">{b.description}</div>
            <div className="benefit-actions">
              <button
                className="icon-btn"
                title="Edit"
                onClick={() => handleBenefitEdit(b)}
              >
                <CiEdit />
              </button>
              <button
                className="icon-btn danger"
                title="Remove"
                onClick={() => handleBenefitRemove(b.id)}
              >
                <MdDelete />
              </button>
            </div>
          </div>
        ))}
        {/* --- New "Add Benefit" Card replaces the old button --- */}
        <div
          className="add-benefit-card"
          onClick={() => {
            setShowBenefitForm(true);
            setEditBenefitId(null);
            setBenefitForm({ title: "", description: "" });
          }}
        >
          <div className="add-icon">
            <FaPlus />
          </div>
          <span>Add New Benefit</span>
        </div>
      </div>
      {showBenefitForm && (
        <div className="modal-bg">
          <form className="modal-form" onSubmit={handleBenefitAddOrEdit}>
            <h4
              style={{
                color: "#f9fafb",
                marginBottom: 10,
                fontWeight: 700,
              }}
            >
              {editBenefitId ? "Edit Benefit" : "Add Benefit"}
            </h4>
            <input
              type="text"
              name="title"
              placeholder="Benefit Title"
              value={benefitForm.title}
              onChange={handleBenefitChange}
              required
              autoFocus
            />
            <textarea
              name="description"
              placeholder="Benefit Description"
              value={benefitForm.description}
              onChange={handleBenefitChange}
              required
              rows={3}
              style={{ resize: "vertical", minHeight: 60 }}
            />
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 8,
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={handleBenefitCancel}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                {editBenefitId ? "Save Benefit" : "Add Benefit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls and Member List */}
      <h3>Members List</h3>
      <div className="membership-controls">
        <input
          className="search-input"
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm({
              name: "",
              email: "",
              phone: "",
              joined: new Date().toISOString().split("T")[0],
              status: "Active",
            });
          }}
        >
          + Add Member
        </button>
      </div>
      {showForm && (
        <div className="modal-bg">
          <form className="modal-form" onSubmit={handleAddOrEdit}>
            <h4 style={{ color: "#f9fafb", marginBottom: 10, fontWeight: 700 }}>
              {editId ? "Edit Member" : "Add New Member"}
            </h4>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="joined"
              value={form.joined}
              onChange={handleChange}
              required
            />
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 8,
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button className="btn btn-primary" type="submit">
                {editId ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="modern-table-wrap">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-no-data">
                  No members found
                </td>
              </tr>
            ) : (
              paged.map((m) => (
                <tr key={m.id}>
                  <td className="table-cell-name">
                    <div className="avatar" title={m.name}>
                      {avatar(m.name).toUpperCase()}
                    </div>
                    {m.name}
                  </td>
                  <td>{m.email}</td>
                  <td>{m.phone}</td>
                  <td>{new Date(m.joined).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        m.status === "Active" ? "active" : "inactive"
                      }`}
                      onClick={() => handleStatusToggle(m.id)}
                      title="Toggle status"
                    >
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => handleEdit(m)}
                    >
                      <CiEdit />
                    </button>
                    <button
                      className="icon-btn danger"
                      title="Remove"
                      onClick={() => handleRemove(m.id)}
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="table-pagination">
            <button
              className="icon-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              title="Previous"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <span style={{ color: "#d1d5db", fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="icon-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              title="Next"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Membership;
