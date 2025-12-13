// ============================================================
// ГОЙДАБЛОКС - ТОЧКА ВХОДА
// ============================================================

// ===== СОБЫТИЯ UI =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🇷🇺 ГОЙДАБЛОКС - Загрузка...');
    
    // Кнопка старта
    document.getElementById('start-btn').addEventListener('click', () => {
        Game.start();
    });
    
    // Кнопка продолжения
    document.getElementById('resume-btn').addEventListener('click', () => {
        InputManager.togglePause();
    });
    
    // Кнопка возврата в меню
    document.getElementById('menu-btn').addEventListener('click', () => {
        Game.returnToMenu();
    });
    
    // Кнопка настроек
    document.getElementById('settings-btn').addEventListener('click', () => {
        SettingsManager.show();
    });
    
    // Закрытие настроек
    document.getElementById('close-settings').addEventListener('click', () => {
        SettingsManager.hide();
    });
    
    // Кнопка "Об игре"
    document.getElementById('credits-btn').addEventListener('click', () => {
        showCredits();
    });
    
    // Запуск загрузки
    Loader.load();
});

// ===== ОТОБРАЖЕНИЕ ТИТРОВ =====
function showCredits() {
    const creditsText = `
ГОЙДАБЛОКС v2.0
━━━━━━━━━━━━━━━━━━━━━

🎮 СИМУЛЯТОР НАСТОЯЩЕЙ РОССИИ 🎮

Бесконечный открытый мир
с процедурной генерацией!

━━━━━━━━━━━━━━━━━━━━━

УПРАВЛЕНИЕ:

🚶 ПЕШКОМ:
WASD - Движение
ПРОБЕЛ - Прыжок
SHIFT - Бег
E - Взаимодействие
F - Войти в машину
Мышь - Камера
ESC - Пауза

🚗 В МАШИНЕ:
WASD - Газ/Тормоз/Поворот
ПРОБЕЛ - Ручник
F - Выйти
R - Радио

━━━━━━━━━━━━━━━━━━━━━

ОСОБЕННОСТИ:
• Бесконечная карта
• Кремль в центре мира
• Процедурная генерация
• Система квестов
• День и ночь
• Разные типы зданий
• Много транспорта
• NPC разных типов

━━━━━━━━━━━━━━━━━━━━━

Сделано с любовью к России! 🇷🇺
    `;
    
    DialogSystem.show('ОБ ИГРЕ', creditsText.trim(), [{ text: 'Закрыть' }]);
}

// ===== ПРЕДЗАГРУЗКА ШРИФТОВ =====
document.fonts.ready.then(() => {
    console.log('📝 Шрифты загружены');
});

// ===== ОБРАБОТКА ОШИБОК =====
window.addEventListener('error', (e) => {
    console.error('❌ Ошибка:', e.message);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Необработанное исключение:', e.reason);
});

// ===== ИНФОРМАЦИЯ В КОНСОЛИ =====
console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║     🇷🇺 ГОЙДАБЛОКС 🇷🇺                  ║
║     Симулятор России v2.0             ║
║                                       ║
║     Бесконечный открытый мир!         ║
║                                       ║
╚═══════════════════════════════════════╝
`);