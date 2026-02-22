/* ═══════════════════════════════════════════════════════════════
   state.js — Хранилище данных персонажа
   Единственный источник правды. Все модули читают/пишут сюда.
═══════════════════════════════════════════════════════════════ */

const State = (() => {

    /* ── Дефолтные данные ── */
    const DEFAULTS = {
        meta: {
            theme:  'medieval',
            system: 'free',
            type:   'roleplay',
        },
        character: {
            name:       'Вальдрик',
            class:      'Паладин · Страж · Клинок Тира',
            order:      'Орден Перчатки · Сордкост',
            quote:      'Лучший щит — тот, кто лишает зло возможности нанести удар',
            alignment:  'Законопослушное доброе',
            alignDesc:  'Острое Правосудие. Закон — его закон.',
            personality:'Дисциплинирован, немногословен, не терпит суеты. Принимает решение тогда, когда остальные сомневаются. В хорошей обстановке умеет быть весёлым — его редкая шутка стоит десятка чужих, потому что никто её не ждёт.',
            physical:   'Атлет. Его сила — не в массе, а в ярости, загнанной в клетку дисциплины. Способен маршировать сутками в полном доспехе, не сбивая дыхания.',
            skills:     'Тактика. Выживание. По следам на траве определит число врагов и час прохода. Холодная решимость — его обаяние.',
            finalQuote: 'Он не читал стихов — но по следам на траве мог сказать, сколько орков прошло здесь в полночь, и первым встать на их пути.',
            footer:     'Орден Перчатки · Сордкост · Действующий Страж',
        },
        stats: [
            { name: 'Сила',         val: '19' },
            { name: 'Выносливость', val: '16' },
            { name: 'Мудрость',     val: '15' },
            { name: 'Обаяние',      val: '13' },
        ],
        equips: [
            { name: 'Цвайхендер',    desc: 'Огромный двуручный клинок. Гравировка «Печать Тира» у эфеса, рукоять из кожи варга. Быстросъёмное крепление за спиной.' },
            { name: 'Кинжал',        desc: 'На поясе. Для ближнего боя, когда нет места для замаха.' },
            { name: 'Тяжёлые латы', desc: 'Подогнаны под полный замах. Плащ Ордена Перчатки — белый, с символом сжатого кулака, подбит мехом.' },
            { name: 'В сумке',       desc: 'Освящённое точило, молитвенник в железном переплёте, фляга с вином «для согрева», верёвка, железные колышки.' },
            { name: 'Реликвия',      desc: 'Тяжёлое кольцо-печать с символом Ордена. Заверяет отчёты, предъявляет полномочия властям городов Сордкоста.' },
        ],
    };

    /* ── Текущее состояние (глубокое копирование дефолтов) ── */
    let _state = deepClone(DEFAULTS);

    /* ── Подписчики на изменения ── */
    const _listeners = [];

    /* ── Утилиты ── */
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function notify() {
        _listeners.forEach(fn => fn(_state));
    }

    /* ══ PUBLIC API ══ */
    return {

        /* Получить всё состояние (только чтение — копия) */
        get() {
            return deepClone(_state);
        },

        /* Получить одно поле персонажа */
        getChar(key) {
            return _state.character[key] ?? '';
        },

        /* Получить мету */
        getMeta(key) {
            return _state.meta[key] ?? '';
        },

        /* Обновить поле персонажа */
        setChar(key, value) {
            _state.character[key] = value;
            notify();
        },

        /* Обновить мету */
        setMeta(key, value) {
            _state.meta[key] = value;
            notify();
        },

        /* Характеристики */
        getStats() { return deepClone(_state.stats); },

        setStat(index, field, value) {
            if (_state.stats[index]) {
                _state.stats[index][field] = value;
                notify();
            }
        },

        addStat(name = '', val = '') {
            _state.stats.push({ name, val });
            notify();
        },

        removeStat(index) {
            _state.stats.splice(index, 1);
            notify();
        },

        /* Снаряжение */
        getEquips() { return deepClone(_state.equips); },

        setEquip(index, field, value) {
            if (_state.equips[index]) {
                _state.equips[index][field] = value;
                notify();
            }
        },

        addEquip(name = '', desc = '') {
            _state.equips.push({ name, desc });
            notify();
        },

        removeEquip(index) {
            _state.equips.splice(index, 1);
            notify();
        },

        /* Загрузить всё состояние целиком (из JSON) */
        load(data) {
            _state = deepClone({ ...DEFAULTS, ...data });
            // Убедимся что вложенные объекты тоже замёрджены
            _state.character = { ...DEFAULTS.character, ...(data.character || {}) };
            _state.meta      = { ...DEFAULTS.meta,      ...(data.meta      || {}) };
            if (Array.isArray(data.stats))  _state.stats  = deepClone(data.stats);
            if (Array.isArray(data.equips)) _state.equips = deepClone(data.equips);
            notify();
        },

        /* Сбросить к дефолтам */
        reset() {
            _state = deepClone(DEFAULTS);
            notify();
        },

        /* Подписаться на изменения */
        subscribe(fn) {
            _listeners.push(fn);
        },

        /* Получить дефолты (для сброса отдельных секций) */
        getDefaults() {
            return deepClone(DEFAULTS);
        },
    };

})();

/* Экспорт для использования в других модулях */
// В браузере доступен как глобальный объект State
window.State = State;