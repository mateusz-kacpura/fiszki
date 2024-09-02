from flask import Flask
from flask_cors import CORS
from services import logger_service, file_management_service
from routes import frontend_routes, api_routes, static_file_routes

app = Flask(__name__)
CORS(app)

if __name__ == '__main__':
    app.run(debug=True)
