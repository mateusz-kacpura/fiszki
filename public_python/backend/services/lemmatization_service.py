import nltk
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer

class WordLemmatizer:
    def __init__(self):
        """Initializes the lemmatizer and downloads required NLTK resources."""
        self.lemmatizer = WordNetLemmatizer()
        nltk.download('punkt')
        nltk.download('wordnet')
        nltk.download('averaged_perceptron_tagger')
    
    def get_wordnet_pos(self, treebank_tag):
        """Converts treebank tags to wordnet tags."""
        if treebank_tag.startswith('J'):
            return wordnet.ADJ
        elif treebank_tag.startswith('V'):
            return wordnet.VERB
        elif treebank_tag.startswith('N'):
            return wordnet.NOUN
        elif treebank_tag.startswith('R'):
            return wordnet.ADV
        else:
            return wordnet.NOUN
    
    def lemmatize_word(self, word):
        """Lemmatizes the given word using its part of speech tag."""
        pos_tag = nltk.pos_tag([word])[0][1]
        wordnet_pos = self.get_wordnet_pos(pos_tag)
        return self.lemmatizer.lemmatize(word, wordnet_pos)
