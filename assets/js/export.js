/*
   export.js - export sheet to html/png/jpg/webp
*/

const Export = (() => {
    let html2canvasPromise = null;

    function collectStyles() {
        let css = '';
        for (const sheet of Array.from(document.styleSheets)) {
            try {
                for (const rule of Array.from(sheet.cssRules || [])) {
                    css += `${rule.cssText}\n`;
                }
            } catch (_) {
                // ignore CORS-restricted stylesheets
            }
        }
        return css;
    }

    function fileBaseName() {
        const data = State.get();
        return (data.character?.name || 'character')
            .trim()
            .replace(/[\\/:*?"<>|]+/g, '')
            .replace(/\s+/g, '_');
    }

    function downloadBlob(blob, filename) {
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    function downloadHTML() {
        const container = document.getElementById('sheet-container');
        if (!container) return;

        const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${fileBaseName()} - Sheet</title>
<style>${collectStyles()}</style>
</head>
<body>
${container.innerHTML}
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        downloadBlob(blob, `${fileBaseName()}_sheet.html`);
    }

    async function waitForFonts() {
        if (!document.fonts?.ready) return;
        await Promise.race([
            document.fonts.ready,
            new Promise((resolve) => setTimeout(resolve, 2500)),
        ]);
    }

    async function waitForImages(root) {
        const images = Array.from(root.querySelectorAll('img'));
        if (!images.length) return;

        await Promise.all(images.map((img) => {
            if (img.complete) return Promise.resolve();
            if (typeof img.decode === 'function') {
                return img.decode().catch(() => undefined);
            }
            return new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            });
        }));
    }

    function loadExternalScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });
    }

    async function ensureHtml2Canvas() {
        if (window.html2canvas) return window.html2canvas;
        if (html2canvasPromise) return html2canvasPromise;

        const cdnUrls = [
            'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
            'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js',
        ];

        html2canvasPromise = (async () => {
            for (const src of cdnUrls) {
                try {
                    await loadExternalScript(src);
                    if (window.html2canvas) return window.html2canvas;
                } catch (_) {
                    // try next CDN
                }
            }
            throw new Error('html2canvas is unavailable');
        })();

        return html2canvasPromise;
    }

    function getRenderSize(node) {
        const rect = node.getBoundingClientRect();
        const width = Math.max(1, Math.ceil(rect.width || node.offsetWidth || node.clientWidth));
        const height = Math.max(1, Math.ceil(rect.height || node.offsetHeight || node.clientHeight));
        const scale = Math.max(2, Math.min(3, window.devicePixelRatio || 2));
        return { width, height, scale };
    }

    function copyComputedStyle(source, target) {
        const computed = window.getComputedStyle(source);
        for (let i = 0; i < computed.length; i += 1) {
            const prop = computed[i];
            target.style.setProperty(
                prop,
                computed.getPropertyValue(prop),
                computed.getPropertyPriority(prop)
            );
        }
    }

    function toDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result || '');
            reader.onerror = () => reject(new Error('Failed to encode image'));
            reader.readAsDataURL(blob);
        });
    }

    async function inlineImageSource(img, clone) {
        const src = img.currentSrc || img.src || '';
        if (!src) return;

        if (src.startsWith('data:') || src.startsWith('blob:')) {
            clone.src = src;
            return;
        }

        try {
            const resp = await fetch(src, { mode: 'cors' });
            const blob = await resp.blob();
            clone.src = await toDataURL(blob);
        } catch (_) {
            clone.src = src;
        }
    }

    async function cloneWithInlineStyles(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return document.createTextNode(node.textContent || '');
        }

        if (!(node instanceof Element)) {
            return document.createTextNode('');
        }

        if (node instanceof HTMLCanvasElement) {
            const canvasImg = document.createElement('img');
            copyComputedStyle(node, canvasImg);
            try {
                canvasImg.src = node.toDataURL();
            } catch (_) {
                canvasImg.src = '';
            }
            return canvasImg;
        }

        const clone = node.cloneNode(false);
        copyComputedStyle(node, clone);

        if (node instanceof HTMLImageElement && clone instanceof HTMLImageElement) {
            await inlineImageSource(node, clone);
        }

        if (node instanceof HTMLTextAreaElement && clone instanceof HTMLTextAreaElement) {
            clone.value = node.value;
        }
        if (node instanceof HTMLInputElement && clone instanceof HTMLInputElement) {
            clone.value = node.value;
            if (node.type === 'checkbox' || node.type === 'radio') {
                clone.checked = node.checked;
            }
        }
        if (node instanceof HTMLSelectElement && clone instanceof HTMLSelectElement) {
            clone.value = node.value;
        }

        for (const child of Array.from(node.childNodes)) {
            clone.appendChild(await cloneWithInlineStyles(child));
        }

        return clone;
    }

    function xmlWrap(node, width, height) {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        wrapper.style.width = `${width}px`;
        wrapper.style.height = `${height}px`;
        wrapper.style.overflow = 'hidden';
        wrapper.style.background = 'transparent';
        wrapper.style.margin = '0';
        wrapper.appendChild(node);
        return new XMLSerializer().serializeToString(wrapper);
    }

    function svgFromMarkup(markup, width, height) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<foreignObject x="0" y="0" width="${width}" height="${height}">${markup}</foreignObject>
