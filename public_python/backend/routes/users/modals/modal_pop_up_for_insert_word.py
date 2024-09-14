from flask import render_template, request, jsonify
from flask_login import login_required

@login_required
def modal_pop_up_for_insert_word():
    selectedWord = request.args.get('selectedWord')
    correctWord = request.args.get('correctWord')
    fullSentence = request.args.get('fullSentence')
    exampleTranslation = request.args.get('exampleTranslation')
    theme = request.args.get('theme', 'light')

    modalHeaderClass = 'bg-success text-white' if selectedWord == correctWord else 'bg-danger text-white'
    modalTitle = 'Correct Answer!' if selectedWord == correctWord else 'Incorrect Answer!'
    modalMessage = f'Your choise: {selectedWord}' if selectedWord != correctWord else ''

    modal_html = render_template(
        'learning/modals/insert-pop-up.html',
        modalHeaderClass=modalHeaderClass,
        modalTitle=modalTitle,
        modalMessage=modalMessage,
        correctWord=correctWord,
        fullSentence=fullSentence,
        exampleTranslation=exampleTranslation,
        theme=theme
    )
    return jsonify({'modal_html': modal_html})
