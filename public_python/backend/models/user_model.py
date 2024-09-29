import json
import os
import uuid
import shutil
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

    def verify_password(self, password):
        """Check if the provided password matches the stored password hash."""
        return check_password_hash(self.password, password)

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

        is_new_user = user.uuid not in users

        users[user.uuid] = {'username': user.username, 'password': user.password}

        # Save the users to the JSON file
        with open(User.filepath, 'w') as f:
            json.dump(users, f, indent=4)

        # If it's a new user, create the user directory and files
        if is_new_user:
            # Define the user folder path
            user_folder = os.path.join(os.path.dirname(User.filepath), user.username)
            if not os.path.exists(user_folder):
                # Create the user folder
                os.makedirs(user_folder)

                # Create 'user_sets' subfolder
                user_sets_folder = os.path.join(user_folder, 'user_sets')
                os.makedirs(user_sets_folder)

                # Create the specified files with possible initial content
                files_to_create = [
                    'config.json', 
                    'history_translation.json', 
                    'insert_word.json', 
                    'sets.json', 
                    'synonim_data.json'
                ]

                for filename in files_to_create:
                    file_path = os.path.join(user_folder, filename)
                    with open(file_path, 'w') as file:
                        if filename == 'config.json':
                            # Initialize config.json with the specified default content
                            default_config = {
                                "language_1": "Polski",
                                "language_2": "Angielski",
                                "theme": "light",
                                "notifications": "email",
                                "privacy": "public"
                            }
                            json.dump(default_config, file, indent=4, ensure_ascii=False)
                        elif filename in [
                            'history_translation.json', 
                            'synonim_data.json'
                        ]:
                            json.dump([], file, indent=4)
                        elif filename == 'sets.json':
                            json.dump({}, file, indent=4)
                        elif filename == 'insert_word.json':
                            json.dump({}, file, indent=4)
                        else:
                            # For any other files, just create an empty file
                            pass

        return True

    @staticmethod
    def delete(user_id):
        """Delete a user by UUID and remove their directory."""
        if not os.path.exists(User.filepath):
            print(f"File {User.filepath} does not exist.")
            return False

        try:
            with open(User.filepath, 'r') as f:
                users = json.load(f)
        except json.JSONDecodeError:
            print(f"Error decoding JSON from {User.filepath}")
            return False

        if user_id in users:
            # Get the username to delete the corresponding directory
            user_data = users.pop(user_id)
            username = user_data.get('username')

            # Remove the user's directory
            user_folder = os.path.join(os.path.dirname(User.filepath), username)
            if os.path.exists(user_folder):
                try:
                    shutil.rmtree(user_folder)
                    print(f"Deleted user directory: {user_folder}")
                except Exception as e:
                    print(f"Error deleting user directory {user_folder}: {e}")
                    return False
            else:
                print(f"User directory {user_folder} does not exist.")

            # Save the updated users list back to the file
            with open(User.filepath, 'w') as f:
                json.dump(users, f, indent=4)

            print(f"User {username} with UUID {user_id} has been deleted.")
            return True
        else:
            print(f"User with UUID {user_id} does not exist.")
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
            old_username = users[user_id]['username']
            users[user_id]['username'] = username
            if hashed_password:
                users[user_id]['password'] = hashed_password

            # Save the updated users list back to the file
            with open(User.filepath, 'w') as f:
                json.dump(users, f, indent=4)

            # Rename the user's folder if the username has changed
            if old_username != username:
                old_user_folder = os.path.join(os.path.dirname(User.filepath), old_username)
                new_user_folder = os.path.join(os.path.dirname(User.filepath), username)
                if os.path.exists(old_user_folder):
                    os.rename(old_user_folder, new_user_folder)
                    print(f"Renamed user directory from {old_user_folder} to {new_user_folder}")
                else:
                    print(f"Old user directory {old_user_folder} does not exist.")

            return True

        print(f"User with UUID {user_id} does not exist.")
        return False