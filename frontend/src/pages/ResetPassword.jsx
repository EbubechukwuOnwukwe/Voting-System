import React,{useState} from 'react';
import {Container,Row,Col,Card,Form,Button,Alert,InputGroup} from 'react-bootstrap';
import {Link,useNavigate,useParams} from 'react-router-dom';
import authService from '../services/authService';

export default function ResetPassword(){
 const {uid,token}=useParams(); const navigate=useNavigate(); const [form,setForm]=useState({new_password:'',new_password_confirm:''}); const [message,setMessage]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false),[showPassword,setShowPassword]=useState(false),[showConfirm,setShowConfirm]=useState(false);
 const submit=async e=>{e.preventDefault();setError('');setLoading(true);try{const d=await authService.confirmPasswordReset(uid,token,form);setMessage(d.message);setTimeout(()=>navigate('/login'),1500)}catch(err){const d=err.response?.data;setError(typeof d==='object'?Object.values(d).flat().join(' '):'Invalid reset link.')}finally{setLoading(false)}};

 return <div className="auth-shell"><Container><Row className="justify-content-center align-items-center min-vh-100"><Col md={6}><Card className="auth-card border-0"><Card.Body className="p-5">
 <div className="text-center"><img src="/NMA_Logo.png" className="brand-logo-lg" alt="NMA"/><h3 className="mt-3">Choose a new password</h3></div>
 {message&&<Alert variant="success">{message}</Alert>}{error&&<Alert variant="danger">{error}</Alert>}
 <Form onSubmit={submit}><Form.Group className="mb-3"><Form.Label>New password</Form.Label><InputGroup><Form.Control type={showPassword?'text':'password'} value={form.new_password} onChange={e=>setForm({...form,new_password:e.target.value})} required/><Button variant="outline-secondary" type="button" onClick={()=>setShowPassword(v=>!v)}><i className={showPassword?'bi bi-eye-slash':'bi bi-eye'} /></Button></InputGroup></Form.Group><Form.Group className="mb-4"><Form.Label>Confirm new password</Form.Label><InputGroup><Form.Control type={showConfirm?'text':'password'} value={form.new_password_confirm} onChange={e=>setForm({...form,new_password_confirm:e.target.value})} required/><Button variant="outline-secondary" type="button" onClick={()=>setShowConfirm(v=>!v)}><i className={showConfirm?'bi bi-eye-slash':'bi bi-eye'} /></Button></InputGroup></Form.Group><Button className="w-100 btn-green" type='submit' disabled={loading}>{loading?'Resetting...':'Reset Password'}</Button></Form>
 <div className="text-center mt-4"><Link to="/login">Back to sign in</Link></div>
 </Card.Body></Card></Col></Row></Container></div>
}