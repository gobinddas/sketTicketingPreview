import React, { useState, useEffect } from "react";
import { useTicketPrices } from "./TicketingPriceContext";

// --- DUMMY DATA with email and phone ---
const dummyMembers = [
  {
    id: "MEM123",
    name: "Anish Karki",
    status: "Active",
    email: "anish@example.com",
    phone: "9800000001",
  },
  {
    id: "MEM456",
    name: "Gobind Das",
    status: "Active",
    email: "gobind@example.com",
    phone: "9800000002",
  },
  {
    id: "MEM789",
    name: "John Doe",
    status: "Inactive",
    email: "john@example.com",
    phone: "9800000003",
  },
];

const membershipBenefits = [
  {
    id: "free_pass",
    title: "Free Guest Pass (1 Adult)",
    description: "One adult gets free entry for the selected duration.",
    discountType: "free_adults",
    value: 1,
  },
  {
    id: "discount_10",
    title: "10% Off Total Price",
    description: "Get a 10% discount on the final bill.",
    discountType: "percentage",
    value: 10,
  },
];

const TicketingForm = ({ setActiveSessions }) => {
  const { ticketPrices } = useTicketPrices();
  const [name, setName] = useState("");
  const [adults, setAdults] = useState(0);
  const [kids, setKids] = useState(0);
  const [adultPrice] = useState(ticketPrices.adult);
  const [kidPrice] = useState(ticketPrices.kid);
  const [totalPrice, setTotalPrice] = useState(0);
  const [duration, setDuration] = useState(2);

  // State for Membership feature
  const [showMembershipCheck, setShowMembershipCheck] = useState(false);
  const [memberIdentifier, setMemberIdentifier] = useState(""); // For email or phone
  const [validatedMember, setValidatedMember] = useState(null);
  const [memberError, setMemberError] = useState("");
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const basePrice = (adults * adultPrice + kids * kidPrice) * duration;
    let finalPrice = basePrice;
    let appliedDiscount = 0;

    if (validatedMember && selectedBenefit) {
      const benefit = membershipBenefits.find((b) => b.id === selectedBenefit);
      if (benefit) {
        switch (benefit.discountType) {
          case "percentage":
            appliedDiscount = basePrice * (benefit.value / 100);
            finalPrice = basePrice - appliedDiscount;
            break;
          case "free_adults":
            const discountedAdults = Math.max(0, adults - benefit.value);
            finalPrice =
              (discountedAdults * adultPrice + kids * kidPrice) * duration;
            appliedDiscount = basePrice - finalPrice;
            break;
          default:
            finalPrice = basePrice;
            appliedDiscount = 0;
        }
      }
    }

    setDiscount(appliedDiscount);
    setTotalPrice(finalPrice < 0 ? 0 : finalPrice);
  }, [
    adults,
    kids,
    adultPrice,
    kidPrice,
    duration,
    validatedMember,
    selectedBenefit,
  ]);

  const handleMembershipCheck = () => {
    setMemberError("");
    setValidatedMember(null);
    setSelectedBenefit(null);

    if (!name.trim() || !memberIdentifier.trim()) {
      setMemberError("Please enter both Name and Email/Phone to validate.");
      return;
    }

    const identifier = memberIdentifier.trim().toLowerCase();
    const memberName = name.trim().toLowerCase();

    const member = dummyMembers.find(
      (m) =>
        m.name.toLowerCase() === memberName &&
        (m.email.toLowerCase() === identifier || m.phone === identifier)
    );

    if (member) {
      if (member.status === "Active") {
        setValidatedMember(member);
        setMemberError("");
      } else {
        setMemberError(`Membership for ${member.name} is inactive.`);
      }
    } else {
      setMemberError("No matching membership found for the provided details.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (adults + kids <= 0) {
      alert("Please enter at least one adult or kid.");
      return;
    }

    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + duration * 60 * 1000).toISOString();
    const newSession = { name, people: `${adults + kids}`, startTime, endTime };

    setActiveSessions((prevSessions) => {
      const updatedSessions = [...prevSessions, newSession];
      localStorage.setItem("activeSessions", JSON.stringify(updatedSessions));
      return updatedSessions;
    });

    printPOSReceipt(newSession);

    // Reset all fields
    setName("");
    setAdults(0);
    setKids(0);
    setDuration(2);
    setShowMembershipCheck(false);
    setMemberIdentifier("");
    setValidatedMember(null);
    setMemberError("");
    setSelectedBenefit(null);
  };

  const printPOSReceipt = (session) => {
    const benefitDetails = validatedMember
      ? `
                <div>--------------------------------</div>
                <div>Member: <strong>${validatedMember.name}</strong></div>
                <div>Benefit: ${
                  membershipBenefits.find((b) => b.id === selectedBenefit)
                    ?.title || "None"
                }</div>
                <div>Discount: Rs. ${discount.toFixed(2)}</div>
                <div>--------------------------------</div>
              `
      : "";

    const printContent = document.createElement("div");
    printContent.innerHTML = `
            <div class="center bold">Tikkit</div>
            <hr>
            <div>Date: ${new Date().toLocaleString()}</div>
            <div>Customer: <strong>${session.name}</strong></div>
            <br>
            <div>Adults: ${adults} x Rs. ${adultPrice}</div>
            <div>Kids: ${kids} x Rs. ${kidPrice}</div>
            <div>Total People: ${adults + kids}</div>
            <div>Duration: ${duration} minute(s)</div>
            <div>Start Time: ${new Date(
              session.startTime
            ).toLocaleTimeString()}</div>
            <div>End Time: ${new Date(
              session.endTime
            ).toLocaleTimeString()}</div>
            ${benefitDetails}
            <div class="bold" style="font-size: 16px; margin-top: 5px;">Total Price: Rs. ${totalPrice.toFixed(
              2
            )}</div>
            <hr>
            <div class="center">Thank you for your visit!</div>
            <p class="center" style="font-size: 14px;">**The paid amount is not refundable**</p>
            <p class="center" style="font-size: 14px;">Powered by Bluebug Software.</p>
        `;

    const printWindow = window.open("", "", "width=400,height=600");
    printWindow.document.write(`
            <style>
                @page { size: 80mm auto; margin: 0; }
                body { font-family: 'Courier New', monospace; width: 80mm; padding: 5mm; color: #000; }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
            </style>
        `);
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.onload = function () {
      printWindow.print();
      printWindow.onafterprint = function () {
        printWindow.close();
      };
    };
  };

  return (
    <div className="ticketing-form box-white">
      <style>{`
                /* General Styling */
                input::placeholder { color: #aaa !important; }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }
                input, select { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                input:disabled { background-color: #e9ecef; cursor: not-allowed; }
                label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; }
                
                /* Layout */
                .form-group { display: flex; gap: 20px; margin-bottom: 15px; }
                .form-group > div { flex: 1; }
                
                /* Controls */
                select {
                    -webkit-appearance: none; -moz-appearance: none; appearance: none;
                    background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="%23333" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m2 4 4 4 4-4"/></svg>');
                    background-repeat: no-repeat; background-position: right 10px center; padding-right: 30px;
                }
                button[type="submit"] { width: 100%; background-color: #007bff; color: white; padding: 12px 15px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold; margin-top: 10px; }
                button[type="submit"]:hover { background-color: #0056b3; }
                .total-price { font-size: 1.2em; font-weight: bold; margin-top: 20px; color: #28a745; text-align: center; }
                
                /* Membership Section */
                .membership-toggle-label { display: flex; align-items: center; gap: 8px; font-weight: bold; color: #007bff; }
                .membership-toggle-label input[type="checkbox"] { width: auto; }
                .membership-section { margin-top: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
                .membership-input-group { display: flex; flex-direction: column; gap: 10px; }
                .membership-input-group button { width: 100%; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; background-color: #28a745; color: white; margin-top: 5px; }
                .membership-input-group button:hover { background-color: #1e7e34; }
                
                /* Status Messages */
                .membership-status { margin-top: 12px; font-weight: bold; padding: 8px; border-radius: 4px; }
                .status-success { color: #155724; background-color: #d4edda; border: 1px solid #c3e6cb; }
                .status-error { color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; }
                
                /* Benefits List */
                .benefits-list { margin-top: 15px; }
                .benefit-item { display: flex; align-items: start; gap: 10px; margin-bottom: 10px; }
                .benefit-item input[type="radio"] { width: auto; flex-shrink: 0; margin-top: 4px; }
                .benefit-item label { font-weight: normal; margin: 0; }
                .benefit-item label strong { display: block; color: #333; }
            `}</style>
      <h2 className="section-heading">Ticketing</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div>
            <label htmlFor="name">Customer Name:</label>
            <input
              type="text"
              id="name"
              placeholder="Anish Karki"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={!!validatedMember}
            />
          </div>
        </div>

        <div className="form-group">
          <div>
            <label htmlFor="adult">Number of Adults:</label>
            <input
              type="number"
              id="adult"
              value={adults}
              onChange={(e) =>
                setAdults(Math.max(0, parseInt(e.target.value) || 0))
              }
              min="0"
            />
          </div>
          <div>
            <label htmlFor="kid">Number of Kids:</label>
            <input
              type="number"
              id="kid"
              value={kids}
              onChange={(e) =>
                setKids(Math.max(0, parseInt(e.target.value) || 0))
              }
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <div>
            <label htmlFor="duration">Select Duration (Minutes):</label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
            >
              {[...Array(6).keys()].map((i) => (
                <option key={i + 2} value={i + 2}>
                  {i + 2} minutes
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="membership-toggle-label">
          <input
            type="checkbox"
            checked={showMembershipCheck}
            onChange={(e) => {
              const isChecked = e.target.checked;
              setShowMembershipCheck(isChecked);
              // Reset all membership state when toggling
              setMemberIdentifier("");
              setValidatedMember(null);
              setMemberError("");
              setSelectedBenefit(null);
              // If unchecking, clear the name field as well
              if (!isChecked) {
                setName("");
              }
            }}
          />
          Check for Membership
        </label>

        {showMembershipCheck && (
          <div className="membership-section">
            <div className="membership-input-group">
              <div>
                <label htmlFor="memberIdentifier">Member Email or Phone:</label>
                <input
                  type="text"
                  id="memberIdentifier"
                  placeholder="Enter member's email or phone"
                  value={memberIdentifier}
                  onChange={(e) => setMemberIdentifier(e.target.value)}
                />
              </div>
              <button type="button" onClick={handleMembershipCheck}>
                Validate Member
              </button>
            </div>

            {memberError && (
              <div className="membership-status status-error">
                {memberError}
              </div>
            )}
            {validatedMember && (
              <>
                <div className="membership-status status-success">
                  Welcome, {validatedMember.name}! Please select a benefit.
                </div>
                <div className="benefits-list">
                  {membershipBenefits.map((benefit) => (
                    <div key={benefit.id} className="benefit-item">
                      <input
                        type="radio"
                        id={benefit.id}
                        name="benefit"
                        value={benefit.id}
                        onChange={(e) => setSelectedBenefit(e.target.value)}
                      />
                      <label htmlFor={benefit.id}>
                        <strong>{benefit.title}</strong>
                        {benefit.description}
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="total-price">
          Total Price: Rs. {totalPrice.toFixed(2)}
        </div>
        <button type="submit">Confirm & Print</button>
      </form>
    </div>
  );
};

export default TicketingForm;