</svg>`;
    }

    function loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.decoding = 'sync';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to render export image'));
            img.src = url;
        });
    }

    async function renderWithHtml2Canvas(node, format) {
        const html2canvas = await ensureHtml2Canvas();
        const { scale } = getRenderSize(node);
        const bg = format === 'png' ? null : '#ffffff';
        const canvas = await html2canvas(node, {
            backgroundColor: bg,
            scale,
            useCORS: true,
            allowTaint: false,
            imageTimeout: 7000,
            logging: false,
            removeContainer: true,
        });
        if (!canvas) throw new Error('html2canvas returned empty canvas');
        return canvas;
    }

    async function renderWithForeignObject(node, format) {
        const { width, height, scale } = getRenderSize(node);

        const clone = await cloneWithInlineStyles(node);
        if (clone instanceof Element) {
            clone.style.margin = '0';
            clone.style.width = `${width}px`;
            clone.style.height = `${height}px`;
            clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        }

        const markup = xmlWrap(clone, width, height);
        const svg = svgFromMarkup(markup, width, height);
        const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        let img;
        try {
            img = await loadImage(svgUrl);
        } finally {
            URL.revokeObjectURL(svgUrl);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(width * scale);
        canvas.height = Math.ceil(height * scale);

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');

        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        if (format !== 'png') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
        return canvas;
    }

    function normalizeFormat(format) {
        const f = String(format || 'png').toLowerCase();
        if (f === 'jpeg') return 'jpg';
        if (f === 'jpg' || f === 'png' || f === 'webp') return f;
        return 'png';
    }

    function formatToMime(format) {
        if (format === 'jpg') return 'image/jpeg';
        if (format === 'webp') return 'image/webp';
        return 'image/png';
    }

    function canvasToBlob(canvas, mime, quality) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas conversion failed'));
                    return;
                }
                resolve(blob);
            }, mime, quality);
        });
    }

    async function exportImage(format = 'png') {
        const node = document.querySelector('#sheet-container .sheet');
        if (!node) throw new Error('Sheet node not found');

        const normalized = normalizeFormat(format);
        await waitForFonts();
        await waitForImages(node);

        let canvas;
        let primaryError = null;

        try {
            canvas = await renderWithHtml2Canvas(node, normalized);
        } catch (err) {
            primaryError = err;
            try {
                canvas = await renderWithForeignObject(node, normalized);
            } catch (fallbackErr) {
                const p = primaryError?.message || 'unknown';
                const f = fallbackErr?.message || 'unknown';
                throw new Error(`Export failed. Primary: ${p}. Fallback: ${f}`);
            }
        }

        const mime = formatToMime(normalized);
        const quality = normalized === 'png' ? undefined : 0.95;
        const blob = await canvasToBlob(canvas, mime, quality);
        downloadBlob(blob, `${fileBaseName()}_sheet.${normalized}`);

        if (primaryError) {
            console.warn('Primary export renderer failed, fallback was used:', primaryError);
        }
    }

    return { downloadHTML, exportImage };
})();

window.Export = Export;
