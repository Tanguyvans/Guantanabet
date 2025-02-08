import requests

url = "https://api.the-odds-api.com/v4/sports/soccer_france_ligue_one/scores"
params = {
    "apiKey": "de11d9ff7c06d1783bd22c4e289bf456",
    "daysFrom": 3  # Optionnel : permet de récupérer les matchs terminés des 3 derniers jours
}

response = requests.get(url, params=params)
data = response.json()

# Afficher les scores des matchs terminés
for match in data:
    if match['completed']:
        print(f"{match['home_team']} {match['scores'][0]['score']} - {match['scores'][1]['score']} {match['away_team']}")
