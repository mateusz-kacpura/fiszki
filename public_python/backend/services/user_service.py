import json
from werkzeug.security import generate_password_hash, check_password_hash
from models.user_model import load_all_users, User

def register_user(username, password):
    with open('baza_danych/user_datas/users.json', 'r+') as f:
        users = json.load(f)
        user_id = str(len(users) + 1)
        hashed_password = generate_password_hash(password, method='sha256')
        users[user_id] = {'username': username, 'password': hashed_password}
        f.seek(0)
        json.dump(users, f, indent=4)
    return user_id

def authenticate_user(username, password):
    with open('baza_danych/user_datas/users.json') as f:
        users = json.load(f)
    for user_id, user_data in users.items():
        if user_data['username'] == username and check_password_hash(user_data['password'], password):
            return User(user_id, username, user_data['password'])
    return None