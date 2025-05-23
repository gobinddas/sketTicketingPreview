import React, { createContext, useState, useContext } from 'react';

const TicketingPriceContext = createContext();

export const TicketingPriceProvider = ({ children }) => {
  const [ticketPrices, setTicketPrices] = useState({
    adult: 125,
    kid: 100,
  });

  return (
    <TicketingPriceContext.Provider value={{ ticketPrices, setTicketPrices }}>
      {children}
    </TicketingPriceContext.Provider>
  );
};

export const useTicketPrices = () => useContext(TicketingPriceContext);
