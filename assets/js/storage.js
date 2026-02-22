/* ═══════════════════════════════════════════════════════════════
   storage.js — Сохранение и загрузка через localStorage
═══════════════════════════════════════════════════════════════ */

const Storage = (() => {

    const KEY = 'kuznitsa_character';

    /* Сохранить текущее состояние */
    function save() {
        try {
            const data = State.get();
            localStorage.setItem(KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Storage: не удалось сохранить', e);
            return false;
        }
    }

    /* Загрузить из localStorage */
    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            State.load(data);
            return true;
        } catch (e) {
            console.warn('Storage: не удалось загрузить', e);
            return false;
        }
    }

    /* Очистить сохранение */
    function clear() {
        localStorage.removeItem(KEY);
    }

    /* Есть ли сохранение */
    function hasSave() {
        return localStorage.getItem(KEY) !== null;
    }

    /* Экспорт в JSON-файл */
    function exportJSON() {
        const data = State.get();
        const name = (data.character?.name || 'персонаж').replace(/\s+/g, '_');
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${name}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    /* Импорт из JSON-файла */
    function importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const data = JSON.parse(e.target.result);
                    State.load(data);
                    resolve(data);
                } catch (err) {
                    reject(new Error('Неверный формат JSON'));
                }
            };
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    /* Автосохранение при каждом изменении state */
    function enableAutosave() {
        State.subscribe(() => save());
    }

    return { save, load, clear, hasSave, exportJSON, importJSON, enableAutosave };

})();

window.Storage = Storage;