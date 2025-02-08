// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MatchOracle {
    struct MatchResult {
        string homeTeam;
        string awayTeam;
        uint256 homeScore;
        uint256 awayScore;
        uint256 timestamp;
    }

    address public owner;
    MatchResult[] public results;

    event MatchStored(string homeTeam, uint256 homeScore, string awayTeam, uint256 awayScore, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Seul l'owner peut mettre a jour les resultats.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function storeMatchResult(string memory homeTeam, uint256 homeScore, string memory awayTeam, uint256 awayScore) public onlyOwner {
        results.push(MatchResult(homeTeam, awayTeam, homeScore, awayScore, block.timestamp));
        emit MatchStored(homeTeam, homeScore, awayTeam, awayScore, block.timestamp);
    }

    function getLatestMatch() public view returns (string memory, uint256, string memory, uint256, uint256) {
        require(results.length > 0, "Aucun resultat stocke.");
        MatchResult memory lastMatch = results[results.length - 1];
        return (lastMatch.homeTeam, lastMatch.homeScore, lastMatch.awayTeam, lastMatch.awayScore, lastMatch.timestamp);
    }
}
