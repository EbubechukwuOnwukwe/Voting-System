import React,{useEffect,useState} from 'react';
import {Container,Card,Form,Alert,ProgressBar,Badge} from 'react-bootstrap';
import {useSearchParams} from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import LoadingSpinner from '../components/LoadingSpinner';
import votingService from '../services/votingService';

export default function Results(){
 const [params,setParams]=useSearchParams();const [elections,setElections]=useState([]);const [id,setId]=useState(params.get('election')||'');const [data,setData]=useState(null);const [loading,setLoading]=useState(true);
 const load=async()=>{try{const es=await votingService.getElections();setElections(es);const use=id||es[0]?.id;if(use&&!id){setId(String(use));setParams({election:String(use)})}if(use){const r=await votingService.getResults(use);setData(r.elections?.[0])}}finally{setLoading(false)}};useEffect(()=>{load();const i=setInterval(load,5000);return()=>clearInterval(i)},[id]);
 if(loading)return <LoadingSpinner message="Loading results..."/>;
 return <><NavigationBar/><main className="content-wrapper"><Container><div className="d-flex justify-content-between align-items-center mb-4"><div><h2>Election Results</h2><p className="text-muted">Final winners are released only after the election closes.</p></div><Form.Select value={id} onChange={e=>{setId(e.target.value);setParams({election:e.target.value})}} style={{maxWidth:320}}>{elections.map(e=><option value={e.id} key={e.id}>{e.name}</option>)}</Form.Select></div>
 {data&&!data.winner_released&&<Alert variant="info">Voting is still in progress. Vote totals are visible, but no winner is identified until the timer expires.</Alert>}
 {data?.results?.map(p => (
    <Card
        className="mb-4 border-0 shadow-sm"
        key={p.position_id}
    >
        <Card.Header className="green-header">
            <div className="d-flex justify-content-between">
                <strong>{p.position_name}</strong>
                <span>{p.total_votes} votes</span>
            </div>
        </Card.Header>

        <Card.Body>

            {/* DRAW MESSAGE */}
            {data.winner_released && p.draw && (
                <Alert variant="warning" className="mb-4">
                    <strong>Draw</strong> — the highest-voted candidates
                    received the same number of votes.
                </Alert>
            )}

            {p.candidates.map(c => (
                <div
                    className="mb-4"
                    key={c.id}
                >
                    <div className="d-flex justify-content-between">
                        <div>
                            <strong>{c.name}</strong>

                            {/* WINNER */}
                            {data.winner_released &&
                                !p.draw &&
                                p.winner?.id === c.id && (
                                    <Badge
                                        bg="success"
                                        className="ms-2"
                                    >
                                        Winner
                                    </Badge>
                                )}

                            {/* DRAWING CANDIDATES */}
                            {data.winner_released &&
                                p.draw &&
                                p.winner_ids?.includes(c.id) && (
                                    <Badge
                                        bg="warning"
                                        text="dark"
                                        className="ms-2"
                                    >
                                        Draw
                                    </Badge>
                                )}
                        </div>

                        <span>
                            {c.vote_count} ({c.percentage}%)
                        </span>
                    </div>

                    <ProgressBar
                        now={c.percentage}
                        className="mt-2"
                    />
                </div>
            ))}
        </Card.Body>
    </Card>
))}
 </Container></main></>
}
