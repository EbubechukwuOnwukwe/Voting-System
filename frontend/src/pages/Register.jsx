import React,{useState} from 'react';
import {Container,Row,Col,Card,Form,Button,Alert,InputGroup} from 'react-bootstrap';
import {Link,useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function Register(){
 const [form,setForm]=useState({first_name:'',last_name:'',email:'',password:'',password_confirm:''});
 const [error,setError]=useState(''),[loading,setLoading]=useState(false),[showPassword,setShowPassword]=useState(false),[showConfirm,setShowConfirm]=useState(false); const {register}=useAuth(); const navigate=useNavigate();
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 const submit=async e=>{e.preventDefault();setError('');setLoading(true);try{await register(form);navigate('/dashboard')}catch(err){const d=err.response?.data;setError(typeof d==='object'?Object.values(d).flat().join(' '):'Registration failed.')}finally{setLoading(false)}};

 
 return <div className="auth-shell"><Container><Row className="justify-content-center align-items-center py-5"><Col md={7} lg={6}><Card className="auth-card border-0"><Card.Body className="p-5">
 <div className="text-center mb-4"><img src="/NMA_Logo.png" className="brand-logo-lg" alt="NMA"/><h2 className="mt-3">Create voter account</h2></div>
 {error&&<Alert variant="danger">{error}</Alert>}<Form onSubmit={submit}><Row><Col md={6}><Form.Group className="mb-3"><Form.Label>First name</Form.Label><Form.Control name="first_name" value={form.first_name} onChange={change} required/></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label>Surname</Form.Label><Form.Control name="last_name" value={form.last_name} onChange={change} required/></Form.Group></Col></Row>
 <Form.Group className="mb-3"><Form.Label>Email address</Form.Label><Form.Control type="email" name="email" value={form.email} onChange={change} required/></Form.Group>
 <Form.Group className="mb-3"><Form.Label>Password</Form.Label><InputGroup><Form.Control type={showPassword?'text':'password'} name="password" value={form.password} onChange={change} required/><Button variant="outline-secondary" type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'}><i className={showPassword?'bi bi-eye-slash':'bi bi-eye'} /></Button></InputGroup></Form.Group>
 <Form.Group className="mb-4"><Form.Label>Confirm password</Form.Label><InputGroup><Form.Control type={showConfirm?'text':'password'} name="password_confirm" value={form.password_confirm} onChange={change} required/><Button variant="outline-secondary" type="button" onClick={()=>setShowConfirm(v=>!v)} aria-label={showConfirm?'Hide password':'Show password'}><i className={showConfirm?'bi bi-eye-slash':'bi bi-eye'} /></Button></InputGroup></Form.Group>
 <Button className="w-100 btn-green" type='submit' disabled={loading}>{loading?'Creating account...':'Create Account'}</Button></Form>
 <hr/><div className="text-center">Already registered? <Link to="/login">Sign in</Link></div>
 </Card.Body></Card></Col></Row></Container></div>
}