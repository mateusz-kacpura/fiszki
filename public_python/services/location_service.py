import requests

def get_location(ip_address):
    try:
        response = requests.get(f"http://ipapi.co/{ip_address}/json/")
        data = response.json()
        return {
            "ip": ip_address,
            "city": data.get("city"),
            "region": data.get("region"),
            "country": data.get("country_name"),
            "latitude": data.get("latitude"),
            "longitude": data.get("longitude"),
        }
    except Exception as e:
        print(f"Error retrieving location data: {e}")
        return {"ip": ip_address, "city": None, "region": None, "country": None, "latitude": None, "longitude": None}