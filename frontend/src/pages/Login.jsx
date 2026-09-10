import React,{useState} from 'react';
import {Container,Row,Col,Card,Form,Button,Alert,InputGroup} from 'react-bootstrap';
import {Link,useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function Login(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[showPassword,setShowPassword]=useState(false),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const {login}=useAuth(); const navigate=useNavigate();
 const submit=async e=>{e.preventDefault();setError('');setLoading(true);try{const d=await login({email,password});navigate(d.user?.is_staff?'/cms':'/dashboard')}catch(err){setError(err.response?.data?.error||'Unable to sign in.')}finally{setLoading(false)}};
 
 return <div className="auth-shell"><Container><Row className="justify-content-center align-items-center min-vh-100"><Col md={6} lg={5}><Card className="auth-card border-0"><Card.Body className="p-5">
 <div className="text-center mb-4"><img src="/NMA_Logo.png" className="brand-logo-lg" alt="NMA"/><h2 className="mt-3">Nigerian Medical Association - Election System</h2><p className="text-muted">Sign in securely to vote</p></div>
 {error&&<Alert variant="danger">{error}</Alert>}<Form onSubmit={submit}>
 <Form.Group className="mb-3"><Form.Label>Email address</Form.Label><Form.Control type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></Form.Group>
 <Form.Group className="mb-2"><Form.Label>Password</Form.Label><InputGroup><Form.Control type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required/><Button variant="outline-secondary" type="button" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(v=>!v)}><i className={showPassword?'bi bi-eye-slash':'bi bi-eye'} /></Button></InputGroup></Form.Group>
 <div className="text-end mb-4"><Link to="/forgot-password">Forgot password?</Link></div>
 <Button className="w-100 btn-green py-2" type='submit' disabled={loading}>{loading?'Signing in...':'Sign In'}</Button></Form>
 <hr/><div className="text-center">Don't have an account? <Link to="/register">Register</Link></div>
 </Card.Body></Card></Col></Row></Container></div>
}