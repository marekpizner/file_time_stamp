const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf8');

const input = JSON.stringify({
    language: 'Solidity',
    sources: {
        'campaign.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
});
const abiString = solc.compile(input);
const contracts = JSON.parse(abiString).contracts['campaign.sol'];

fs.ensureDirSync(buildPath);
for (let contract in contracts) {
    fs.outputJSONSync(
        path.resolve(buildPath, contract + ".json"),
        contracts[contract]
    );
}