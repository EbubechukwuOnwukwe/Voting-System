/**
 * Not Found (404) Page Component
 */
import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container bg-light d-flex align-items-center justify-content-center">
      <Container className="text-center">
        <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '5rem' }}></i>
        <h1 className="display-1 fw-bold mt-3">404</h1>
        <h3 className="mb-3">Page Not Found</h3>
        <p className="text-muted mb-4">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
          <i className="bi bi-house-door me-2"></i>
          Go to Dashboard
        </Button>
      </Container>
    </div>
  );
};

export default NotFound;
