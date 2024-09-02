from flask import Blueprint, render_template
from flask_login import UserMixin, login_required
from models.user_model import User

user_route = Blueprint('user', __name__, url_prefix='/user', template_folder='templates')

@user_route.route('/')
@login_required
def index():
    return render_template('index.html')

@user_route.route('/learn')
@login_required
def learn():
    return render_template('learn.html')

@user_route.route('/manage')
@login_required
def manage():
    return render_template('manage.html')

@user_route.route('/learning/sentences_learning')
@login_required
def sentences_learning():
    return render_template('learning/sentences_learning.html')

@user_route.route('/learning/multi_learning')
@login_required
def multilearning():
    return render_template('learning/multi_learning.html')

@user_route.route('/learning/scattered_words_learning')
@login_required
def scattered_words_learning():
    return render_template('learning/scattered_words_learning.html')

@user_route.route('/learning/insert_word')
@login_required
def insert_word():
    return render_template('learning/insert_word.html')

@user_route.route('/learning/definition')
@login_required
def definition():
    return render_template('learning/definition.html')

@user_route.route('/learning/single_word_learning')
@login_required
def single_word_learning():
    return render_template('learning//single_word_learning.html', title="Language Quiz")

@user_route.route('/learning/image_words_learning')
@login_required
def image_words_learning():
    return render_template('learning/image_words_learning.html', title="Image learning")

@user_route.route('/manage/exel')
@login_required
def exel():
    return render_template('manage/exel.html', title="Excel")
