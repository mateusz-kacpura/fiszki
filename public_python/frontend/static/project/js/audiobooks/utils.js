// utils.js

export function showAlert(message, type) {
    // Implementacja funkcji wyświetlającej alerty
}

export function showAlertOnceInInterval(message, type) {
    if (!alertShown) {
        showAlert(message, type);
        alertShown = true;

        setTimeout(() => {
            alertShown = false;
        }, 5000);
    }
}

export async function translateText(text, targetLang = 'en') {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        showAlert('Tłumaczenie wykonane pomyślnie');
        return data[0][0][0];
    } catch (error) {
        console.error('Błąd tłumaczenia:', error);
        showAlert('Błąd tłumaczenia', 'danger');
        return 'Błąd tłumaczenia';
    }
}