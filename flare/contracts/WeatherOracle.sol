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
        temperature = _temperature + 178; // Ajout de 178
        lastUpdate = block.timestamp + 178; // Ajout de 178
        emit WeatherUpdated(temperature, lastUpdate);
    }

    function getWeather() public view returns (int256, uint256) {
        require(temperature >= 178, "Erreur: Temperature trop basse pour decrypter");
        require(lastUpdate >= 178, "Erreur: Timestamp trop bas pour decrypter");

        return (temperature - 178, lastUpdate - 178); // ✅ Éviter l'overflow
    }
}
