import React, { useState } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Alert
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();

        setError('');
        setMessage('');
        setLoading(true);

        try {
            const data = await authService.requestPasswordReset(email);

            setMessage(
                data.message ||
                'If an account exists with that email, a password reset link has been sent.'
            );

            setEmail('');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Unable to process the request. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <Container>
                <Row className="justify-content-center align-items-center min-vh-100">
                    <Col md={6}>
                        <Card className="auth-card border-0">
                            <Card.Body className="p-5">

                                <div className="text-center">
                                    <img
                                        src="/NMA_Logo.png"
                                        className="brand-logo-lg"
                                        alt="NMA"
                                    />

                                    <h3 className="mt-3">
                                        Reset your password
                                    </h3>

                                    <p className="text-muted">
                                        Enter your email address and we'll
                                        send you a password reset link.
                                    </p>
                                </div>

                                {message && (
                                    <Alert variant="success">
                                        {message}
                                    </Alert>
                                )}

                                {error && (
                                    <Alert variant="danger">
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={submit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label>
                                            Email address
                                        </Form.Label>

                                        <Form.Control
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            required
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Button
                                        className="w-100 btn-green"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? 'Sending...'
                                            : 'Send Reset Link'}
                                    </Button>
                                </Form>

                                <div className="text-center mt-4">
                                    <Link to="/login">
                                        Back to sign in
                                    </Link>
                                </div>

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}