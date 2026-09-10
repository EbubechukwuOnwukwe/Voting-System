import api from './api';

const votingService = {
  async getElections() { return (await api.get('/elections/')).data; },
  async getPositions(election) { return (await api.get('/positions/', {params: election ? {election} : {}})).data; },
  async castVote(data) { return (await api.post('/vote/', data)).data; },
  async getVotingStatus(election) { return (await api.get('/votes/status/', {params: election ? {election} : {}})).data; },
  async getResults(election) { return (await api.get('/results/', {params: election ? {election} : {}})).data; },
  async getStats() { return (await api.get('/analytics/stats/')).data; },
};
export default votingService;
