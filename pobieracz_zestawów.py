import requests
from bs4 import BeautifulSoup
import re
import json

links = ["https://www.ang.pl/slownictwo/slownictwo-angielskie-poziom-a1",
"https://www.ang.pl/slownictwo/slownictwo-angielskie-poziom-a2",
"https://www.ang.pl/slownictwo/slownictwo-angielskie-poziom-b1",
"https://www.ang.pl/slownictwo/slownictwo-angielskie-poziom-b2"]

def get_page_content(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.content
    else:
        return None

def extract_section_from_url(url):
    pattern = r'slownictwo/([^/]+)'
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    return None

def extract_data_from_divs(content, link, existing_img_srcs, section, page_number):
    soup = BeautifulSoup(content, 'html.parser')
    divs = soup.find_all('div', class_='ditem')
    
    data = []
    
    for i, div in enumerate(divs, start=1):
        img_tag = div.find('div', class_='img').find('img')
        img_src = "https://www.ang.pl" + img_tag['src']
        alt_text = img_tag['alt']        
        audio_src = "https://www.ang.pl/sound/dict/" + alt_text + ".mp3"
        
        if img_src in existing_img_srcs:
            return None
        
        data.append({
            'section': section,
            str(page_number*i): {
                'img_src': img_src,
                'audio_src': audio_src,
                'alt_text': alt_text
            }
        })
        
        existing_img_srcs.add(img_src)
    
    return data

def crawl_links(links):
    all_data = []
    existing_img_srcs = set()
    
    for link in links:
        page_number = 1
        section = extract_section_from_url(link)
        while True:
            url = f"{link}/page/{page_number}"
            content = get_page_content(url)
            
            if content is None:
                break
            data = extract_data_from_divs(content, link, existing_img_srcs, section, page_number)
            if data is None:
                break
            all_data.extend(data)
            page_number += 1
    
    return all_data

all_data = crawl_links(links)

json_data = json.dumps(all_data, indent=4, ensure_ascii=False)

with open('zestawy-2.json', 'w', encoding='utf-8') as f:
    f.write(json_data)

print("Dane zostały zapisane do pliku data.json")