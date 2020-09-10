pragma solidity ^0.6.6;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint256 minContribution) public {
        Campaign newCampaning = new Campaign(minContribution, msg.sender);
        deployedCampaigns.push(address(newCampaning));
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    address public manager;
    uint256 public minimumContribution;
    uint256 public approversCount = 0;
    mapping(address => bool) public approvers;
    Request[] public requests;

    struct Request {
        string description;
        uint256 value;
        address payable recipient;
        bool complete;
        mapping(address => bool) approvals;
        uint256 approvalCount;
    }

    constructor(uint256 minContribution, address campaignManager) public {
        manager = campaignManager;
        minimumContribution = minContribution;
    }

    function contribute() public payable {
        require(
            msg.value >= minimumContribution,
            "Amount is too small for contribution"
        );
        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(
        string memory description,
        uint256 value,
        address payable recipient
    ) public restricted {
        require(
            value <= address(this).balance,
            "Not enought money to request that amount"
        );
        Request memory request = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });

        requests.push(request);
    }

    function approveRequest(uint256 index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender], "You are not an approver");
        require(
            request.approvals[msg.sender] == false,
            "You have already voted on this request"
        );
        require(request.complete == false, "Request was already finalized");

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint256 index) public restricted {
        Request storage request = requests[index];

        require(request.complete == false, "Request was already finalized");
        require(
            request.approvalCount > (approversCount / 2),
            "Not enought approvals"
        );
        request.recipient.transfer(request.value);
        request.complete = true;
    }

    modifier restricted() {
        require(msg.sender == manager, "You are not the Manager");
        _;
    }

    function getSummary()
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address
        )
    {
        return (
            minimumContribution,
            address(this).balance,
            requests.length,
            approversCount,
            manager
        );
    }

    function getRequestsCounts() public view returns (uint256) {
        return requests.length;
    }
}
