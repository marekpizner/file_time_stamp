import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    CampaignFactory.abi,
    '0x7352383616CE025706291F97f7d27fF6134F5Ae7'
);

export default instance;