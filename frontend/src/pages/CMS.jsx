import React,{useEffect,useState} from 'react';
import {Container,Row,Col,Card,Nav,Tabs,Tab,Table,Button,Form,Modal,Alert,Badge} from 'react-bootstrap';
import NavigationBar from '../components/NavigationBar';
import cms from '../services/cmsService';


const fmt=v=>v?new Date(v).toLocaleString():'—';
const toLocalDateTimeInput = (value) => {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const pad = (number) => String(number).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};


const toUTCISOString = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
};
export default function CMS(){
 const [dash,setDash]=useState(null),[elections,setElections]=useState([]),[positions,setPositions]=useState([]),[candidates,setCandidates]=useState([]),[voters,setVoters]=useState([]),[db,setDb]=useState(null),[results,setResults]=useState([]),[tab,setTab]=useState('dashboard'),[error,setError]=useState('');
 const [modal,setModal]=useState(null); const [form,setForm]=useState({});
 const load=async()=>{try{const [d,e,p,c,v]=await Promise.all([cms.dashboard(),cms.elections(),cms.positions(),cms.candidates(),cms.voters()]);setDash(d);setElections(e);setPositions(p);setCandidates(c);setVoters(v);
if(tab==='database')setDb(await cms.database());
if(tab==='results'){const rs=await Promise.all(e.map(x=>fetch(`${import.meta.env.VITE_API_URL||'https://voting-system-demo-a8nw.onrender.com'}/results/?election=${x.id}`,{headers:{Authorization:`Bearer ${localStorage.getItem('access_token')}`}}).then(r=>r.json())));setResults(rs.flatMap(x=>x.elections||[]))}}catch(e){setError(e.response?.data?.detail||'CMS request failed.')}};
 useEffect(()=>{load();const i=setInterval(load,3000);return()=>clearInterval(i)},[tab]);
 const open = (type, item = {}) => {
    setError('');

    if (type === 'election') {
        setForm({
            ...item,
            start_time: toLocalDateTimeInput(item.start_time),
            end_time: toLocalDateTimeInput(item.end_time),
        });
    } else {
        setForm(item);
    }

    setModal(type);
};
 const save = async () => {
    try {
        // Clear any previous error
        setError("");

        if (modal === "election") {
            const electionData = {
                ...form,
                start_time: toUTCISOString(form.start_time),
                end_time: toUTCISOString(form.end_time),
            };

            if (form.id) {
                await cms.updateElection(form.id, electionData);
            } else {
                await cms.createElection(electionData);
            }
        }

        if (modal === "position") {
            form.id
                ? await cms.updatePosition(form.id, form)
                : await cms.createPosition(form);
        }

        if (modal === "candidate") {
            form.id
                ? await cms.updateCandidate(form.id, form)
                : await cms.createCandidate(form);
        }

        if (modal === "voter") {
            await cms.updateVoter(form.id, form);
        }

        setModal(null);
        setError("");
        await load();

    } catch (e) {
        console.error("CMS save error:", e);

        setError(
            typeof e.response?.data === "object"
                ? JSON.stringify(e.response.data)
                : "Could not save record."
        );
    }
};
 const remove=async(type,id)=>{if(!confirm('This action is permanent. Continue?'))return;try{if(type==='election')await cms.deleteElection(id);if(type==='position')await cms.deletePosition(id);if(type==='candidate')await cms.deleteCandidate(id);if(type==='voter')await cms.deleteVoter(id);await load()}catch(e){setError('Delete failed.')}};
 const download = async () => {
    try {
        setError('');

        const blob = await cms.export();

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = 'voting-system-export.xlsx';

        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Export failed:', e);
        setError('Could not export database.');
    }
};
 
 return <><NavigationBar/><main className="content-wrapper"><Container fluid="lg">
 <div className="d-flex justify-content-between align-items-center mb-4"><div><h2>Election CMS</h2><p className="text-muted mb-0">Manage elections, voters, candidates and live operations.</p></div><Button className="btn-green" onClick={download}>Export Database</Button></div>
 {error&&<Alert variant="danger" dismissible onClose={()=>setError('')}>{error}</Alert>}
 <Tabs
    activeKey={tab}
    onSelect={k => {
        setError('');
        setTab(k);
    }}
    className="cms-tabs mb-4"
>
 <Tab eventKey="dashboard" title="Dashboard"><Row className="g-3 mb-4">{Object.entries(dash?.counts||{}).map(([k,v])=><Col md={3} key={k}><Card className="stat-card border-0"><Card.Body><small className="text-muted text-uppercase">{k}</small><h2>{v}</h2></Card.Body></Card></Col>)}</Row><Card className="border-0 shadow-sm"><Card.Header><strong>Live election updates</strong></Card.Header><Card.Body><Table responsive><thead><tr><th>Election</th><th>Status</th><th>End</th><th>Voters</th><th>Votes</th></tr></thead><tbody>{(dash?.elections||[]).map(e=><tr key={e.id}><td>{e.name}</td><td><Badge bg={e.status==='voting'?'success':'secondary'}>{e.status}</Badge></td><td>{fmt(e.end_time)}</td><td>{e.voters_who_voted}/{e.registered_voters}</td><td>{e.votes_cast}</td></tr>)}</tbody></Table></Card.Body></Card></Tab>
 <Tab eventKey="elections" title="Elections"><Button className="btn-green mb-3" onClick={()=>open('election',{is_active:true})}>+ Create Election</Button><Table responsive bordered><thead><tr><th>Name</th><th>Start</th><th>End</th><th>Status</th><th/></tr></thead><tbody>{elections.map(e=><tr key={e.id}><td>{e.name}</td><td>{fmt(e.start_time)}</td><td>{fmt(e.end_time)}</td><td>{e.status}</td><td><Button size="sm" variant="outline-success" onClick={()=>open('election',e)}>Edit</Button>{' '}<Button size="sm" variant="outline-danger" onClick={()=>remove('election',e.id)}>Delete</Button></td></tr>)}</tbody></Table></Tab>
 <Tab eventKey="positions" title="Positions">
    <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
            <h5 className="mb-1">Positions</h5>
            <small className="text-muted">
                Manage the positions contestants can run for.
            </small>
        </div>

        <Button
            className="btn-green"
            onClick={() => open('position', {
                election: '',
                name: '',
                description: '',
                order: 0,
                is_active: true
            })}
        >
            + Add Position
        </Button>
    </div>

    <Table responsive bordered hover>
        <thead>
            <tr>
                <th>#</th>
                <th>Election</th>
                <th>Position</th>
                <th>Description</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>

        <tbody>
            {positions.length === 0 ? (
                <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                        No positions have been created yet.
                    </td>
                </tr>
            ) : (
                positions.map((p, index) => (
                    <tr key={p.id}>
                        <td>{index + 1}</td>

                        <td>
                            {elections.find(e => e.id === p.election)?.name || '—'}
                        </td>

                        <td>
                            <strong>{p.name}</strong>
                        </td>

                        <td>
                            {p.description || '—'}
                        </td>

                        <td>
                            {p.order}
                        </td>

                        <td>
                            <Badge bg={p.is_active ? 'success' : 'secondary'}>
                                {p.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </td>

                        <td>
                            <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => open('position', p)}
                            >
                                Edit
                            </Button>

                            {' '}

                            <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => remove('position', p.id)}
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                ))
            )}
        </tbody>
    </Table>
