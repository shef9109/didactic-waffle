/* ═══════════════════════════════════════════════════════════════
   export.js — Экспорт анкеты
   Скачать как HTML / Печать (PDF через браузер)
═══════════════════════════════════════════════════════════════ */

const Export = (() => {

    /* ── CSS для экспортируемого HTML (встраивается инлайн) ── */
    function getExportCSS(theme) {
        const base = `
:root{--gold:#c8a84b;--gold-light:#e8c96b;--gold-dark:#8a6e28;--parchment:#f2e8c9;--parchment-dark:#d9c99a;--ink:#1a1208;--ink-light:#3a2c12;--blood:#7a1c1c;--font-display:'Cinzel Decorative',serif;--font-heading:'Cinzel',serif;--font-body:'EB Garamond',serif}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#07050200;background-color:#07050200;font-family:var(--font-body);display:flex;justify-content:center;padding:40px 20px;min-height:100vh;background-image:radial-gradient(ellipse at 10% 10%,rgba(139,90,20,.08) 0%,transparent 50%),radial-gradient(ellipse at 90% 90%,rgba(90,20,10,.06) 0%,transparent 50%)}
.sheet{width:760px;position:relative;background:linear-gradient(160deg,#f8edcc 0%,#ecdfa0 28%,#f0e0b0 62%,#d8c280 100%);color:var(--ink);font-family:var(--font-body);box-shadow:0 0 0 1px var(--gold-dark),0 0 0 5px #130e06,0 0 0 7px var(--gold-dark),0 0 80px rgba(0,0,0,.95);animation:sh .5s ease-out both}
@keyframes sh{from{opacity:0;transform:scale(.984) translateY(10px)}to{opacity:1;transform:none}}
.sh-corner{position:absolute;width:58px;height:58px;pointer-events:none;z-index:10}.sh-corner svg{width:100%;height:100%}
.c-tl{top:8px;left:8px}.c-tr{top:8px;right:8px;transform:scaleX(-1)}.c-bl{bottom:8px;left:8px;transform:scaleY(-1)}.c-br{bottom:8px;right:8px;transform:scale(-1)}
.sh-header{padding:44px 58px 26px;text-align:center;border-bottom:1px solid var(--gold-dark);position:relative}
.sh-order-tag{display:block;font-family:var(--font-heading);font-size:.62rem;letter-spacing:.42em;color:var(--gold-dark);text-transform:uppercase;margin-bottom:10px;opacity:.85}
.sh-name{font-family:var(--font-display);font-size:3rem;font-weight:900;color:var(--ink);line-height:1;letter-spacing:.05em;text-shadow:2px 3px 0 rgba(139,90,20,.18);word-break:break-word}
.sh-divider{display:flex;align-items:center;gap:14px;margin:12px 0}.sh-divider::before,.sh-divider::after{content:'';flex:1;height:1px;background:linear-gradient(to right,transparent,var(--gold-dark),transparent)}.sh-divider span{font-family:var(--font-heading);font-size:.6rem;letter-spacing:.42em;color:var(--blood);text-transform:uppercase;white-space:nowrap}
.sh-subtitle{font-style:italic;font-size:1rem;color:var(--ink-light);line-height:1.5}
.sh-seal{position:absolute;top:28px;right:50px;transform:rotate(-8deg)}.sh-seal-circle{width:68px;height:68px;border-radius:50%;background:radial-gradient(circle,#7a1c1c 0%,#3a0a0a 100%);display:flex;align-items:center;justify-content:center;border:2px solid var(--gold-dark);box-shadow:0 4px 18px rgba(0,0,0,.55)}.sh-seal-circle svg{width:40px;height:40px;fill:var(--gold-light)}.sh-seal-label{text-align:center;font-family:var(--font-heading);font-size:.44rem;letter-spacing:.18em;color:var(--gold-dark);margin-top:5px;text-transform:uppercase}
.sh-body{padding:24px 54px 44px}
.sh-alignment{background:linear-gradient(135deg,#1a1208 0%,#2a1e0e 100%);padding:13px 20px;display:flex;align-items:center;gap:14px;margin-bottom:22px;border-left:4px solid var(--gold)}.sh-align-icon{font-size:24px;flex-shrink:0;line-height:1}.sh-align-label{font-family:var(--font-heading);font-size:.52rem;letter-spacing:.3em;color:var(--gold-dark);text-transform:uppercase;margin-bottom:3px}.sh-align-value{font-family:var(--font-display);font-size:.88rem;color:#faf6ed;font-weight:700}.sh-align-desc{margin-left:auto;text-align:right;color:var(--parchment-dark);font-style:italic;font-size:.88rem;line-height:1.5;max-width:200px}
.sh-stats{display:grid;gap:1px;background:var(--gold-dark);border:1px solid var(--gold-dark);margin-bottom:24px}.sh-stat{background:linear-gradient(160deg,#f5e8b0 0%,#e8d080 100%);padding:11px 6px;text-align:center}.sh-stat-val{font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:var(--ink);line-height:1}.sh-stat-lbl{font-family:var(--font-heading);font-size:.48rem;letter-spacing:.18em;color:var(--gold-dark);text-transform:uppercase;margin-top:4px}
.sh-two-col{display:grid;gap:28px;margin-bottom:20px}
.sh-section{margin-bottom:18px}.sh-section-hdr{display:flex;align-items:center;gap:8px;margin-bottom:7px}.sh-section-hdr::after{content:'';flex:1;height:1px;background:linear-gradient(to right,var(--gold-dark),transparent);opacity:.4}.sh-section-icon{font-size:13px;opacity:.55;line-height:1}.sh-section-title{font-family:var(--font-heading);font-size:.56rem;letter-spacing:.3em;color:var(--blood);text-transform:uppercase;font-weight:700;white-space:nowrap}.sh-text{font-size:.94rem;line-height:1.75;color:var(--ink-light)}
.sh-equip-item{display:flex;gap:10px;margin-bottom:8px;font-size:.9rem;line-height:1.55;color:var(--ink-light)}.sh-equip-bullet{flex-shrink:0;color:var(--gold-dark);font-size:1rem;line-height:1.55;width:18px;text-align:center}.sh-equip-name{font-family:var(--font-heading);font-size:.7rem;font-weight:600;color:var(--ink);letter-spacing:.05em;display:block;margin-bottom:1px}
.sh-quote{border-left:3px solid var(--gold-dark);padding:10px 18px;margin:16px 0;background:rgba(139,90,20,.055);font-style:italic;font-size:1rem;color:var(--ink);line-height:1.75}
.sh-footer{border-top:1px solid var(--gold-dark);padding:15px 54px;display:flex;justify-content:space-between;align-items:center}.sh-footer-text{font-family:var(--font-heading);font-size:.48rem;letter-spacing:.2em;color:var(--gold-dark);text-transform:uppercase}.sh-footer-seal{width:26px;height:26px;border-radius:50%;background:var(--gold-dark);opacity:.35}
@media print{body{background:white;padding:0}.sheet{box-shadow:none;width:100%}}`;

        // Тема arcane
        if (theme === 'arcane') return base + `
.sheet[data-theme="arcane"]{background:linear-gradient(160deg,#181028 0%,#0e0818 45%,#160e24 100%);box-shadow:0 0 0 1px #6040a0,0 0 0 5px #050308,0 0 0 7px #6040a0,0 0 80px rgba(0,0,0,.98)}
.sheet[data-theme="arcane"] .sh-header{border-bottom-color:#6040a0}
.sheet[data-theme="arcane"] .sh-name{color:#e0d0ff;text-shadow:0 0 30px rgba(160,100,255,.3)}
.sheet[data-theme="arcane"] .sh-divider::before,.sheet[data-theme="arcane"] .sh-divider::after{background:linear-gradient(to right,transparent,#6040a0,transparent)}
.sheet[data-theme="arcane"] .sh-divider span{color:#8060c0}
.sheet[data-theme="arcane"] .sh-order-tag{color:#8060c0}
.sheet[data-theme="arcane"] .sh-subtitle{color:#9080c0}
.sheet[data-theme="arcane"] .sh-seal-circle{background:radial-gradient(circle,#4020a0 0%,#1a0840 100%);border-color:#6040a0}
.sheet[data-theme="arcane"] .sh-seal-circle svg{fill:#c090ff}
.sheet[data-theme="arcane"] .sh-seal-label{color:#6040a0}
.sheet[data-theme="arcane"] .sh-alignment{background:linear-gradient(135deg,#0e0820 0%,#1a1030 100%);border-left-color:#8060c0}
.sheet[data-theme="arcane"] .sh-align-label{color:#8060c0}
.sheet[data-theme="arcane"] .sh-align-value{color:#e0d0ff}
.sheet[data-theme="arcane"] .sh-align-desc{color:#9080c0}
.sheet[data-theme="arcane"] .sh-stats{background:#6040a0;border-color:#6040a0}
.sheet[data-theme="arcane"] .sh-stat{background:linear-gradient(160deg,#1e1438 0%,#150e28 100%)}
.sheet[data-theme="arcane"] .sh-stat-val{color:#d0b8ff}
.sheet[data-theme="arcane"] .sh-stat-lbl{color:#6040a0}
.sheet[data-theme="arcane"] .sh-section-title{color:#6040a0}
.sheet[data-theme="arcane"] .sh-section-hdr::after{background:linear-gradient(to right,#4030a0,transparent)}
.sheet[data-theme="arcane"] .sh-text{color:#a090d0}
.sheet[data-theme="arcane"] .sh-equip-bullet{color:#6040a0}
.sheet[data-theme="arcane"] .sh-equip-name{color:#c0b0f0}
.sheet[data-theme="arcane"] .sh-equip-item{color:#9080c0}
.sheet[data-theme="arcane"] .sh-quote{border-left-color:#6040a0;background:rgba(96,64,160,.08);color:#c0b0f0}
.sheet[data-theme="arcane"] .sh-footer{border-top-color:#6040a0}
.sheet[data-theme="arcane"] .sh-footer-text{color:#6040a0}
.sheet[data-theme="arcane"] .sh-footer-seal{background:#6040a0}`;

        return base;
    }

    /* ── Скачать как HTML ── */
    function downloadHTML() {
        const container = document.getElementById('sheet-container');
        if (!container) return;

        const sheetHTML = container.innerHTML;
        const data = State.get();
        const theme = data.meta?.theme || 'medieval';
        const charName = (data.character?.name || 'персонаж').replace(/\s+/g, '_');

        const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${charName} — Анкета</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>${getExportCSS(theme)}</style>
</head>
<body>${sheetHTML}</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${charName}_анкета.html`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    /* ── Печать (PDF через браузер Ctrl+P) ── */
    function printSheet() {
        window.print();
    }

    return { downloadHTML, printSheet };

})();

window.Export = Export;