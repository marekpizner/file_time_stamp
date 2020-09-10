const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('./build/CampaignFactory.json');
const dotenv = require('dotenv');
dotenv.config();

const provider = new HDWalletProvider(
    process.env.SEED,
    process.env.URL
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy using account ' + accounts[0]);

    const txn = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: '0x' + compiledFactory.evm.bytecode.object })
        .send({ from: accounts[0] });

    console.log(JSON.stringify(compiledFactory.abi));
    console.log('Contract is at ' + txn.options.address);
};
deploy();