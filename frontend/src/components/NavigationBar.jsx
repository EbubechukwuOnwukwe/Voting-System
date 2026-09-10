import React, { useRef, useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavigationBar.css';

export default function NavigationBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const navRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close menu on route change
  useEffect(() => { setExpanded(false); }, [location.pathname]);

  const close = () => setExpanded(false);

  return (
    <Navbar expand="lg" className="app-nav shadow-sm" expanded={expanded} ref={navRef}>
      <Container>
        <Navbar.Brand as={Link} to={user?.is_staff ? '/cms' : '/dashboard'} className="d-flex align-items-center gap-2">
          <img src="/NMA_Logo.png" alt="NMA" className="brand-logo" />
          <strong>NMA Voting</strong>
        </Navbar.Brand>

        <Navbar.Toggle onClick={() => setExpanded(v => !v)} aria-controls="main-nav" />

        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-lg-center gap-lg-1">
            {user?.is_staff
              ? <Nav.Link as={Link} to="/cms" onClick={close}>ADMIN PANEL</Nav.Link>
              : <>
                  <Nav.Link as={Link} to="/dashboard" onClick={close}>Dashboard</Nav.Link>
                  <Nav.Link as={Link} to="/vote" onClick={close}>Vote</Nav.Link>
                  <Nav.Link as={Link} to="/results" onClick={close}>Results</Nav.Link>
                  <Nav.Link as={Link} to="/ai-insights" onClick={close}>AI Insights</Nav.Link>
                </>
            }
            <NavDropdown
              title={`${user?.profile?.first_name || user?.first_name || 'Account'} ${user?.profile?.last_name || user?.last_name || ''}`}
              align="end"
              className="user-dropdown"
            >
              <NavDropdown.Item disabled>{user?.email}</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={() => { close(); logout(); navigate('/login'); }}>Sign out</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}