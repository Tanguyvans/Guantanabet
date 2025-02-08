// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract WeatherOracle {
    address public owner;
    int256 public temperature;
    uint256 public lastUpdate;

    event WeatherUpdated(int256 temperature, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, unicode"Seul le proprietaire peut mettre a jour les donnees");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function updateWeather(int256 _temperature) public onlyOwner {
        temperature = _temperature;
        lastUpdate = block.timestamp;
        emit WeatherUpdated(_temperature, block.timestamp);
    }

    function getWeather() public view returns (int256, uint256) {
        return (temperature, lastUpdate);
    }
}
