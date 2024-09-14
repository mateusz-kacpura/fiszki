from flask import render_template, request, jsonify
from flask_login import login_required

@login_required
def modal_pop_up_for_definition_learning():
    try:
        resultMessage = request.args.get('resultMessage', '')
        selectedWord = request.args.get('selectedWord', '')
        word = request.args.get('word', '')
        print(word)
        print(selectedWord)
        translation = request.args.get('translation', '')
        definition = request.args.get('definition', '')
        theme = request.args.get('theme', 'light')

        # Determine if the answer is correct
        isCorrect = resultMessage == 'Correct!'
        modalHeaderClass = 'bg-success text-white' if selectedWord == word else 'bg-danger text-white'
        modalTitle = 'Correct Answer!' if isCorrect else 'Incorrect Answer!'
        modalMessage = f'Your choice: {selectedWord}' if not isCorrect else ''
        selectedWord = f"Your choice:  {selectedWord}"
        
        # Render the modal HTML using Jinja2 template
        modal_html = render_template(
            'learning/modals/definition-pop-up.html',
            modalHeaderClass=modalHeaderClass,
            modalTitle=modalTitle,
            modalMessage=modalMessage,
            correctWord=translation,
            fullSentence=definition,
            exampleTranslation=word,
            theme=theme
        )

        return jsonify({'modal_html': modal_html})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
