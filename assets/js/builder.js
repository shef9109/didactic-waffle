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
        gauntlet: `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><path d="M12 28.2V18.3c0-1.7 1.3-3 2.9-3 1.7 0 2.9 1.3 2.9 3v-1.8c0-1.7 1.3-3 2.9-3 1.7 0 2.9 1.3 2.9 3v.2c0-1.6 1.3-2.8 2.8-2.8s2.8 1.2 2.8 2.8v.8c0-1.5 1.2-2.7 2.7-2.7s2.7 1.2 2.7 2.7v9.3c0 7.2-5.1 10.8-12 10.8s-12-3.7-12-10.4Z" fill="currentColor"/><path d="M10 10.9h8v8.8h-8zM13.2 9h1.6a2.8 2.8 0 0 1 2.8 2.8v1.1h-7.2v-1.1A2.8 2.8 0 0 1 13.2 9Z" fill="currentColor"/><path d="M14.4 12.6h9.8M14.8 16h9.8M15.2 19.5h10.1M24 17.3h7.6M25.2 20.9h7.1M17.6 28.6l2.8-2 1.8 2.2 2.5-2.1 1.8 2.3 2.9-2.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/></svg>`,
        sword: `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><path d="M22 6.2 26.8 12 24 14.8V26.8H20V14.8L17.2 12 22 6.2Z" fill="currentColor"/><rect x="11" y="25.7" width="22" height="3.8" rx="1.9" fill="currentColor"/><rect x="19.5" y="29" width="5" height="8.1" rx="2" fill="currentColor"/><circle cx="22" cy="33.2" r="1.2" fill="currentColor" fill-opacity=".5"/><circle cx="22" cy="5.3" r="1.5" fill="currentColor" fill-opacity=".5"/></svg>`,
        shield: `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><path d="M22 6.2 35.8 11.8V23c0 8.3-6.3 13.8-13.8 16-7.5-2.2-13.8-7.7-13.8-16V11.8L22 6.2Z" fill="currentColor"/><path d="M22 10.5v24.6M14.3 14.2h15.4M14.2 26.1c2.2 2.3 4.8 3.5 7.8 3.5s5.6-1.2 7.8-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".4"/><path d="M17.1 18.7h9.8M17.1 22h9.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".5"/></svg>`,
        flame: `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><path d="M22.6 6.4c3.2 3.6 4.5 6.6 4.5 9.8 0 2-1 4-2.6 5.7 2.7-.3 4.9-1.9 6.1-4.1 1.9 2.6 2.9 5.5 2.9 8.4 0 6.8-5 11.8-11.5 11.8S10.5 33 10.5 26.3c0-4.7 2.2-9 6.3-12.3.3 2.5 1.4 4.5 3.2 5.8-.2-4.4.8-8.7 2.6-13.4Z" fill="currentColor"/><path d="M22 16.8c2.7 2.1 4.1 4.7 4.1 7.5 0 3.8-2.7 6.8-6.1 6.8s-6.1-3-6.1-6.8c0-2.6 1.3-5 3.8-7.2.4 1.8 1.7 3.2 3.3 3.9-.1-1.4.3-2.8 1-4.2Z" fill="currentColor" fill-opacity=".55"/><path d="M28.8 10.7c.5 1.4.7 2.5.7 3.4 0 1.4-.6 2.7-1.7 3.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity=".5"/></svg>`,
        rune: `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="22" r="14.4" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M22 10.2V34M14.2 14.2h15.6M16.2 31.4l11.6-18.8M14.8 24.2h12.2M19.8 14.2l-5 10 5.7 9.8M24.2 14.2l5 10-5.6 9.8" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="22" cy="22" r="2.1" fill="currentColor"/></svg>`,
        lotus: `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><path d="M22 36.5c-6.8 0-12-4-13.2-10.3 3.8-.3 7.5 1.5 10.2 4.9 1-2.5 1-5.2.1-7.8-3.3-1.3-6.3-4.1-7.8-7.9 4.3.1 8 2.3 10.7 6 2.7-3.7 6.4-5.9 10.7-6-1.5 3.8-4.5 6.6-7.8 7.9-.9 2.6-.9 5.3.1 7.8 2.7-3.4 6.4-5.2 10.2-4.9-1.2 6.3-6.4 10.3-13.2 10.3Z" fill="currentColor"/><path d="M22 32.4c-3.2-2.1-4.9-4.8-4.9-7.7 0-3.1 1.8-6 4.9-8.6 3.1 2.6 4.9 5.5 4.9 8.6 0 2.9-1.7 5.6-4.9 7.7Z" fill="currentColor" fill-opacity=".55"/><path d="M10.4 31h23.2M14.1 34h15.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".45"/></svg>`
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
