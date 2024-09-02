import json
import os
import uuid  # Importing the uuid module correctly
from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import UserMixin

class User(UserMixin):
    filepath = 'baza_danych/user_datas/users.json'

    def __init__(self, user_id=None, username=None, password=None):
        self.uuid = user_id or str(uuid.uuid4())  # Generate UUID if not provided
        self.username = username
        self.password = password

    def get_id(self):
        return self.uuid  # Return the UUID as the unique identifier

    @staticmethod
    def load_all_users():
        if not os.path.exists(User.filepath):
            print(f"File {User.filepath} does not exist.")
            return {}

        with open(User.filepath, 'r') as file:
            try:
                users_data = json.load(file)
            except json.JSONDecodeError:
                print(f"Error decoding JSON from {User.filepath}")
                return {}
            
        users = {}
        for uuid, data in users_data.items():
            print(f"Loaded user: {uuid} -> {data['username']}")
            user = User(uuid, data['username'], data['password'])
            users[uuid] = user
        return users

    @staticmethod
    def get_by_username(username):
        """Find a user by username."""
        if not os.path.exists(User.filepath):
            return None

        try:
            with open(User.filepath, 'r') as f:
                if os.path.getsize(User.filepath) == 0:
                    return None
                
                users = json.load(f)
        except json.JSONDecodeError:
            return None

        for uuid, user_data in users.items():
            if user_data['username'] == username:
                return User(uuid, username, user_data['password'])

        return None

    @staticmethod
    def get_by_uuid(user_id):
        """Find a user by UUID."""
        if not os.path.exists(User.filepath):
            return None

        try:
            with open(User.filepath, 'r') as f:
                if os.path.getsize(User.filepath) == 0:
                    return None
                
                users = json.load(f)
        except json.JSONDecodeError:
            return None

        user_data = users.get(user_id)
        if user_data:
            return User(user_id, user_data['username'], user_data['password'])
        
        return None

    @staticmethod
    def save(user):
        users = {}

        if os.path.exists(User.filepath):
            try:
                with open(User.filepath, 'r') as f:
                    if os.path.getsize(User.filepath) > 0:
                        users = json.load(f)
            except json.JSONDecodeError:
                pass  # Handle corrupted JSON by overwriting it

        users[user.uuid] = {'username': user.username, 'password': user.password}

        with open(User.filepath, 'w') as f:
            json.dump(users, f, indent=4)

        return True

    @staticmethod
    def delete(user_id):
        """Delete a user by UUID."""
        if os.path.exists(User.filepath):
            try:
                with open(User.filepath, 'r') as f:
                    users = json.load(f)
                
                if user_id in users:
                    del users[user_id]

                    with open(User.filepath, 'w') as f:
                        json.dump(users, f, indent=4)

                    return True
            except json.JSONDecodeError:
                pass

        return False

    @staticmethod
    def save_all_users(users):
        with open(User.filepath, 'w') as file:
            json.dump({user_id: {'username': user.username, 'password': user.password} for user_id, user in users.items()}, file, indent=4)
        return True
    
    @staticmethod
    def update_user(user_id, username, hashed_password=None):
        users = {}

        # Load existing users from the file if it exists
        if os.path.exists(User.filepath):
            try:
                with open(User.filepath, 'r') as f:
                    if os.path.getsize(User.filepath) > 0:
                        users = json.load(f)
            except json.JSONDecodeError:
                pass

        # Check if the user exists and update details
        if user_id in users:
            users[user_id]['username'] = username
            if hashed_password:
                users[user_id]['password'] = hashed_password

            # Save the updated users list back to the file
            with open(User.filepath, 'w') as f:
                json.dump(users, f, indent=4)

            return True

        return False
