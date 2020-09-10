import Web3 from 'web3';
const dotenv = require('dotenv');
dotenv.config();

let web3;

if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    web3 = new Web3(window.web3.currentProvider);
} else {
    const provider = new Web3.providers.HttpProvider(
        process.env.URL
    );
    web3 = new Web3(provider);
}

export default web3;