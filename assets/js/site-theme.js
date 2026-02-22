/* ═══════════════════════════════════════════════════════════════
   site-theme.js — Глобальная тема сайта (не только генератор)
═══════════════════════════════════════════════════════════════ */

const SiteTheme = (() => {
    const KEY = 'kuznitsa_site_theme';
    const FALLBACK = 'medieval';
    const THEMES = new Set(['medieval', 'arcane', 'nordic', 'oriental']);

    function normalize(themeId) {
        return THEMES.has(themeId) ? themeId : FALLBACK;
    }

    function apply(themeId) {
        const normalized = normalize(themeId);
        document.body?.setAttribute('data-site-theme', normalized);

        if (typeof State !== 'undefined') {
            State.setMeta('theme', normalized);
        }
        if (typeof Themes !== 'undefined') {
            Themes.apply(normalized);
        }

        return normalized;
    }

    function save(themeId) {
        localStorage.setItem(KEY, normalize(themeId));
    }

    function load() {
        return normalize(localStorage.getItem(KEY) || FALLBACK);
    }

    function set(themeId) {
        const normalized = apply(themeId);
        save(normalized);
        return normalized;
    }

    function syncThemesCards(themeId) {
        document.querySelectorAll('.theme-card').forEach(card => {
            const isActive = card.dataset.theme === themeId;
            card.classList.toggle('active', isActive);
            const badge = card.querySelector('.theme-card-badge');
            if (badge) badge.textContent = isActive ? 'Активна' : 'Выбрать';
        });

        const go = document.getElementById('go-generator');
        if (go) go.href = `generator.html?theme=${themeId}`;
    }

    function init() {
        const current = apply(load());
        syncThemesCards(current);
    }

    return { init, set, apply, load };
})();

window.SiteTheme = SiteTheme;

window.selectTheme = function selectTheme(themeId) {
    const current = SiteTheme.set(themeId);
    document.body?.setAttribute('data-site-theme', current);

    if (typeof Themes !== 'undefined') {
        Themes.apply(current);
    }

    const go = document.getElementById('go-generator');
    if (go) go.href = `generator.html?theme=${current}`;

    document.querySelectorAll('.theme-card').forEach(card => {
        const isActive = card.dataset.theme === current;
        card.classList.toggle('active', isActive);
        const badge = card.querySelector('.theme-card-badge');
        if (badge) badge.textContent = isActive ? 'Активна' : 'Выбрать';
    });
};

document.addEventListener('DOMContentLoaded', () => {
    SiteTheme.init();
});