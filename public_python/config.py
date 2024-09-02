import os

class Config:
    # Klucz do zabezpieczania sesji
    SECRET_KEY = os.urandom(24)

    # Możesz dodać inne opcje konfiguracyjne, jeśli są wymagane
    REGISTRATION_ENABLED = True  # Domyślnie włączona