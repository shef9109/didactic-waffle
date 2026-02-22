/* ═══════════════════════════════════════════════════════════════
   app.js — Точка входа генератора
   Рендер анкеты ТОЛЬКО по кнопке «Применить изменения».
   State обновляется при вводе, но анкета — нет.
═══════════════════════════════════════════════════════════════ */

(function () {

    let _dirty = false;

    /* ══ РЕНДЕР ══ */
    function renderSheet() {
        const container = document.getElementById('sheet-container');
        if (!container) return;

        container.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
        container.style.opacity    = '0';
        container.style.transform  = 'translateY(8px)';

        setTimeout(() => {
            container.innerHTML    = Builder.build(State.get());
            container.style.opacity   = '1';
            container.style.transform = 'none';
        }, 150);

        setDirty(false);
    }

    /* ══ DIRTY FLAG ══ */
    function setDirty(val) {
        _dirty = val;

        /* Кнопка Применить */
        const btn  = document.getElementById('btn-apply');
        const dot  = btn?.querySelector('.apply-dot');
        const text = btn?.querySelector('.apply-text');
        if (!btn) return;

        if (_dirty) {
            btn.classList.add('has-changes');
            if (dot)  dot.style.display  = 'inline-block';
            if (text) text.textContent   = 'Применить изменения';
        } else {
            btn.classList.remove('has-changes');
            if (dot)  dot.style.display  = 'none';
            if (text) text.textContent   = 'Анкета обновлена ✓';
        }

        /* Подсказка над превью */
        const hint     = document.getElementById('preview-hint');
        const hintText = document.getElementById('preview-hint-text');
        if (hint) hint.classList.toggle('dirty', _dirty);
        if (hintText) hintText.textContent = _dirty
            ? 'есть изменения — нажми «Применить»'
            : 'предпросмотр';
    }

    /* ══ TOAST ══ */
    function showToast(msg, type = 'default') {
        document.querySelector('.toast')?.remove();
        const t = document.createElement('div');
        t.className   = `toast toast--${type}`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => {
            t.style.transition = 'opacity .25s, transform .25s';
            t.style.opacity    = '0';
            t.style.transform  = 'translateX(12px)';
            setTimeout(() => t.remove(), 280);
        }, 2200);
    }
    window.showToast = showToast;

    /* ══ СБРОС — единая функция ══ */
    function doReset() {
        if (!confirm('Сбросить все данные к дефолтным?')) return;
        State.reset();
        Sidebar.init();
        renderSheet();
        showToast('↺ Данные сброшены');
    }

    /* ══ URL PARAMS ══ */
    function readURLParams() {
        const p = new URLSearchParams(window.location.search);
        if (p.get('type'))   State.setMeta('type',   p.get('type'));
        if (p.get('system')) State.setMeta('system', p.get('system'));
        if (p.get('theme'))  { State.setMeta('theme', p.get('theme')); Themes.apply(p.get('theme')); }
    }

    /* ══ ACTIVE NAV ══ */
    function markActiveNav() {
        const cur = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href').split('/').pop() === cur);
        });
    }

    /* ══ КНОПКИ ══ */
    function bindButtons() {

        /* Применить */
        document.getElementById('btn-apply')?.addEventListener('click', () => {
            if (!_dirty) return;
            renderSheet();
            Storage.save();
            showToast('✦ Анкета обновлена', 'success');
        });

        /* Скачать HTML — если dirty, сначала применяет */
        document.getElementById('btn-export-html')?.addEventListener('click', () => {
            const go = () => { Export.downloadHTML(); showToast('↓ Скачивание начато'); };
            if (_dirty) { renderSheet(); setTimeout(go, 200); } else { go(); }
        });

        /* Печать */
        document.getElementById('btn-print')?.addEventListener('click', () => {
            if (_dirty) { renderSheet(); setTimeout(() => Export.printSheet(), 200); }
            else Export.printSheet();
        });

        /* Сохранить JSON */
        document.getElementById('btn-save-json')?.addEventListener('click', () => {
            Storage.save();
            Storage.exportJSON();
            showToast('↑ JSON сохранён');
        });

        /* Загрузить JSON */
        document.getElementById('btn-load-file')?.addEventListener('change', async e => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                await Storage.importJSON(file);
                Sidebar.init();
                Themes.init();
                renderSheet();
                showToast('✦ Персонаж загружен', 'success');
            } catch { showToast('✗ Ошибка загрузки', 'error'); }
            e.target.value = '';
        });

        /* Сброс — обе кнопки (шапка и подвал) → одна функция */
        document.getElementById('btn-reset')?.addEventListener('click', doReset);
        document.getElementById('btn-reset-bottom')?.addEventListener('click', doReset);
    }

    /* ══ ЗАПУСК ══ */
    document.addEventListener('DOMContentLoaded', () => {
        readURLParams();
        Storage.load();
        Themes.init();
        Sidebar.init();
        renderSheet();           /* первый рендер — не dirty */

        /* Подписываемся ПОСЛЕ первого рендера, чтобы он не помечал dirty */
        State.subscribe(() => setDirty(true));

        bindButtons();
        markActiveNav();
    });

})();