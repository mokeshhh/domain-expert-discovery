import requests
from bs4 import BeautifulSoup
import json

domains = {
    "Web Developers": "https://en.wikipedia.org/wiki/Category:Web_developers",
    "Cybersecurity Experts": "https://en.wikipedia.org/wiki/Category:Computer_security_experts",
    "AI Researchers": "https://en.wikipedia.org/wiki/Category:Artificial_intelligence_researchers",
    "Software Engineers": "https://en.wikipedia.org/wiki/Category:Software_engineers",
    "UI/UX Designers": "https://en.wikipedia.org/wiki/Category:User_interface_designers"
}

all_experts = []

for domain, url in domains.items():
    print(f"\n==== Scraping {domain} ====")
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    people_links = []
    people_list_section = soup.find('div', class_='mw-category')
    if people_list_section:
        people_links = people_list_section.find_all('a')
    else:
        content_div = soup.find('div', id='mw-pages')
        if content_div:
            people_links = content_div.find_all('a')

    if people_links:
        for link in people_links:
            name = link.text
            href = link.get('href')
            if href and href.startswith('/wiki/'):
                wiki_link = 'https://en.wikipedia.org' + href
                expert = {
                    'name': name,
                    'domain': domain,
                    'wikipedia_url': wiki_link
                }
                all_experts.append(expert)
                print(f'Added: {name} ({domain})')
    else:
        print(f"Could not find content for domain: {domain}")

# Save all experts to JSON file inside scraper folder
with open('experts_data.json', 'w', encoding='utf-8') as f:
    json.dump(all_experts, f, ensure_ascii=False, indent=2)

print(f"\nSaved {len(all_experts)} experts to experts_data.json")
