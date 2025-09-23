from flask import render_template, request, jsonify
from flask_login import login_required

@login_required
def modal_pop_up_for_image_learning():
    # print(os.path.abspath('templates/learning/modals/pop-up.html'))
    # Pobierz parametry modalnego okienka
    selectedWord = request.args.get('selectedWord')
    correctWord = request.args.get('correctWord')
    theme = request.args.get('theme', 'light')
    modalHeaderClass = 'bg-success text-white' if selectedWord == correctWord else 'bg-danger text-white'
    modalTitle = 'Poprawna odpowiedź!' if selectedWord == correctWord else 'Nieprawidłowa odpowiedź!'
    modalMessage = modalTitle
    
    # Renderuj szablon modalnego okienka
    modal_html = render_template(
        'learning/modals/image-pop-up.html',
        modalHeaderClass=modalHeaderClass,
        modalTitle=modalTitle,
        modalMessage=modalMessage,
        correctWord=correctWord,
        theme=theme
    )
    return jsonify({'modal_html': modal_html})
