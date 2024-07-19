import spacy

nlp = spacy.load('en_core_web_sm')

def lemmatize(text):
    doc = nlp(text)
    return [token.lemma_ for token in doc]
