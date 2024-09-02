from flask import render_template
from app import app

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/learn')
def learn():
    return render_template('learn.html')

@app.route('/manage')
def manage():
    return render_template('manage.html')

@app.route('/learning/sentences_learining')
def sentences_learning():
    return render_template('learning/sentences_learining.html')

@app.route('/learning/multi_learning')
def multilearning():
    return render_template('learning/multi_learning.html')

@app.route('/learning/scattered_words_learning')
def scattered_words_learning():
    return render_template('learning/scattered_words_learning.html')

@app.route('/learning/insert_word')
def insert_word():
    return render_template('learning/insert_word.html')

@app.route('/learning/definition')
def definition():
    return render_template('learning/definition.html')

@app.route('/learning/single_word_learning')
def single_word_learning():
    return render_template('learning//single_word_learning.html', title="Language Quiz")

@app.route('/learning/image_words_learning')
def image_words_learning():
    return render_template('learning/image_words_learning.html', title="Image learning")

@app.route('/manage/exel')
def exel():
    return render_template('manage/exel.html', title="Excel")
