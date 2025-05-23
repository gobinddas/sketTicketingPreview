import React, { useEffect, useState } from 'react';
import { useTicketPrices } from './TicketingPriceContext';

const TicketPrices = () => {
const {ticketPrices} = useTicketPrices();
  

 

  return (
    <div className="ticket-prices">
      <h2 className="section-heading">Ticket Prices</h2>
      <p>Adults: Rs. {ticketPrices.adult}</p>
      <p>Kids: Rs. {ticketPrices.kid}</p>
      <button>Update Prices</button>
    </div>
  );
};

export default TicketPrices;
