import React,{useEffect,useState} from 'react';
import {Container,Row,Col,Card,Button,Badge,Alert} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import LoadingSpinner from '../components/LoadingSpinner';
import votingService from '../services/votingService';
import {useAuth} from '../context/AuthContext';

function Countdown({end,status}){const [now,setNow]=useState(Date.now());useEffect(()=>{const i=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(i)},[]);if(status==='closed')return <Badge bg="secondary">Voting closed</Badge>;const diff=Math.max(0,new Date(end).getTime()-now);const s=Math.floor(diff/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),sec=s%60;return <div className="countdown"><span>{d}d</span><span>{String(h).padStart(2,'0')}h</span><span>{String(m).padStart(2,'0')}m</span><span>{String(sec).padStart(2,'0')}s</span></div>}

export default function Dashboard(){
 const {user}=useAuth();const navigate=useNavigate();const [elections,setElections]=useState([]);const [status,setStatus]=useState(null);const [loading,setLoading]=useState(true);
 const load=async()=>{try{const [es,st]=await Promise.all([votingService.getElections(),votingService.getVotingStatus()]);setElections(es);setStatus(st.elections)}finally{setLoading(false)}};useEffect(()=>{load();const i=setInterval(load,5000);return()=>clearInterval(i)},[]);
 if(loading)return <LoadingSpinner message="Loading elections..."/>;
 
 return <><NavigationBar/><main className="content-wrapper"><Container>
 <Card className="hero-card border-0 mb-4"><Card.Body className="p-4"><h2>Welcome, {user?.profile?.first_name || user?.first_name}</h2><p className="mb-0 text-muted">{user?.email}</p></Card.Body></Card>
 <h4 className="mb-3">Elections</h4>
 {!elections.length
   ? <Alert variant="info" className="mt-2">No elections have been created yet.</Alert>
   : <Row className="g-4">{elections.map(e=>{const st=status?.find(x=>x.election_id===e.id);return <Col md={6} key={e.id}><Card className="h-100 election-card border-0 shadow-sm"><Card.Body><div className="d-flex justify-content-between align-items-start"><div><h4>{e.name}</h4><p className="text-muted">{e.description}</p></div><Badge bg={e.status==='voting'?'success':e.status==='closed'?'secondary':'warning'} style={{padding:'4px 10px',fontSize:'0.75rem',lineHeight:'1.4'}}>{e.status}</Badge></div>{e.status==='voting'&&<><div className="small text-muted mt-3 mb-1">Voting closes in</div><Countdown end={e.end_time} status={e.status}/></>}{e.status==='scheduled'&&<div className="text-muted">Starts {new Date(e.start_time).toLocaleString()}</div>}{e.status==='closed'&&<Alert variant="success" className="mt-3 mb-0">Election closed. Final results are available.</Alert>}<div className="d-flex gap-2 mt-4"><Button className="btn-green" disabled={!e.voting_open} onClick={()=>navigate(`/vote?election=${e.id}`)}>Vote</Button><Button variant="outline-success" onClick={()=>navigate(`/results?election=${e.id}`)}>Results</Button></div></Card.Body></Card></Col>})}
   </Row>
 }
 </Container></main></>
}
