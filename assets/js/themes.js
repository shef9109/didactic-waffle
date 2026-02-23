/* ═══════════════════════════════════════════════════════════════
   themes.js — Переключение тем оформления
═══════════════════════════════════════════════════════════════ */

const Themes = (() => {

    const ASSET_VER = '20260223-2';

    const THEME_CSS = {
        medieval: `../assets/css/themes/medieval.css?v=${ASSET_VER}`,
        arcane:   `../assets/css/themes/arcane.css?v=${ASSET_VER}`,
        nordic:   `../assets/css/themes/nordic.css?v=${ASSET_VER}`,
        oriental: `../assets/css/themes/oriental.css?v=${ASSET_VER}`,
    };

    /* Применить тему — меняем <link id="theme-link"> */
    function apply(themeId) {
        const href = THEME_CSS[themeId];
        if (!href) return;

        let link = document.getElementById('theme-link');
        if (!link) {
            link = document.createElement('link');
            link.id = 'theme-link';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        link.href = href;

        /* Обновить data-theme на анкете */
        const sheet = document.querySelector('.sheet');
        if (sheet) sheet.dataset.theme = themeId;

        State.setMeta('theme', themeId);
    }

    /* Инициализация — применить текущую тему из state */
    function init() {
        const current = State.getMeta('theme') || 'medieval';
        apply(current);
    }

    return { apply, init };

})();

window.Themes = Themes;
