/*
  builder.js - сборка HTML анкеты из state
*/

const Builder = (() => {
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

    function equipBullet(name) {
        const low = String(name || '').toLowerCase();
        if (/(меч|клинок|сабля|рапир|шпага)/.test(low)) return '⚔';
        if (/(щит|доспех|брон|латы)/.test(low)) return '🛡';
        if (/(руна|заклин|гримуар|аркан|маг)/.test(low)) return '✶';
        if (/(артефакт|печать|релик|амулет)/.test(low)) return '◉';
        if (/(зелье|склян|фляг)/.test(low)) return '⚗';
        return '◈';
    }

    const TYPE_META = {
        roleplay: {
            label: 'Ролевая анкета',
            mode: 'classic',
            sectionA: 'Характер',
            sectionB: 'Физические качества',
            sectionC: 'Навыки'
        },
        guild: {
            label: 'Гильдейский паспорт',
            mode: 'passport',
            sectionA: 'Досье и репутация',
            sectionB: 'Служебная история',
            sectionC: 'Профильные навыки'
        },
        combat: {
            label: 'Боевая сводка',
            mode: 'brief',
            sectionA: 'Боевой профиль',
            sectionB: 'Тактика применения',
            sectionC: 'Ключевые навыки'
        },
        arcane: {
            label: 'Магическая сводка',
            mode: 'brief',
            sectionA: 'Профиль школы',
            sectionB: 'Источник силы',
            sectionC: 'Заклинания и ритуалы'
        },
        free: {
            label: 'Свободная анкета',
            mode: 'classic',
            sectionA: 'Раздел I',
            sectionB: 'Раздел II',
            sectionC: 'Раздел III'
        }
    };

    const SEAL_ICONS = {
        gauntlet: `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><path d="M14 28 L14 16 Q14 13 17 13 Q20 13 20 16 L20 18 Q20 15 23 15 Q26 15 26 18 L26 19 Q26 16 29 16 Q32 16 32 19 L32 28 Q32 35 22 35 Q12 35 14 28Z" fill="currentColor"/><rect x="11" y="12" width="6" height="10" rx="3" fill="currentColor"/></svg>`,
        sword: `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><path d="M28 8 L35 15 L23 27 L17 27 L17 21 Z" fill="currentColor"/><rect x="12" y="26" width="12" height="3" rx="1.5" fill="currentColor"/><rect x="15" y="28" width="4" height="8" rx="1.5" fill="currentColor"/></svg>`,
        shield: `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><path d="M22 7 L34 12 V22 C34 30 28 35 22 37 C16 35 10 30 10 22 V12 Z" fill="currentColor"/></svg>`,
        flame: `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><path d="M24 8 C27 14 18 16 23 23 C25 26 29 24 29 30 C29 35 25 38 21 38 C16 38 12 34 12 29 C12 22 19 18 18 11 C20 12 21 14 21 16 C22 13 23 10 24 8Z" fill="currentColor"/></svg>`,
        rune: `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><path d="M12 32 L22 10 L32 32 M16 24 H28 M22 10 V34" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
        lotus: `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><path d="M22 31 C17 30 14 26 14 22 C17 22 20 24 22 27 C24 24 27 22 30 22 C30 26 27 30 22 31Z" fill="currentColor"/><path d="M22 27 C18 24 18 19 22 14 C26 19 26 24 22 27Z" fill="currentColor"/></svg>`
    };

    const CORNER_SVG = `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 2 L2 30 M2 2 L30 2" stroke="#8a6e28" stroke-width="1.5"/>
  <path d="M8 8 L8 24 M8 8 L24 8" stroke="#c8a84b" stroke-width="1"/>
  <circle cx="8" cy="8" r="2.5" fill="#c8a84b"/>
</svg>`;

    function sealSVG(seal) {
        return SEAL_ICONS[seal] || SEAL_ICONS.gauntlet;
    }

    function renderStatsTable(stats) {
        const rows = (stats || []).filter(s => s.name || s.val);
        if (!rows.length) return '';
        return `<div class="sh-kv-grid">${rows.map(s => `
          <div class="sh-kv-row">
            <div class="sh-kv-key">${esc(s.name)}</div>
            <div class="sh-kv-val">${esc(s.val)}</div>
          </div>
        `).join('')}</div>`;
    }

    function renderEquipList(equips, title = 'Список') {
        const rows = (equips || []).filter(e => e.name || e.desc);
        if (!rows.length) return '';
        return `
          <div class="sh-section">
            <div class="sh-section-title">${esc(title)}</div>
            <div class="sh-equip-list">
              ${rows.map(e => `
                <div class="sh-equip-item">
                  <div class="sh-equip-bullet">${equipBullet(e.name)}</div>
                  <div>
                    ${e.name ? `<div class="sh-equip-name">${esc(e.name)}</div>` : ''}
                    <div class="sh-equip-desc">${nl2br(e.desc)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
    }

    function renderClassic(c, metaType, stats, equips) {
        return `
          <div class="sh-classic-grid">
            <div>
              <div class="sh-section">
                <div class="sh-section-title">${esc(metaType.sectionA)}</div>
                <div class="sh-text">${nl2br(c.personality)}</div>
              </div>
              <div class="sh-section">
                <div class="sh-section-title">${esc(metaType.sectionB)}</div>
                <div class="sh-text">${nl2br(c.physical)}</div>
              </div>
              <div class="sh-section">
                <div class="sh-section-title">${esc(metaType.sectionC)}</div>
                <div class="sh-text">${nl2br(c.skills)}</div>
              </div>
            </div>
            <div>
              <div class="sh-section">
                <div class="sh-section-title">Характеристики</div>
                ${renderStatsTable(stats)}
              </div>
              ${renderEquipList(equips, 'Снаряжение')}
            </div>
          </div>
        `;
    }

    function renderPassport(c, stats, equips, meta) {
        const x = Number.isFinite(+meta.photoX) ? +meta.photoX : 50;
        const y = Number.isFinite(+meta.photoY) ? +meta.photoY : 50;
        const scale = Number.isFinite(+meta.photoScale) ? +meta.photoScale : 100;
        const photo = c.portrait
            ? `<div class="sh-passport-photo-box">
                 <img class="sh-passport-photo" src="${esc(c.portrait)}" alt="Портрет"
                      style="object-position:${x}% ${y}%; transform:scale(${Math.max(0.5, scale / 100)});">
               </div>`
            : `<div class="sh-passport-photo-box sh-passport-photo-empty">ФОТО</div>`;

        return `
          <div class="sh-passport-top">
            <div class="sh-passport-main">
              <div class="sh-passport-fio">${esc(c.name || 'Без имени')}</div>
              <div class="sh-passport-rank">${esc(c.class || '')}</div>
              <div class="sh-passport-org">${esc(c.order || '')}</div>
              <div class="sh-passport-kv">
                <div><span>Статус:</span> ${esc(c.alignment || '-')}</div>
                <div><span>Девиз:</span> ${esc(c.quote || '-')}</div>
              </div>
              <div class="sh-section">
                <div class="sh-section-title">Параметры</div>
                ${renderStatsTable(stats)}
              </div>
            </div>
            ${photo}
          </div>

          <div class="sh-section">
            <div class="sh-section-title">Навыки и досье</div>
            <div class="sh-text">${nl2br(c.skills || '')}</div>
            <div class="sh-text">${nl2br(c.personality || '')}</div>
          </div>

          ${renderEquipList(equips, 'Инвентарь и документы')}

          <div class="sh-section">
            <div class="sh-section-title">Дополнительная информация</div>
            <div class="sh-text">${nl2br(c.physical || '')}</div>
            <div class="sh-text">${nl2br(c.alignDesc || '')}</div>
          </div>
        `;
    }

    function renderBrief(c, metaType, stats, equips) {
        return `
          <div class="sh-brief-head">
            <div class="sh-brief-item"><span>Объект:</span><b>${esc(c.name || '-')}</b></div>
            <div class="sh-brief-item"><span>Категория:</span><b>${esc(c.class || '-')}</b></div>
            <div class="sh-brief-item"><span>Источник:</span><b>${esc(c.order || '-')}</b></div>
            <div class="sh-brief-item"><span>Назначение:</span><b>${esc(c.quote || '-')}</b></div>
          </div>

          <div class="sh-brief-grid">
            <div>
              <div class="sh-section">
                <div class="sh-section-title">${esc(metaType.sectionA)}</div>
                <div class="sh-text">${nl2br(c.personality || '')}</div>
              </div>
              <div class="sh-section">
                <div class="sh-section-title">${esc(metaType.sectionB)}</div>
                <div class="sh-text">${nl2br(c.physical || '')}</div>
              </div>
            </div>
            <div>
              <div class="sh-section">
                <div class="sh-section-title">Параметры</div>
                ${renderStatsTable(stats)}
              </div>
              <div class="sh-section">
                <div class="sh-section-title">${esc(metaType.sectionC)}</div>
                <div class="sh-text">${nl2br(c.skills || '')}</div>
              </div>
            </div>
          </div>

          ${renderEquipList(equips, 'Список связанных элементов')}
        `;
    }

    function build(data) {
        const meta = data.meta || {};
        const c = data.character || {};
        const typeId = meta.type || 'roleplay';
        const theme = meta.theme || 'medieval';
        const seal = meta.seal || 'gauntlet';
        const sealStyle = meta.sealStyle || 'wax';
        const metaType = TYPE_META[typeId] || TYPE_META.roleplay;
        const stats = data.stats || [];
        const equips = data.equips || [];

        let content = '';
        if (metaType.mode === 'passport') {
            content = renderPassport(c, stats, equips, meta);
        } else if (metaType.mode === 'brief') {
            content = renderBrief(c, metaType, stats, equips);
        } else {
            content = renderClassic(c, metaType, stats, equips);
        }

        return `
<div class="sheet" data-theme="${esc(theme)}" data-type="${esc(typeId)}">
  <div class="sh-corner c-tl">${CORNER_SVG}</div>
  <div class="sh-corner c-tr">${CORNER_SVG}</div>
  <div class="sh-corner c-bl">${CORNER_SVG}</div>
  <div class="sh-corner c-br">${CORNER_SVG}</div>

  <div class="sh-header">
    <div class="sh-seal">
      <div class="sh-seal-circle sh-seal-style-${esc(sealStyle)}">${sealSVG(seal)}</div>
      <div class="sh-seal-label">${esc((c.order || metaType.label).split('·')[0].trim())}</div>
    </div>
    <div class="sh-type-tag">${esc(metaType.label)}</div>
    <div class="sh-name">${esc(c.name || 'Без имени')}</div>
  </div>

  <div class="sh-body">
    ${content}
    ${c.finalQuote ? `<div class="sh-quote">${nl2br(c.finalQuote)}</div>` : ''}
  </div>

  <div class="sh-footer">
    <div class="sh-footer-text">${esc(c.footer || '')}</div>
    <div class="sh-footer-seal-wrap">
      <span class="sh-footer-seal-text">Печать</span>
      <div class="sh-footer-seal sh-seal-style-${esc(sealStyle)}">${sealSVG(seal)}</div>
    </div>
  </div>
</div>`;
    }

    return { build, esc, nl2br };
})();

window.Builder = Builder;
