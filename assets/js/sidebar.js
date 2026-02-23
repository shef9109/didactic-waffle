/*
   sidebar.js - логика панели редактора
*/

const Sidebar = (() => {

    let _isBound = false;

    function el(id) { return document.getElementById(id); }

    const TYPE_PROFILES = {
        roleplay: {
            label: 'Ролевая',
            icon: '⚔',
            defaultSeal: 'gauntlet',
            ui: {
                sectionPersonality: 'Личность',
                sectionStats: 'Характеристики',
                sectionDescription: 'Описание',
                sectionEquip: 'Снаряжение',
                lblClass: 'Класс · Роль · Прозвище',
                lblOrder: 'Фракция / Орден',
                lblQuote: 'Девиз / Цитата',
                lblPersonality: 'Характер',
                lblPhysical: 'Физические качества',
                lblSkills: 'Навыки и таланты',
                phClass: 'Паладин · Страж...',
                phOrder: 'Орден Перчатки...',
                phSkills: 'Особые умения...'
            },
            template: {
                character: {
                    name: 'Вальдрик',
                    class: 'Паладин · Страж · Клинок Тира',
                    order: 'Орден Перчатки · Сордкост',
                    quote: 'Лучший щит — тот, кто лишает зло возможности нанести удар',
                    alignment: 'Законопослушное доброе',
                    alignDesc: 'Острое Правосудие. Закон — его закон.',
                    personality: 'Дисциплинирован, немногословен, не терпит суеты.',
                    physical: 'Атлет, вынослив, держит строй под давлением.',
                    skills: 'Тактика, выживание, работа с двуручным оружием.',
                    finalQuote: 'Первым встает на пути угрозы.',
                    footer: 'Орден Перчатки · Сордкост · Действующий Страж',
                    portrait: ''
                },
                stats: [
                    { name: 'Сила', val: '19' },
                    { name: 'Выносливость', val: '16' },
                    { name: 'Мудрость', val: '15' },
                    { name: 'Обаяние', val: '13' },
                ],
                equips: [
                    { name: 'Двуручный меч', desc: 'Основное оружие орденского стража.' },
                    { name: 'Тяжелые латы', desc: 'Символ долга и линии фронта.' },
                    { name: 'Печать ордена', desc: 'Подтверждает полномочия на миссии.' },
                ]
            }
        },
        guild: {
            label: 'Гильдейская',
            icon: '🛡',
            defaultSeal: 'shield',
            ui: {
                sectionPersonality: 'Досье',
                sectionStats: 'Служебные параметры',
                sectionDescription: 'Профиль',
                sectionEquip: 'Инвентарь гильдии',
                lblClass: 'Ранг · Должность · Специализация',
                lblOrder: 'Гильдия / Дом / Отдел',
                lblQuote: 'Девиз гильдии / Кодекс',
                lblPersonality: 'Репутация',
                lblPhysical: 'Служебная история',
                lblSkills: 'Профессиональные навыки',
                phClass: 'Мастер-следопыт · 2 ранг',
                phOrder: 'Гильдия Серебряной Нити',
                phSkills: 'Контракты, разведка, переговоры'
            },
            template: {
                character: {
                    name: 'Эйрин Тенелист',
                    class: 'Мастер-следопыт · 2 ранг',
                    order: 'Гильдия Серебряной Нити',
                    quote: 'Долг выше страха',
                    alignment: 'Нейтральное',
                    alignDesc: 'Соблюдает устав и защищает репутацию гильдии.',
                    personality: 'Надежный переговорщик, аккуратна в рисках.',
                    physical: '12 успешных миссий, 0 срывов срока.',
                    skills: 'Контрразведка, агентурная сеть, вербовка.',
                    finalQuote: 'Репутация гильдии куется делами.',
                    footer: 'Гильдия Серебряной Нити · Активный контракт',
                    portrait: ''
                },
                stats: [
                    { name: 'Ранг', val: '2' },
                    { name: 'Репутация', val: '89' },
                    { name: 'Контракты', val: '12' },
                    { name: 'Надежность', val: '97' },
                ],
                equips: [
                    { name: 'Жетон гильдии', desc: 'Идентификатор члена гильдии.' },
                    { name: 'Архив миссий', desc: 'История заданий и клиентов.' },
                    { name: 'Набор агента', desc: 'Шифры, отмычки, маршрутные карты.' },
                ]
            }
        },
        combat: {
            label: 'Боевая',
            icon: '🗡',
            defaultSeal: 'sword',
            ui: {
                sectionPersonality: 'Боевой профиль',
                sectionStats: 'Боевые показатели',
                sectionDescription: 'Тактика',
                sectionEquip: 'Арсенал',
                lblClass: 'Роль на поле боя',
                lblOrder: 'Отряд / Командование',
                lblQuote: 'Боевой девиз',
                lblPersonality: 'Боевой стиль',
                lblPhysical: 'Тактика и построения',
                lblSkills: 'Ключевые навыки',
                phClass: 'Штурмовик · Авангард',
                phOrder: '3-й Железный легион',
                phSkills: 'Парирование, контратака, прорыв'
            },
            template: {
                character: {
                    name: 'Бран Рифт',
                    class: 'Штурмовик · Авангард',
                    order: '3-й Железный легион',
                    quote: 'Линия держится, пока мы держим линию',
                    alignment: 'Законное нейтральное',
                    alignDesc: 'Подчинение тактике и приказу.',
                    personality: 'Агрессивный вход, плотная защита флангов.',
                    physical: 'Работа в щитовом строю, короткие рывки, смена ритма боя.',
                    skills: 'Парирование, контроль дистанции, добивание цели.',
                    finalQuote: 'Он не ждет удара — он его назначает.',
                    footer: '3-й Железный легион · Линия фронта',
                    portrait: ''
                },
                stats: [
                    { name: 'Атака', val: '18' },
                    { name: 'Защита', val: '17' },
                    { name: 'Скорость', val: '12' },
                    { name: 'Инициатива', val: '15' },
                ],
                equips: [
                    { name: 'Штурмовой клинок', desc: 'Баланс для ближнего боя.' },
                    { name: 'Башенный щит', desc: 'Удержание позиции и прикрытие группы.' },
                    { name: 'Полевой набор', desc: 'Бинты, ремкомплект, сигнальные метки.' },
                ]
            }
        },
        arcane: {
            label: 'Магическая',
            icon: '✦',
            defaultSeal: 'rune',
            ui: {
                sectionPersonality: 'Профиль мага',
                sectionStats: 'Параметры магии',
                sectionDescription: 'Арканум',
                sectionEquip: 'Артефакты и фокусы',
                lblClass: 'Школа · Традиция · Ступень',
                lblOrder: 'Ковен / Коллегия / Башня',
                lblQuote: 'Магический девиз',
                lblPersonality: 'Темперамент мага',
                lblPhysical: 'Источник силы',
                lblSkills: 'Заклинания и школы',
                phClass: 'Эвокатор · Алый круг',
                phOrder: 'Коллегия Янтарной Башни',
                phSkills: 'Руны, щиты, ритуалы'
            },
            template: {
                character: {
                    name: 'Леара Нокс',
                    class: 'Эвокатор · Алый круг',
                    order: 'Коллегия Янтарной Башни',
                    quote: 'Знание — это форма воли',
                    alignment: 'Нейтральное',
                    alignDesc: 'Балансирует между запретом и пользой магии.',
                    personality: 'Холодный анализ, осторожные решения.',
                    physical: 'Источник: резонансный кристалл, запас маны высокий.',
                    skills: 'Руны барьера, импульсные заклятия, ритуальная вязь.',
                    finalQuote: 'Заклинание завершено еще до первого жеста.',
                    footer: 'Коллегия Янтарной Башни · Старший адепт',
                    portrait: ''
                },
                stats: [
                    { name: 'Мана', val: '22' },
                    { name: 'Контроль', val: '18' },
                    { name: 'Фокус', val: '17' },
                    { name: 'Стабильность', val: '16' },
                ],
                equips: [
                    { name: 'Гримуар', desc: 'Ритуалы и персональные рунические формулы.' },
                    { name: 'Фокус-кристалл', desc: 'Усиливает точность и скорость плетений.' },
                    { name: 'Печать коллегии', desc: 'Право на доступ к закрытым архивам.' },
                ]
            }
        },
        free: {
            label: 'Свободная',
            icon: '◈',
            defaultSeal: 'lotus',
            ui: {
                sectionPersonality: 'Гибкая структура',
                sectionStats: 'Пользовательские параметры',
                sectionDescription: 'Произвольные разделы',
                sectionEquip: 'Пользовательский список',
                lblClass: 'Тип / Роль / Тег',
                lblOrder: 'Источник / Фракция / Метка',
                lblQuote: 'Девиз / Цитата',
                lblPersonality: 'Раздел I',
                lblPhysical: 'Раздел II',
                lblSkills: 'Раздел III',
                phClass: 'Свободный формат',
                phOrder: 'Любая система',
                phSkills: 'Наполнение на ваш выбор'
            },
            template: {
                character: {
                    name: 'Пользовательский герой',
                    class: 'Свободный формат',
                    order: 'Любая система',
                    quote: 'Сценарий определяешь ты',
                    alignment: 'На выбор',
                    alignDesc: 'Полностью кастомная структура анкеты.',
                    personality: 'Опиши первый блок данных.',
                    physical: 'Опиши второй блок данных.',
                    skills: 'Опиши третий блок данных.',
                    finalQuote: 'Финальная часть в свободной форме.',
                    footer: 'Свободный формат · Пользовательский шаблон',
                    portrait: ''
                },
                stats: [
                    { name: 'Параметр 1', val: '10' },
                    { name: 'Параметр 2', val: '10' },
                    { name: 'Параметр 3', val: '10' },
                ],
                equips: [
                    { name: 'Предмет 1', desc: 'Описание предмета.' },
                    { name: 'Предмет 2', desc: 'Описание предмета.' },
                ]
            }
        }
    };

    const SEALS = [
        { id: 'gauntlet', label: 'Перчатка', icon: '✊' },
        { id: 'sword', label: 'Клинок', icon: '⚔' },
        { id: 'shield', label: 'Щит', icon: '🛡' },
        { id: 'flame', label: 'Пламя', icon: '🔥' },
        { id: 'rune', label: 'Руна', icon: '✶' },
        { id: 'lotus', label: 'Лотос', icon: '✿' },
    ];

    const SEAL_STYLES = [
        { id: 'wax', label: 'Воск' },
        { id: 'steel', label: 'Сталь' },
        { id: 'arcane', label: 'Аркана' },
        { id: 'jade', label: 'Нефрит' },
    ];

    function bindInput(id, stateKey) {
        const input = el(id);
        if (!input) return;

        if (document.activeElement !== input) input.value = State.getChar(stateKey);

        if (input.dataset.bound === '1') return;
        input.addEventListener('input', () => State.setChar(stateKey, input.value));
        input.dataset.bound = '1';
    }

    function setText(id, value) {
        const node = el(id);
        if (node) node.textContent = value;
    }

    function setPlaceholder(id, value) {
        const node = el(id);
        if (node) node.placeholder = value;
    }

    function updateTypeUI(typeId) {
        const p = TYPE_PROFILES[typeId] || TYPE_PROFILES.roleplay;
        setText('section-personality', p.ui.sectionPersonality);
        setText('section-stats', p.ui.sectionStats);
        setText('section-description', p.ui.sectionDescription);
        setText('section-equip', p.ui.sectionEquip);

        setText('lbl-class', p.ui.lblClass);
        setText('lbl-order', p.ui.lblOrder);
        setText('lbl-quote', p.ui.lblQuote);
        setText('lbl-personality', p.ui.lblPersonality);
        setText('lbl-physical', p.ui.lblPhysical);
        setText('lbl-skills', p.ui.lblSkills);

        setPlaceholder('f-class', p.ui.phClass);
        setPlaceholder('f-order', p.ui.phOrder);
        setPlaceholder('f-skills', p.ui.phSkills);

        const photo = el('group-photo');
        if (photo) photo.classList.toggle('hidden', typeId !== 'guild');

        syncPhotoControls();
    }

    function renderStats() {
        const list = el('stats-list');
        if (!list) return;
        list.innerHTML = '';

        State.getStats().forEach((s, i) => {
            const row = document.createElement('div');
            row.className = 'stat-row';
            row.innerHTML = `
        <input class="sb-input" type="text" placeholder="Название" value="${s.name}">
        <input class="sb-number" type="number" min="0" max="999" placeholder="0" value="${s.val}">
        <button class="btn-remove" title="Удалить">×</button>
      `;

            row.querySelectorAll('input')[0].addEventListener('input', e => {
                State.setStat(i, 'name', e.target.value);
            });
            row.querySelectorAll('input')[1].addEventListener('input', e => {
                State.setStat(i, 'val', e.target.value);
            });
            row.querySelector('.btn-remove').addEventListener('click', () => {
                State.removeStat(i);
                renderStats();
            });

            list.appendChild(row);
        });
    }

    function renderEquips() {
        const list = el('equip-list');
        if (!list) return;
        list.innerHTML = '';

        State.getEquips().forEach((e, i) => {
            const card = document.createElement('div');
            card.className = 'equip-card';
            card.innerHTML = `
        <div class="equip-card-top">
          <input class="sb-input" type="text" placeholder="Название предмета" value="${e.name}">
          <button class="btn-remove" title="Удалить">×</button>
        </div>
        <textarea class="sb-textarea" rows="2" placeholder="Описание...">${e.desc}</textarea>
      `;

            card.querySelector('input').addEventListener('input', ev => {
                State.setEquip(i, 'name', ev.target.value);
            });
            card.querySelector('textarea').addEventListener('input', ev => {
                State.setEquip(i, 'desc', ev.target.value);
            });
            card.querySelector('.btn-remove').addEventListener('click', () => {
                State.removeEquip(i);
                renderEquips();
            });

            list.appendChild(card);
        });
    }

    function applyTypeTemplate(typeId, replaceData = true) {
        const p = TYPE_PROFILES[typeId] || TYPE_PROFILES.roleplay;
        State.setMeta('type', typeId);
        State.setMeta('seal', p.defaultSeal);
        updateTypeUI(typeId);

        if (replaceData) {
            State.setCharacter(p.template.character);
            State.replaceStats(p.template.stats);
            State.replaceEquips(p.template.equips);
            State.setMeta('photoX', 50);
            State.setMeta('photoY', 50);
            State.setMeta('photoScale', 100);
            renderStats();
            renderEquips();
        }

        renderTypePicker();
        renderSealPicker();
        syncPhotoControls();
    }

    function renderTypePicker() {
        const picker = el('type-picker');
        if (!picker) return;

        picker.innerHTML = '';
        const current = State.getMeta('type') || 'roleplay';

        Object.entries(TYPE_PROFILES).forEach(([id, p]) => {
            const btn = document.createElement('button');
            btn.className = `theme-option${id === current ? ' active' : ''}`;
            btn.dataset.type = id;
            btn.innerHTML = `
              <div class="theme-option-swatch swatch-token">${p.icon}</div>
              <span class="theme-option-name">${p.label}</span>
            `;
            btn.addEventListener('click', () => applyTypeTemplate(id, true));
            picker.appendChild(btn);
        });
    }

    function renderSealPicker() {
        const picker = el('seal-picker');
        if (!picker) return;

        picker.innerHTML = '';
        const current = State.getMeta('seal') || 'gauntlet';

        SEALS.forEach(s => {
            const btn = document.createElement('button');
            btn.className = `theme-option${s.id === current ? ' active' : ''}`;
            btn.dataset.seal = s.id;
            btn.innerHTML = `
              <div class="theme-option-swatch swatch-token">${s.icon}</div>
              <span class="theme-option-name">${s.label}</span>
            `;
            btn.addEventListener('click', () => {
                State.setMeta('seal', s.id);
                renderSealPicker();
            });
            picker.appendChild(btn);
        });
    }

    function renderSealStylePicker() {
        const picker = el('seal-style-picker');
        if (!picker) return;

        picker.innerHTML = '';
        const current = State.getMeta('sealStyle') || 'wax';

        SEAL_STYLES.forEach(s => {
            const btn = document.createElement('button');
            btn.className = `seal-style-option${s.id === current ? ' active' : ''}`;
            btn.textContent = s.label;
            btn.addEventListener('click', () => {
                State.setMeta('sealStyle', s.id);
                renderSealStylePicker();
            });
            picker.appendChild(btn);
        });
    }

    function renderThemePicker() {
        const picker = el('theme-picker');
        if (!picker) return;

        const themes = [
            { id: 'medieval', label: 'Средневековье', swatchClass: 'swatch-medieval' },
            { id: 'arcane', label: 'Магическая', swatchClass: 'swatch-arcane' },
            { id: 'nordic', label: 'Северная', swatchClass: 'swatch-nordic' },
            { id: 'oriental', label: 'Восточная', swatchClass: 'swatch-oriental' },
        ];

        picker.innerHTML = '';
        const current = State.getMeta('theme');

        themes.forEach(t => {
            const btn = document.createElement('button');
            btn.className = `theme-option${t.id === current ? ' active' : ''}`;
            btn.dataset.theme = t.id;
            btn.innerHTML = `
        <div class="theme-option-swatch ${t.swatchClass}"></div>
        <span class="theme-option-name">${t.label}</span>
      `;
            btn.addEventListener('click', () => {
                if (typeof SiteTheme !== 'undefined') {
                    SiteTheme.set(t.id);
                } else {
                    State.setMeta('theme', t.id);
                    Themes.apply(t.id);
                }
                renderThemePicker();
            });
            picker.appendChild(btn);
        });
    }

    function bindPhotoControls() {
        const input = el('f-photo');
        const clear = el('btn-clear-photo');
        const rx = el('f-photo-x');
        const ry = el('f-photo-y');
        const rs = el('f-photo-scale');
        const reset = el('btn-reset-photo-frame');

        if (input && input.dataset.bound !== '1') {
            input.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = () => {
                    State.setChar('portrait', reader.result || '');
                    if (!Number.isFinite(+State.getMeta('photoX'))) State.setMeta('photoX', 50);
                    if (!Number.isFinite(+State.getMeta('photoY'))) State.setMeta('photoY', 50);
                    if (!Number.isFinite(+State.getMeta('photoScale'))) State.setMeta('photoScale', 100);
                    syncPhotoControls();
                };
                reader.readAsDataURL(file);
            });
            input.dataset.bound = '1';
        }

        if (clear && clear.dataset.bound !== '1') {
            clear.addEventListener('click', () => {
                State.setChar('portrait', '');
                State.setMeta('photoX', 50);
                State.setMeta('photoY', 50);
                State.setMeta('photoScale', 100);
                if (input) input.value = '';
                syncPhotoControls();
            });
            clear.dataset.bound = '1';
        }

        if (rx && rx.dataset.bound !== '1') {
            rx.addEventListener('input', () => {
                State.setMeta('photoX', Number(rx.value));
                syncPhotoControls();
            });
            rx.dataset.bound = '1';
        }

        if (ry && ry.dataset.bound !== '1') {
            ry.addEventListener('input', () => {
                State.setMeta('photoY', Number(ry.value));
                syncPhotoControls();
            });
            ry.dataset.bound = '1';
        }

        if (rs && rs.dataset.bound !== '1') {
            rs.addEventListener('input', () => {
                State.setMeta('photoScale', Number(rs.value));
                syncPhotoControls();
            });
            rs.dataset.bound = '1';
        }

        if (reset && reset.dataset.bound !== '1') {
            reset.addEventListener('click', () => {
                State.setMeta('photoX', 50);
                State.setMeta('photoY', 50);
                State.setMeta('photoScale', 100);
                syncPhotoControls();
            });
            reset.dataset.bound = '1';
        }

        syncPhotoControls();
    }

    function syncPhotoControls() {
        const rx = el('f-photo-x');
        const ry = el('f-photo-y');
        const rs = el('f-photo-scale');
        const vx = el('f-photo-x-value');
        const vy = el('f-photo-y-value');
        const vs = el('f-photo-scale-value');

        const x = Number.isFinite(+State.getMeta('photoX')) ? +State.getMeta('photoX') : 50;
        const y = Number.isFinite(+State.getMeta('photoY')) ? +State.getMeta('photoY') : 50;
        const scale = Number.isFinite(+State.getMeta('photoScale')) ? +State.getMeta('photoScale') : 100;

        if (rx) rx.value = String(x);
        if (ry) ry.value = String(y);
        if (rs) rs.value = String(scale);
        if (vx) vx.textContent = `${x}%`;
        if (vy) vy.textContent = `${y}%`;
        if (vs) vs.textContent = `${scale}%`;
    }

    function init() {
        const fields = [
            ['f-name', 'name'],
            ['f-class', 'class'],
            ['f-order', 'order'],
            ['f-quote', 'quote'],
            ['f-alignment', 'alignment'],
            ['f-align-desc', 'alignDesc'],
            ['f-personality', 'personality'],
            ['f-physical', 'physical'],
            ['f-skills', 'skills'],
            ['f-final-quote', 'finalQuote'],
            ['f-footer', 'footer'],
        ];
        fields.forEach(([id, key]) => bindInput(id, key));

        renderStats();
        renderEquips();
        renderThemePicker();
        renderTypePicker();
        renderSealPicker();
        renderSealStylePicker();
        updateTypeUI(State.getMeta('type') || 'roleplay');
        bindPhotoControls();
        syncPhotoControls();

        if (_isBound) return;

        const addStatBtn = el('btn-add-stat');
        if (addStatBtn) {
            addStatBtn.addEventListener('click', () => {
                State.addStat();
                renderStats();
            });
        }

        const addEquipBtn = el('btn-add-equip');
        if (addEquipBtn) {
            addEquipBtn.addEventListener('click', () => {
                State.addEquip();
                renderEquips();
            });
        }

        _isBound = true;
    }

    return {
        init,
        renderStats,
        renderEquips,
        renderThemePicker,
        renderTypePicker,
        applyTypeTemplate,
        updateTypeUI
    };

})();

window.Sidebar = Sidebar;
