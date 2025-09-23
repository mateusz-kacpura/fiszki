from flask import Flask
from flask_login import LoginManager
from flask_cors import CORS
from backend.routes.auth_routes import auth_route
from backend.routes.user_routes import user_route
from backend.routes.api_routes import api_route
from backend.models.user_model import User
from flask_wtf.csrf import CSRFProtect
import config 

app = Flask(__name__, template_folder='frontend/templates', static_folder='frontend/static')

app.config.from_object(config.Config)
csrf = CSRFProtect(app)

CORS(app)

# Inicjalizacja Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    return User.get_by_uuid(user_id)

# Drogi logowania i rejestracji
app.register_blueprint(auth_route)

# Drogi użytkownika
app.register_blueprint(user_route)

# Drogi API
app.register_blueprint(api_route)

if __name__ == '__main__':
    app.run(debug=True)
    print(app.url_map)
