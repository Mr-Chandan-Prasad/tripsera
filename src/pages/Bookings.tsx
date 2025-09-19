import React from 'react';
import BookingInterface from '../components/booking/BookingInterface';
import { useLocation } from 'react-router-dom';

const Bookings: React.FC = () => {
  const location = useLocation();
  
  return (
    <BookingInterface
      preSelectedDestination={location.state?.selectedDestination}
      preSelectedService={location.state?.selectedService}
    />
  );
};

export default Bookings;