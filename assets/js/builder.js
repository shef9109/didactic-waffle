/* ═══════════════════════════════════════════════════════════════
   builder.js — Сборка HTML анкеты из данных State
   Чистая функция: принимает данные → возвращает HTML строку.
   Не трогает DOM напрямую, только возвращает разметку.
═══════════════════════════════════════════════════════════════ */

const Builder = (() => {

    /* ── Утилиты ── */
    function esc(s) {
        return String(s ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function nl2br(s) {
        return esc(s).replace(/\n/g, '<br>');
    }

    /* ── Иконка для предмета снаряжения ── */
    function equipBullet(name) {
        const map = {
            'меч': '⚔', 'цвайхендер': '⚔', 'клинок': '⚔', 'сабля': '⚔', 'рапира': '⚔',
            'кинжал': '🗡', 'нож': '🗡', 'кортик': '🗡',
            'лук': '🏹', 'арбалет': '🏹',
            'топор': '🪓', 'секира': '🪓',
            'посох': '🔱', 'жезл': '🔱', 'скипетр': '🔱',
            'доспех': '🛡', 'латы': '🛡', 'броня': '🛡', 'кольчуга': '🛡',
            'щит': '🛡', 'шлем': '⛑',
            'плащ': '🧥', 'мантия': '🧥', 'накидка': '🧥',
            'сумка': '◈', 'мешок': '◈', 'котомка': '◈',
            'реликвия': '◉', 'кольцо': '◉', 'амулет': '◉', 'медальон': '◉', 'талисман': '◉',
            'книга': '📖', 'молитвенник': '📖', 'гримуар': '📖', 'том': '📖',
            'свиток': '📜', 'карта': '📜',
            'зелье': '⚗', 'фляга': '⚗', 'склянка': '⚗', 'бутыль': '⚗',
            'перчатка': '🧤', 'рукавица': '🧤',
            'сапоги': '👢', 'ботинки': '👢',
            'лошадь': '🐴', 'конь': '🐴',
        };
        const low = name.toLowerCase();
        for (const [k, sym] of Object.entries(map)) {
            if (low.includes(k)) return sym;
        }
        return '◈';
    }

    /* ── Колонки для сетки характеристик ── */
    function statsCols(n) {
        if (n <= 0) return 1;
        if (n <= 3) return n;
        if (n <= 4) return 4;
        if (n <= 6) return 3;
        if (n <= 8) return 4;
        return Math.min(n, 5);
    }

    /* ── SVG угловых орнаментов ── */
    const CORNER_SVG = `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 2 L2 30 M2 2 L30 2" stroke="#8a6e28" stroke-width="1.5"/>
  <path d="M8 8 L8 24 M8 8 L24 8" stroke="#c8a84b" stroke-width="1"/>
  <circle cx="8" cy="8" r="2.5" fill="#c8a84b"/>
  <path d="M2 2 Q16 2 16 16 Q16 30 30 30" stroke="#c8a84b" stroke-width="0.8" fill="none"/>
  <circle cx="2" cy="2" r="1.5" fill="#8a6e28"/>
</svg>`;

    const FIST_SVG = `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 28 L14 16 Q14 13 17 13 Q20 13 20 16 L20 18
           Q20 15 23 15 Q26 15 26 18 L26 19
           Q26 16 29 16 Q32 16 32 19 L32 28
           Q32 35 22 35 Q12 35 14 28Z" fill="#e8c96b"/>
  <rect x="11" y="12" width="6" height="10" rx="3" fill="#e8c96b"/>
</svg>`;

    /* ══════════════════════════════════════════════
       СТРОИТЕЛИ СЕКЦИЙ
    ══════════════════════════════════════════════ */

    function buildStats(stats) {
        const active = stats.filter(s => s.name || s.val);
        if (!active.length) return '';
        const cols = statsCols(active.length);
        const cells = active.map(s => `
      <div class="sh-stat">
        <div class="sh-stat-val">${esc(s.val)}</div>
        <div class="sh-stat-lbl">${esc(s.name)}</div>
      </div>`).join('');
        return `<div class="sh-stats" style="grid-template-columns:repeat(${cols},1fr)">${cells}</div>`;
    }

    function buildEquip(equips) {
        const active = equips.filter(e => e.name || e.desc);
        if (!active.length) return '';
        const items = active.map(e => `
      <div class="sh-equip-item">
        <div class="sh-equip-bullet">${equipBullet(e.name)}</div>
        <div>
          ${e.name ? `<span class="sh-equip-name">${esc(e.name)}</span>` : ''}
          ${nl2br(e.desc)}
        </div>
      </div>`).join('');
        return `
      <div class="sh-section">
        <div class="sh-section-hdr">
          <span class="sh-section-icon">⚔</span>
          <div class="sh-section-title">Снаряжение</div>
        </div>
        ${items}
      </div>`;
    }

    function buildSection(icon, title, text) {
        if (!text) return '';
        return `
      <div class="sh-section">
        <div class="sh-section-hdr">
          <span class="sh-section-icon">${icon}</span>
          <div class="sh-section-title">${title}</div>
        </div>
        <div class="sh-text">${nl2br(text)}</div>
      </div>`;
    }

    /* ══════════════════════════════════════════════
       ГЛАВНЫЙ СТРОИТЕЛЬ
    ══════════════════════════════════════════════ */
    function build(data) {
        const c = data.character;
        const theme = data.meta?.theme || 'medieval';

        /* Шапка */
        const sealHTML = c.order ? `
      <div class="sh-seal">
        <div class="sh-seal-circle">${FIST_SVG}</div>
        <div class="sh-seal-label">${esc(c.order.split('·')[0].trim())}</div>
      </div>` : '';

        const headerHTML = `
      <div class="sh-header">
        ${sealHTML}
        ${c.order ? `<span class="sh-order-tag">✦ ${esc(c.order)} ✦</span>` : ''}
        <div class="sh-name">${esc(c.name || 'Персонаж')}</div>
        <div class="sh-divider"><span>${esc(c.class || 'Класс · Роль')}</span></div>
        ${c.quote ? `<div class="sh-subtitle">«${esc(c.quote)}»</div>` : ''}
      </div>`;

        /* Мировоззрение */
        const alignHTML = c.alignment ? `
      <div class="sh-alignment">
        <div class="sh-align-icon">⚖</div>
        <div>
          <div class="sh-align-label">Мировоззрение</div>
          <div class="sh-align-value">${esc(c.alignment)}</div>
        </div>
        ${c.alignDesc ? `<div class="sh-align-desc">${nl2br(c.alignDesc)}</div>` : ''}
      </div>` : '';

        /* Характеристики */
        const statsHTML = buildStats(data.stats);

        /* Левая колонка */
        const leftHTML = [
            buildSection('👁', 'Характер',            c.personality),
            buildSection('⚡', 'Физические качества', c.physical),
            buildSection('✦',  'Навыки',              c.skills),
        ].join('');

        /* Правая колонка */
        const rightHTML = buildEquip(data.equips);

        /* Двухколоночная зона */
        let twoCol = '';
        if (leftHTML || rightHTML) {
            const colStyle = rightHTML && leftHTML
                ? 'grid-template-columns:1fr 1fr'
                : 'grid-template-columns:1fr';
            twoCol = `
        <div class="sh-two-col" style="${colStyle}">
          <div>${leftHTML}</div>
          ${rightHTML ? `<div>${rightHTML}</div>` : ''}
        </div>`;
        }

        /* Финальная цитата */
        const quoteHTML = c.finalQuote
            ? `<div class="sh-quote">${nl2br(c.finalQuote)}</div>` : '';

        /* Подвал */
        const footerHTML = `
      <div class="sh-footer">
        <div class="sh-footer-text">${esc(c.footer || '')}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-family:'Cinzel',serif;font-size:0.44rem;letter-spacing:0.2em;color:#8a6e28;text-transform:uppercase">Печать Тира</span>
          <div class="sh-footer-seal"></div>
        </div>
      </div>`;

        /* Собираем всё */
        return `
<div class="sheet" data-theme="${esc(theme)}">
  <div class="sh-corner c-tl">${CORNER_SVG}</div>
  <div class="sh-corner c-tr">${CORNER_SVG}</div>
  <div class="sh-corner c-bl">${CORNER_SVG}</div>
  <div class="sh-corner c-br">${CORNER_SVG}</div>
  ${headerHTML}
  <div class="sh-body">
    ${alignHTML}
    ${statsHTML}
    ${twoCol}
    ${quoteHTML}
  </div>
  ${footerHTML}
</div>`;
    }

    /* ── PUBLIC ── */
    return { build, esc, nl2br };

})();

window.Builder = Builder;