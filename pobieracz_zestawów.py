import requests
from bs4 import BeautifulSoup
import re
import json

links = ["https://www.ang.pl/slownictwo/cechy-charakteru-po-angielsku",
"https://www.ang.pl/slownictwo/cechy-charakter-po-angielsku",
"https://www.ang.pl/slownictwo/czlowiek-czynnosci-rzeczowniki-po-angielsku",
"https://www.ang.pl/slownictwo/czlowiek-czynnosci-czasowniki-po-angielsku",
"https://www.ang.pl/slownictwo/czlowiek-wyglad-zewnetrzny-po-angielsku",
"https://www.ang.pl/slownictwo/czesci-ciala-po-angielsku",
"https://www.ang.pl/slownictwo/czlowiek-czynnosci-czasowniki-b1-po-angielsku",
"https://www.ang.pl/slownictwo/ubrania-garderoba-po-angielsku",
"https://www.ang.pl/slownictwo/czlonkowie-rodziny-po-angielsku",
"https://www.ang.pl/slownictwo/zawody-po-angielsku",
"https://www.ang.pl/slownictwo/imiona-meskie-po-angielsku",
"https://www.ang.pl/slownictwo/imiona-zenskie-po-angielsku",
"https://www.ang.pl/slownictwo/kosmetyki-akcesoria-po-angielsku",
"https://www.ang.pl/slownictwo/przedmioty-osobistego-uzytku-po-angielsku",
"https://www.ang.pl/slownictwo/znaki-zodiaku-po-angielsku",
"https://www.ang.pl/slownictwo/miesiace-po-angielsku",
"https://www.ang.pl/slownictwo/dni-tygodnia-po-angielsku",
"https://www.ang.pl/slownictwo/pogoda-po-angielsku",
"https://www.ang.pl/slownictwo/pory-roku-po-angielsku",
"https://www.ang.pl/slownictwo/pory-dnia-po-angielsku",
"https://www.ang.pl/slownictwo/miejsca-po-angielsku",
"https://www.ang.pl/slownictwo/uksztaltowanie-terenu-po-angielsku",
"https://www.ang.pl/slownictwo/kleski-zywiolowe-kataklizmy-po-angielsku",
"https://www.ang.pl/slownictwo/jedzenie-picie-po-angielsku",
"https://www.ang.pl/slownictwo/owoce-po-angielsku",
"https://www.ang.pl/slownictwo/warzywa-po-angielsku",
"https://www.ang.pl/slownictwo/napoje-po-angielsku",
"https://www.ang.pl/slownictwo/przyprawy-ziola-po-angielsku",
"https://www.ang.pl/slownictwo/slodycze-po-angielsku",
"https://www.ang.pl/slownictwo/psy-rasy-psow-po-angielsku",
"https://www.ang.pl/slownictwo/koty-rasy-kotow-po-angielsku",
"https://www.ang.pl/slownictwo/ptaki-po-angielsku",
"https://www.ang.pl/slownictwo/ssaki-po-angielsku",
"https://www.ang.pl/slownictwo/ryby-po-angielsku",
"https://www.ang.pl/slownictwo/owady-insekty-po-angielsku",
"https://www.ang.pl/slownictwo/gady-plazy-po-angielsku",
"https://www.ang.pl/slownictwo/ziola-rosliny-lecznicze-po-angielsku",
"https://www.ang.pl/slownictwo/drzewa-po-angielsku",
"https://www.ang.pl/slownictwo/kwiaty-po-angielsku",
"https://www.ang.pl/slownictwo/pomieszczenia-czesci-domu-po-angielsku",
"https://www.ang.pl/slownictwo/wyposazenie-kuchni-po-angielsku",
"https://www.ang.pl/slownictwo/wyposazenie-lazienki-po-angielsku",
"https://www.ang.pl/slownictwo/na-lotnisku-po-angielsku",
"https://www.ang.pl/slownictwo/turystyka-podroze-po-angielsku",
"https://www.ang.pl/slownictwo/srodki-transportu-po-angielsku",
"https://www.ang.pl/slownictwo/wyposazenie-biura-po-angielsku",
"https://www.ang.pl/slownictwo/matematyka-terminy-matematyczne-po-angielsku",
"https://www.ang.pl/slownictwo/rekodzielo-artykuly-plastyczne-po-angielsku",
"https://www.ang.pl/slownictwo/kolory-po-angielsku",
"https://www.ang.pl/slownictwo/narzedzia-po-angielsku",
"https://www.ang.pl/slownictwo/instrumenty-muzyczne-po-angielsku",
"https://www.ang.pl/slownictwo/christmas-boze-narodzenie-po-angielsku"]

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

with open('data.json', 'w', encoding='utf-8') as f:
    f.write(json_data)

print("Dane zostały zapisane do pliku data.json")