import React, { useState, useEffect } from 'react';
import { useTicketPrices } from './TicketingPriceContext';

const TicketingForm = ({ setActiveSessions }) => {
  const { ticketPrices, setTicketPrices } = useTicketPrices()
  const [name, setName] = useState('');
  const [adults, setAdults] = useState(0); // Set initial value to 1
  const [kids, setKids] = useState(0);
  const [adultPrice, setAdultPrice] = useState(ticketPrices.adult); // Default value, will be updated from API
  const [kidPrice, setKidPrice] = useState(ticketPrices.kid); // Default value, will be updated from API
  const [totalPrice, setTotalPrice] = useState(0);
  const [duration, setDuration] = useState(1); // Default to 1 hour



  useEffect(() => {
    // Calculate the total price based on the number of people and duration
   
    const price = ((adults * adultPrice) + (kids * kidPrice)) * duration;
    setTotalPrice(price);
  }, [adults, kids, adultPrice, kidPrice, duration]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + duration * 60 * 1000).toISOString();

    const newSession = {
      name,
      people: `${adults + kids}`,
      startTime,
      endTime,
    };

    // Store session data locally only

    setActiveSessions(prevSessions => {
      const updatedSessions = [...prevSessions, newSession];
      // Update localStorage
      localStorage.setItem('activeSessions', JSON.stringify(updatedSessions));
      return updatedSessions;
    });
    ;

    printPOSReceipt(newSession);

    setName('');
    setAdults(1);
    setKids(0);
    setDuration(1);
  };

  const printPOSReceipt = (session) => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', monospace;
          width: 80mm;
          padding: 5mm;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        hr { border-top: 1px dashed #000; }
      </style>
      <div class="center bold">Bijuwar Skate Park</div>
      <hr>
      <div>Date: ${new Date().toLocaleString()}</div>
      <div>Customer: <strong>${session.name}</strong></div>
      <div>Adults: ${adults} x Rs. ${adultPrice}</div>
      <div>Kids: ${kids} x Rs. ${kidPrice}</div>
      <div>Total People: ${adults + kids}</div>
      <div>Duration: ${duration} minute(s)</div>
      <div>Start Time: ${new Date(session.startTime).toLocaleTimeString()}</div>
      <div>End Time: ${new Date(session.endTime).toLocaleTimeString()}</div>
      <div class="bold">Total Price: Rs. ${totalPrice}</div>
      <hr>
      <div class="center">Thank you for your visit!</div>
      <p class="center" style="font-size: 14px;">**The paid amount is not refundable**</p>
      <p class="center" style="font-size: 14px;">Powered by Bluebug Software.</p>
    `;

    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.open();
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
      <h2 className='section-heading'>Ticketing</h2>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <div>
            <label htmlFor="name">Enter Customer Name :</label>
            <input
              type="text"
              id="name"
              placeholder="Eg : Uttam Karki"
              value={name}
              onChange={(e) => setName(e.target.value)} required
            />
          </div>
        </div>

        <div className='form-group'>
          <div>
            <label htmlFor="adult">Number of Adults :</label>
            <input
              type="number"
              id='adult'
              placeholder="Adult Numbers"
              value={adults}
              onChange={(e) => {
                const value = Math.max(1, parseInt(e.target.value) || 1);
                setAdults(value);
              }} required
              min="1" // Ensures minimum value is 1
            />
          </div>

          <div>
            <label htmlFor="kid">Number of Kids :</label>
            <input
              type="number"
              placeholder="Kids"
              id='kid'
              value={kids}
              onChange={(e) => {
                const value = Math.max(0, parseInt(e.target.value) || 0);
                setKids(value);
              }} required
              min="0" // Ensures minimum value is 0
            />
          </div>
        </div>

        <div className='form-group'>
          <div>
            <label htmlFor="duration">Select Duration (In Minutes):</label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
            >
              <option value="2">2 minutes</option>
              <option value="3">3 minutes</option>
              <option value="4">4 minutes</option>
              <option value="5">5 minutes</option>
              <option value="6">6 minutes</option>
              <option value="7">7 minutes</option>
            </select>
          </div>
        </div>

        <div className='total-price'>Total price: Rs. {totalPrice}</div>
        <button type="submit">Confirm</button>
      </form>
    </div>
  );
};

export default TicketingForm;
