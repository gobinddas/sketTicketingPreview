import React, { useState } from 'react';
import { useTicketPrices } from './TicketingPriceContext';

const TicketPrices = () => {
  const { ticketPrices, setTicketPrices } = useTicketPrices();
  const [adultPrice, setAdultPrice] = useState(ticketPrices.adult);
  const [kidPrice, setKidPrice] = useState(ticketPrices.kid);
  const [message, setMessage] = useState('');


  // const handleAdultPriceChange = (e) => {
  //   setAdultPrice(e.target.value);
  // };

  // const handleKidPriceChange = (e) => {
  //   setKidPrice(e.target.value);
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTicketPrices({adult: Number(adultPrice), kid:Number(kidPrice)})
    setMessage('Price updated Locally');

  };

  return (
    <div className="ticket-prices-page">
      <h2 className="section-heading">Ticket Prices</h2>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <div>
            <label htmlFor="adultPrice">Adults : </label> <br></br>
            <input
              type="number"
              id="adultPrice"
              value={adultPrice}
              onChange={(e) => setAdultPrice(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="kidPrice">Kids : </label> <br></br>
            <input
              type="number"
              id="kidPrice"
              value={kidPrice}
              onChange={(e) => setKidPrice(e.target.value)}
            />
          </div>
        </div>
        <button type="submit">Update Prices</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TicketPrices;
