import requests
from bs4 import BeautifulSoup

# Dictionary of domain names and their Wikipedia category URLs
domains = {
    "Web Developers": "https://en.wikipedia.org/wiki/Category:Web_developers",
    "Cybersecurity Experts": "https://en.wikipedia.org/wiki/Category:Computer_security_experts",
    "AI Researchers": "https://en.wikipedia.org/wiki/Category:Artificial_intelligence_researchers",
    "Software Engineers": "https://en.wikipedia.org/wiki/Category:Software_engineers",
    "UI/UX Designers": "https://en.wikipedia.org/wiki/Category:User_interface_designers"
}

for domain, url in domains.items():
    print(f"\n==== {domain} ====")
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    people_list_section = soup.find('div', class_='mw-category')
    if people_list_section:
        people_links = people_list_section.find_all('a')
        for link in people_links:
            name = link.text
            wiki_link = 'https://en.wikipedia.org' + link.get('href')
            print(f'{name} - {wiki_link}')
    else:
        print("Could not find category content for this domain.")
