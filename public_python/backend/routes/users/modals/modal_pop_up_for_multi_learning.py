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
    modalTitle = 'Poprawna odpowiedź!' if isCorrect else 'Nieprawidłowa odpowiedź!'
    modalMessage = modalTitle
    correctWordMessage = correctTranslation
    fullSentenceMessage = ''  # Możesz tu dodać pełne zdanie, jeśli jest dostępne
    sentenceTranslation = ''  # Możesz tu dodać tłumaczenie zdania, jeśli jest dostępne

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
