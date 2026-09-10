/**
 * Loading Spinner Component
 * Reusable loading indicator
 */
import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="text-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 text-muted">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
