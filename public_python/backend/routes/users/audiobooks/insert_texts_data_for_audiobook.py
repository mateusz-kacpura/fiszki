from flask import request, jsonify
from flask_login import login_required, current_user
import json
import config

USER_PUBLIC = config.USER_PUBLIC
USER = config.USER

@login_required
def insert_texts_data_for_audiobook():
    pass