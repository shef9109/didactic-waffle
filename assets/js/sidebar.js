/* ═══════════════════════════════════════════════════════════════
   sidebar.js — Логика панели редактора
   Рендерит поля, слушает ввод, пишет в State.
═══════════════════════════════════════════════════════════════ */

const Sidebar = (() => {

    /* ── Хелперы ── */
    function el(id) { return document.getElementById(id); }

    function bindInput(id, stateKey) {
        const input = el(id);
        if (!input) return;
        input.value = State.getChar(stateKey);
        input.addEventListener('input', () => State.setChar(stateKey, input.value));
    }

    function bindMeta(id, metaKey) {
        const input = el(id);
        if (!input) return;
        input.value = State.getMeta(metaKey);
        input.addEventListener('input', () => State.setMeta(metaKey, input.value));
    }

    /* ══════════════════════════════════════════════
       РЕНДЕР ХАРАКТЕРИСТИК
    ══════════════════════════════════════════════ */
    function renderStats() {
        const list = el('stats-list');
        if (!list) return;
        list.innerHTML = '';

        State.getStats().forEach((s, i) => {
            const row = document.createElement('div');
            row.className = 'stat-row';
            row.innerHTML = `
        <input class="sb-input" type="text" placeholder="Название" value="${s.name}">
        <input class="sb-number" type="number" min="1" max="999" placeholder="0" value="${s.val}">
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
            });

            list.appendChild(row);
        });
    }

    /* ══════════════════════════════════════════════
       РЕНДЕР СНАРЯЖЕНИЯ
    ══════════════════════════════════════════════ */
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
            });

            list.appendChild(card);
        });
    }

    /* ══════════════════════════════════════════════
       ПЕРЕКЛЮЧАТЕЛЬ ТЕМ
    ══════════════════════════════════════════════ */
    function renderThemePicker() {
        const picker = el('theme-picker');
        if (!picker) return;

        const themes = [
            { id: 'medieval', label: 'Средневековье', swatchClass: 'swatch-medieval' },
            { id: 'arcane',   label: 'Магическая',    swatchClass: 'swatch-arcane'   },
            { id: 'nordic',   label: 'Северная',       swatchClass: 'swatch-nordic'   },
            { id: 'oriental', label: 'Восточная',      swatchClass: 'swatch-oriental' },
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
                State.setMeta('theme', t.id);
                Themes.apply(t.id);
                renderThemePicker(); // перерисовать активную кнопку
            });
            picker.appendChild(btn);
        });
    }

    /* ══════════════════════════════════════════════
       ИНИЦИАЛИЗАЦИЯ
    ══════════════════════════════════════════════ */
    function init() {
        /* Основные поля персонажа */
        const fields = [
            ['f-name',        'name'       ],
            ['f-class',       'class'      ],
            ['f-order',       'order'      ],
            ['f-quote',       'quote'      ],
            ['f-alignment',   'alignment'  ],
            ['f-align-desc',  'alignDesc'  ],
            ['f-personality', 'personality'],
            ['f-physical',    'physical'   ],
            ['f-skills',      'skills'     ],
            ['f-final-quote', 'finalQuote' ],
            ['f-footer',      'footer'     ],
        ];
        fields.forEach(([id, key]) => bindInput(id, key));

        /* Динамические списки */
        renderStats();
        renderEquips();
        renderThemePicker();

        /* Кнопки добавления */
        const addStatBtn = el('btn-add-stat');
        if (addStatBtn) addStatBtn.addEventListener('click', () => State.addStat());

        const addEquipBtn = el('btn-add-equip');
        if (addEquipBtn) addEquipBtn.addEventListener('click', () => State.addEquip());

        /* Перерисовывать динамические списки при изменении state */
        State.subscribe(() => {
            renderStats();
            renderEquips();
        });
    }

    return { init, renderStats, renderEquips, renderThemePicker };

})();

window.Sidebar = Sidebar;