</Tab>
 <Tab eventKey="candidates" title="Candidates">
    <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
            <h5 className="mb-1">Candidates</h5>
            <small className="text-muted">
                Manage candidates registered for each position.
            </small>
        </div>

        <Button
            className="btn-green"
            onClick={() => open('candidate', {
                position: '',
                name: '',
                bio: '',
                is_active: true
            })}
        >
            + Add Candidate
        </Button>
    </div>

    <Table responsive bordered hover>
        <thead>
            <tr>
                <th>#</th>
                <th>Candidate</th>
                <th>Position</th>
                <th>Election</th>
                <th>Actions</th>
            </tr>
        </thead>

        <tbody>
            {candidates.length === 0 ? (
                <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                        No candidates have been added yet.
                    </td>
                </tr>
            ) : (
                candidates.map((c, index) => (
                    <tr key={c.id}>
                        <td>{index + 1}</td>

                        <td>
                            <strong>{c.name}</strong>
                        </td>

                        <td>
                            {c.position_name || '—'}
                        </td>

                        <td>
                            {elections.find(
                                e => e.id === c.election_id
                            )?.name || '—'}
                        </td>

                        <td>
                            <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => open('candidate', c)}
                            >
                                Edit
                            </Button>

                            {' '}

                            <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => remove('candidate', c.id)}
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                ))
            )}
        </tbody>
    </Table>
