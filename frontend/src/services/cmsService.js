import api from './api';
const cmsService={
 dashboard:async()=> (await api.get('/cms/dashboard/')).data,
 elections:async()=> (await api.get('/cms/elections/')).data,
 createElection:async(d)=> (await api.post('/cms/elections/',d)).data,
 updateElection:async(id,d)=> (await api.patch(`/cms/elections/${id}/`,d)).data,
 deleteElection:async id=> api.delete(`/cms/elections/${id}/`),
 positions:async()=> (await api.get('/cms/positions/')).data,
 createPosition:async d=>(await api.post('/cms/positions/',d)).data,
 updatePosition:async(id,d)=>(await api.patch(`/cms/positions/${id}/`,d)).data,
 deletePosition:async id=>api.delete(`/cms/positions/${id}/`),
 candidates:async()=> (await api.get('/cms/candidates/')).data,
 createCandidate:async d=>(await api.post('/cms/candidates/',d)).data,
 updateCandidate:async(id,d)=>(await api.patch(`/cms/candidates/${id}/`,d)).data,
 deleteCandidate:async id=>api.delete(`/cms/candidates/${id}/`),
 voters:async q=>(await api.get('/cms/voters/',{params:q?{q}:{}})).data,
 updateVoter:async(id,d)=>(await api.patch(`/cms/voters/${id}/`,d)).data,
 deleteVoter:async id=>api.delete(`/cms/voters/${id}/`),
 database:async()=>(await api.get('/cms/database/')).data,
 export: async () =>
    (
        await api.get('/cms/export/', {
            responseType: 'blob',
        })
    ).data,
}; export default cmsService;
