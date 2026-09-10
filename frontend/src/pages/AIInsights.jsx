/**
 * AI Insights Page Component
 * Displays AI-powered analysis using Groq API
 */
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import NavigationBar from '../components/NavigationBar';
import LoadingSpinner from '../components/LoadingSpinner';
import aiService from '../services/aiService';
import './AIInsights.css';

const AIInsights = () => {
  const [summary, setSummary] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [turnout, setTurnout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (activeTab === 'summary' && !summary) {
      fetchSummary();
    } else if (activeTab === 'prediction' && !prediction) {
      fetchPrediction();
    } else if (activeTab === 'turnout' && !turnout) {
      fetchTurnout();
    }
  }, [activeTab]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await aiService.getSummary();
      setSummary(data);
    } catch (err) {
      setError('Failed to generate AI summary. Make sure Groq API key is configured.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await aiService.getPrediction();
      setPrediction(data);
    } catch (err) {
      setError('Failed to generate AI prediction. Make sure Groq API key is configured.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTurnout = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await aiService.getTurnoutAnalysis();
      setTurnout(data);
    } catch (err) {
      setError('Failed to generate turnout analysis. Make sure Groq API key is configured.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="page-container bg-light">
        <Container className="content-wrapper py-4">
          <Row className="mb-4">
            <Col>
              <h2>
                <i className="bi bi-robot text-primary me-2"></i>
                AI-Powered Insights
              </h2>
              <p className="text-muted">
                Intelligent analysis powered by Groq GPT
              </p>
            </Col>
          </Row>

          {error && (
            <Alert variant="warning" dismissible onClose={() => setError('')}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <hr />
              <small>
                To enable AI features, set your Groq API key in the backend .env file.
                Get your free API key at: <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer">console.groq.com</a>
              </small>
            </Alert>
          )}

          <Card className="border-0 shadow-lg">
            <Card.Body className="p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="border-bottom"
              >
                {/* Voting Summary Tab */}
                <Tab 
                  eventKey="summary" 
                  title={
                    <>
                      <i className="bi bi-file-text me-2"></i>
                      Voting Summary
                    </>
                  }
                >
                  <div className="p-4">
                    {loading ? (
                      <LoadingSpinner message="Generating AI summary..." />
                    ) : summary ? (
                      <>
                        <div className="ai-insights-box mb-4">
                          <h4 className="mb-3">
                            <i className="bi bi-stars me-2"></i>
                            AI-Generated Summary
                          </h4>
                          <div className="markdown-content">
                            <ReactMarkdown>{summary.summary}</ReactMarkdown>
                          </div>
                        </div>

                        <Card className="bg-light border-0">
                          <Card.Body>
                            <h5 className="mb-3">
                              <i className="bi bi-database me-2"></i>
                              Data Overview
                            </h5>
                            <Row>
                              <Col md={6}>
                                <p className="mb-2">
                                  <strong>Registered Users:</strong> {summary.data.overall_stats.total_registered}
                                </p>
                                <p className="mb-2">
                                  <strong>Total Voters:</strong> {summary.data.overall_stats.total_voters}
                                </p>
                              </Col>
                              <Col md={6}>
                                <p className="mb-2">
                                  <strong>Turnout:</strong> {summary.data.overall_stats.turnout_percentage}%
                                </p>
                                <p className="mb-2">
                                  <strong>Total Votes:</strong> {summary.data.overall_stats.total_votes}
                                </p>
                              </Col>
                            </Row>
                            <small className="text-muted">
                              <i className="bi bi-cpu me-1"></i>
                              Powered by {summary.model}
                            </small>
                          </Card.Body>
                        </Card>

                        <div className="text-end mt-3">
                          <Button variant="outline-primary" onClick={fetchSummary}>
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Regenerate
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-robot text-muted" style={{ fontSize: '4rem' }}></i>
                        <h4 className="mt-3">No summary generated yet</h4>
                        <p className="text-muted mb-4">Click the button to generate AI insights</p>
                        <Button variant="primary" onClick={fetchSummary}>
                          <i className="bi bi-stars me-2"></i>
                          Generate Summary
                        </Button>
                      </div>
                    )}
                  </div>
                </Tab>

                {/* Predictions Tab */}
                <Tab 
                  eventKey="prediction" 
                  title={
                    <>
                      <i className="bi bi-graph-up me-2"></i>
                      Predictions
                    </>
                  }
                >
                  <div className="p-4">
                    {loading ? (
                      <LoadingSpinner message="Analyzing competition..." />
                    ) : prediction ? (
                      <>
                        <div className="ai-insights-box mb-4">
                          <h4 className="mb-3">
                            <i className="bi bi-lightbulb me-2"></i>
                            Competitiveness Analysis
                          </h4>
                          <div className="markdown-content">
                            <ReactMarkdown>{prediction.prediction}</ReactMarkdown>
                          </div>
                        </div>

                        <Card className="bg-light border-0">
                          <Card.Body>
                            <h5 className="mb-3">Position Breakdown</h5>
                            {prediction.data.positions.map((pos, index) => (
                              <div key={index} className="mb-3 pb-3 border-bottom">
                                <h6>{pos.position}</h6>
                                <div className="d-flex justify-content-between">
                                  <span>Total Votes: {pos.total_votes}</span>
                                  <span className="badge bg-primary">
                                    {pos.candidates.length} Candidates
                                  </span>
                                </div>
                              </div>
                            ))}
                            <small className="text-muted">
                              <i className="bi bi-cpu me-1"></i>
                              Analysis by {prediction.model}
                            </small>
                          </Card.Body>
                        </Card>

                        <div className="text-end mt-3">
                          <Button variant="outline-primary" onClick={fetchPrediction}>
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Regenerate
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-graph-up text-muted" style={{ fontSize: '4rem' }}></i>
                        <h4 className="mt-3">No predictions generated yet</h4>
                        <p className="text-muted mb-4">Get AI-powered competition analysis</p>
                        <Button variant="primary" onClick={fetchPrediction}>
                          <i className="bi bi-stars me-2"></i>
                          Generate Predictions
                        </Button>
                      </div>
                    )}
                  </div>
                </Tab>

                {/* Turnout Analysis Tab */}
                <Tab 
                  eventKey="turnout" 
                  title={
                    <>
                      <i className="bi bi-people me-2"></i>
                      Turnout Analysis
                    </>
                  }
                >
                  <div className="p-4">
                    {loading ? (
                      <LoadingSpinner message="Analyzing turnout..." />
                    ) : turnout ? (
                      <>
                        <Row className="mb-4">
                          <Col md={4}>
                            <Card className="stats-card border-0 h-100">
                              <Card.Body className="text-center">
                                <i className="bi bi-people-fill" style={{ fontSize: '2.5rem' }}></i>
                                <h3 className="mt-2 mb-1">{turnout.registered}</h3>
                                <p className="mb-0">Registered</p>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={4}>
                            <Card className="stats-card border-0 h-100">
                              <Card.Body className="text-center">
                                <i className="bi bi-person-check-fill" style={{ fontSize: '2.5rem' }}></i>
                                <h3 className="mt-2 mb-1">{turnout.voters}</h3>
                                <p className="mb-0">Voted</p>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={4}>
                            <Card className="stats-card border-0 h-100">
                              <Card.Body className="text-center">
                                <i className="bi bi-percent" style={{ fontSize: '2.5rem' }}></i>
                                <h3 className="mt-2 mb-1">{turnout.turnout_rate}%</h3>
                                <p className="mb-0">Turnout Rate</p>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>

                        <div className="ai-insights-box mb-4">
                          <h4 className="mb-3">
                            <i className="bi bi-clipboard-data me-2"></i>
                            AI Turnout Insights
                          </h4>
                          <div className="markdown-content">
                            <ReactMarkdown>{turnout.turnout_analysis}</ReactMarkdown>
                          </div>
                        </div>

                        <div className="text-end">
                          <Button variant="outline-primary" onClick={fetchTurnout}>
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Regenerate
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-people text-muted" style={{ fontSize: '4rem' }}></i>
                        <h4 className="mt-3">No turnout analysis yet</h4>
                        <p className="text-muted mb-4">Understand voter participation patterns</p>
                        <Button variant="primary" onClick={fetchTurnout}>
                          <i className="bi bi-stars me-2"></i>
                          Analyze Turnout
                        </Button>
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>

          <Alert variant="info" className="mt-4">
            <i className="bi bi-info-circle me-2"></i>
            <strong>About AI Insights:</strong> These insights are generated using Groq's LLM API for lightweight, 
            explainable analysis. This is not heavy machine learning but focused text-based analytical summaries suitable for the voting summmary.
          </Alert>
        </Container>
      </div>
    </>
  );
};

export default AIInsights;