</Tab>
 <Tab eventKey="results" title="Results"><Alert variant="info">Final winners are revealed only after each election timer expires.</Alert>{results.map(r=><Card className="mb-3 border-0 shadow-sm" key={r.election.id}><Card.Header><strong>{r.election.name}</strong> — {r.winner_released?'Final results':'Voting in progress'}</Card.Header><Card.Body>{r.results.map(p=><div className="mb-3" key={p.position_id}><div className="d-flex justify-content-between"><strong>{p.position_name}</strong><span>{p.total_votes} votes</span></div>{r.winner_released&&p.winner?<div className="text-success mt-1"><i className="bi bi-trophy-fill me-1"></i>Winner: <strong>{p.winner.name}</strong> ({p.winner.vote_count} votes)</div>:<div className="text-muted small">Winner hidden until the election closes.</div>}</div>)}</Card.Body></Card>)}</Tab>
 <Tab eventKey="voters" title="Voters"><Table responsive bordered><thead><tr><th>First name</th><th>Surname</th><th>Email</th><th>Eligible</th><th>Positions voted</th><th/></tr></thead><tbody>{voters.map(v=>{const [first,...last]=v.name.split(' ');return <tr key={v.id}><td>{first}</td><td>{last.join(' ')}</td><td>{v.email}</td><td>{v.is_eligible?'Yes':'No'}</td><td>{v.voted_positions}</td><td><Button size="sm" variant="outline-success" onClick={()=>open('voter',v)}>Edit</Button>{' '}<Button size="sm" variant="outline-danger" onClick={()=>remove('voter',v.id)}>Delete</Button></td></tr>})}</tbody></Table><small className="text-muted">Voter records show participation only. Individual candidate choices are never displayed here.</small></Tab>
 <Tab eventKey="database" title="Database">
    <Alert variant="info">
        Operational database view. Ballot rows intentionally contain no voter identity.
    </Alert>

    {db && (
    <>
        {Object.entries(db)
            .filter(([name]) => name !== 'votes')
            .map(([name, rows]) => (
                <Card className="mb-4 border-0 shadow-sm" key={name}>
                    <Card.Header>
                        <strong>
                            {name.charAt(0).toUpperCase() + name.slice(1)}
                        </strong>

                        <span className="text-muted ms-2">
                            ({rows.length} records)
                        </span>
                    </Card.Header>

                    <Card.Body className="p-0">
                        {rows.length === 0 ? (
                            <div className="p-3 text-muted">
                                No records available.
                            </div>
                        ) : (
                            <Table
                                responsive
                                bordered
                                hover
                                className="mb-0"
                            >
                                <thead>
                                    <tr>
                                        {Object.keys(rows[0]).map(key => (
                                            <th key={key}>
                                                {key
                                                    .replace(/_/g, ' ')
                                                    .replace(
                                                        /\b\w/g,
                                                        char => char.toUpperCase()
                                                    )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {rows.slice(0, 100).map((row, index) => (
                                        <tr key={row.id ?? index}>
                                            {Object.keys(rows[0]).map(key => (
                                                <td key={key}>
                                                    {row[key] === null ||
                                                    row[key] === undefined
                                                        ? '—'
                                                        : typeof row[key] === 'boolean'
                                                            ? row[key]
                                                                ? 'Yes'
                                                                : 'No'
                                                            : (
                                                                key.includes('time') ||
                                                                key.includes('_at') ||
                                                                key === 'timestamp'
                                                            )
                                                                ? fmt(row[key])
                                                                : String(row[key])}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            ))}

{/* Votes */}
<Card className="mb-4 border-0 shadow-sm">
    <Card.Header>
        <strong>Votes</strong>

        <span className="text-muted ms-2">
            ({db?.votes?.length || 0} candidates)
        </span>
    </Card.Header>

    <Card.Body className="p-0">
        {!db?.votes || db.votes.length === 0 ? (
            <div className="p-3 text-muted">
                No votes have been recorded yet.
            </div>
        ) : (
            <Table responsive bordered hover className="mb-0">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Candidate</th>
                        <th>Position</th>
                        <th>Votes</th>
                    </tr>
                </thead>

                <tbody>
                    {db.votes.map((vote, index) => (
                        <tr key={`${vote.candidate__name}-${vote.position__name}-${index}`}>
                            <td>{index + 1}</td>

                            <td>
                                <strong>
                                    {vote.candidate__name}
                                </strong>
                            </td>

                            <td>
                                {vote.position__name || '—'}
                            </td>

                            <td>
                                <strong>
                                    {vote.votes}
                                </strong>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        )}
    </Card.Body>
</Card>
    </>
)}
</Tab>
 </Tabs></Container></main>
 <Modal show={!!modal} onHide={()=>setModal(null)} size="lg"><Modal.Header closeButton><Modal.Title>{modal==='election'?'Election':modal==='position'?'Position':modal==='candidate'?'Candidate':'Voter'} management</Modal.Title></Modal.Header><Modal.Body>
 {modal === 'election' && (
    <>
        <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>

            <Form.Control
                value={form.name || ''}
                onChange={e =>
                    setForm({
                        ...form,
                        name: e.target.value
                    })
                }
            />
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>

            <Form.Control
                as="textarea"
                value={form.description || ''}
                onChange={e =>
                    setForm({
                        ...form,
                        description: e.target.value
                    })
                }
            />
        </Form.Group>

        <Row>
            <Col>
                <Form.Group>
                    <Form.Label>
                        Start
                    </Form.Label>

                    <Form.Control
                        type="datetime-local"
                        value={form.start_time || ''}
                        onChange={e =>
                            setForm({
                                ...form,
                                start_time: e.target.value
                            })
                        }
                    />
                </Form.Group>
            </Col>

            <Col>
                <Form.Group>
                    <Form.Label>
                        End
                    </Form.Label>

                    <Form.Control
                        type="datetime-local"
                        value={form.end_time || ''}
                        onChange={e =>
                            setForm({
                                ...form,
                                end_time: e.target.value
                            })
                        }
                    />
                </Form.Group>
            </Col>
        </Row>
    </>
)}
 {modal === 'position' && (
    <>
        <Form.Group className="mb-3">
            <Form.Label>Election</Form.Label>

            <Form.Select
                value={form.election ?? ''}
                onChange={(e) =>
                    setForm({
                        ...form,
                        election: Number(e.target.value),
                    })
                }
            >
                <option value="">Select an election</option>

                {elections.map((election) => (
                    <option
                        value={election.id}
                        key={election.id}
                    >
                        {election.name}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Position Name</Form.Label>

            <Form.Control
                type="text"
                placeholder="e.g. President"
                value={form.name ?? ''}
                onChange={(e) =>
                    setForm({
                        ...form,
                        name: e.target.value,
                    })
                }
            />
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>

            <Form.Control
                as="textarea"
                rows={3}
                placeholder="Optional description"
                value={form.description ?? ''}
                onChange={(e) =>
                    setForm({
                        ...form,
                        description: e.target.value,
                    })
                }
            />
        </Form.Group>

        <Form.Group>
            <Form.Label>Display Order</Form.Label>

            <Form.Control
                type="number"
                min="0"
                value={form.order ?? 0}
                onChange={(e) =>
                    setForm({
                        ...form,
                        order: Number(e.target.value),
                    })
                }
            />
        </Form.Group>
    </>
)}
 {modal === 'candidate' && (
    <>
        <Form.Group className="mb-3">
            <Form.Label>Position</Form.Label>

            <Form.Select
                value={form.position ?? ''}
                onChange={e =>
                    setForm({
                        ...form,
                        position: e.target.value === ''
                            ? ''
                            : Number(e.target.value)
                    })
                }
            >
                <option value="">
                    Select a position
                </option>

                {positions.map(p => (
                    <option value={p.id} key={p.id}>
                        {p.name} — {
                            elections.find(
                                e => e.id === p.election
                            )?.name
                        }
                    </option>
                ))}
            </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>

            <Form.Control
                value={form.name || ''}
                onChange={e =>
                    setForm({
                        ...form,
                        name: e.target.value
                    })
                }
            />
        </Form.Group>

        <Form.Group>
            <Form.Label>Bio</Form.Label>

            <Form.Control
                as="textarea"
                value={form.bio || ''}
                onChange={e =>
                    setForm({
                        ...form,
                        bio: e.target.value
                    })
                }
            />
        </Form.Group>
    </>
)}
 </Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal(null)}>Cancel</Button><Button className="btn-green" onClick={save}>Save changes</Button></Modal.Footer></Modal>
 </>}
