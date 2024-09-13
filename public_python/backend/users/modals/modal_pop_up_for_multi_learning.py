from flask import render_template, request, jsonify
from flask_login import login_required

@login_required
def modal_pop_up_for_multi_learning():
    # Pobierz parametry modalnego okienka
    userTranslation = request.args.get('userTranslation')
    correctTranslation = request.args.get('correctTranslation')
    theme = request.args.get('theme', 'light')
    isCorrect = userTranslation.lower() == correctTranslation.lower()
    modalHeaderClass = 'bg-success text-white' if isCorrect else 'bg-danger text-white'
    modalTitle = 'Poprawna odpowiedĹş!' if isCorrect else 'NieprawidĹ‚owa odpowiedĹş!'
    modalMessage = modalTitle
    correctWordMessage = correctTranslation
    fullSentenceMessage = ''  # MoĹĽesz tu dodaÄ‡ peĹ‚ne zdanie, jeĹ›li jest dostÄ™pne
    sentenceTranslation = ''  # MoĹĽesz tu dodaÄ‡ tĹ‚umaczenie zdania, jeĹ›li jest dostÄ™pne

    # Renderuj szablon modalnego okienka
    modal_html = render_template(
        'learning/modals/multi-pop-up.html',
        modalHeaderClass=modalHeaderClass,
        modalTitle=modalTitle,
        modalMessage=modalMessage,
        correctTranslation=correctWordMessage,
        fullSentenceMessage=fullSentenceMessage,
        sentenceTranslation=sentenceTranslation,
        theme=theme
    )
    return jsonify({'modal_html': modal_html})
