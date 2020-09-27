const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider({ gasLimit: 10000000 }));

const compiledCampaign = require('../ethereum/build/Campaign.json');
const compiledFactory = require('../ethereum/build/CampaignFactory.json');

let accounts = [];
let factory = null;
let campaignAddress = null;
let campaign = null;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: '0x' + compiledFactory.evm.bytecode.object })
        .send({
            from: accounts[0],
            gas: '10000000',
        });

    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '1000000',
    });

    // Only one contract deployed, so this is safe.
    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

    campaign = await new web3.eth.Contract(compiledCampaign.abi, campaignAddress);
});

describe('Campaigns', () => {
    it('deploys a factory and a campaign', async () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(manager, accounts[0]);
    });

    it('allows people to contribute money and marks them as an approver', async () => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1],
        });

        const approverExists = await campaign.methods.approvers(accounts[1]).call();
        assert.ok(approverExists);
    });

    it('requires a minimum contribution', async () => {
        try {
            await campaign.methds.contribute().send({
                value: '1',
                from: accounts[1],
            });
            assert.fail();
        } catch (error) {
            assert(true);
        }
    });

    it('allows a manager to make a payment request', async () => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[0],
        });

        await campaign.methods.createRequest('Buy flops', '100', accounts[1]).send({
            from: accounts[0],
            gas: '1000000',
        });

        const request = await campaign.methods.requests(0).call();
        assert.equal(request.description, 'Buy flops')
    });

    it('processes requests', async () => {
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether'),
        });

        await campaign.methods.createRequest(
            'Buy flops',
            web3.utils.toWei('5', 'ether'),
            accounts[1]
        ).send({
            from: accounts[0],
            gas: '1000000',
        });

        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000',
        });

        const beginningBal = await web3.eth.getBalance(accounts[1]);
        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000',
        });

        const endingBal = await web3.eth.getBalance(accounts[1]);
        let diffBal = endingBal - beginningBal;
        diffBal = web3.utils.fromWei(diffBal.toString(), 'ether');
        diffBal = parseFloat(diffBal);

        assert(diffBal === 5);
    });
});