/*
   export.js - export sheet to html/png/jpg/webp
*/

const Export = (() => {

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
        a.click();
        URL.revokeObjectURL(url);
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
            new Promise(resolve => setTimeout(resolve, 2500)),
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

        await waitForFonts();
        await waitForImages(node);

        const rect = node.getBoundingClientRect();
        const width = Math.max(1, Math.ceil(rect.width));
        const height = Math.max(1, Math.ceil(rect.height));
        const scale = Math.max(2, Math.min(3, window.devicePixelRatio || 2));

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

        const mime = format === 'jpg'
            ? 'image/jpeg'
            : format === 'webp'
                ? 'image/webp'
                : 'image/png';

        const quality = format === 'png' ? undefined : 0.95;
        const blob = await canvasToBlob(canvas, mime, quality);
        downloadBlob(blob, `${fileBaseName()}_sheet.${format}`);
    }

    return { downloadHTML, exportImage };

})();

window.Export = Export;
