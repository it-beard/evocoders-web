import { JSDOM, VirtualConsole } from 'jsdom';
import { readRepoFile, repoFile } from './paths.js';

/**
 * Заглушка 2d-контекста: jsdom не умеет canvas, а GameOfLife и BattleCity
 * дёргают его в конструкторах. Возвращаем no-op на любой метод.
 */
function makeContext2d() {
    const ctx = {
        createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
        measureText: () => ({ width: 0 }),
        getImageData: (x, y, w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
        canvas: null
    };
    return new Proxy(ctx, {
        get(target, prop) {
            if (prop in target) return target[prop];
            // любые draw-методы — пустышки, любые свойства (fillStyle и т.п.) — записываемые
            return typeof prop === 'string' && /^[a-z]/.test(prop) ? () => {} : undefined;
        },
        set() { return true; }
    });
}

/** Всё, чего нет в jsdom, но что страница трогает на старте. */
function installStubs(window) {
    window.HTMLCanvasElement.prototype.getContext = function () { return makeContext2d(); };

    window.IntersectionObserver = class {
        constructor(cb) { this.cb = cb; }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() { return []; }
    };

    window.Element.prototype.scrollIntoView = function () {};
    if (!window.AudioContext) {
        window.AudioContext = class { constructor() { this.state = 'running'; } close() {} suspend() {} resume() {} };
    }
}

function runScriptFile(window, name) {
    const el = window.document.createElement('script');
    el.textContent = readRepoFile('js', name);
    window.document.body.appendChild(el);
}

/**
 * Поднимает реальный index.html в jsdom и выполняет указанные скрипты
 * в том же порядке, в каком их подключает страница.
 *
 * jsdom успевает выстрелить своим DOMContentLoaded до того, как мы подгрузим
 * скрипты, поэтому событие диспатчим вручную — ровно один раз.
 */
export async function loadPage({ file = 'index.html', scripts = [], reduceMotion = true } = {}) {
    const virtualConsole = new VirtualConsole();
    const jsErrors = [];
    virtualConsole.on('jsdomError', (err) => jsErrors.push(err));

    const dom = new JSDOM(readRepoFile(file), {
        url: 'https://evocoders.ai/',
        runScripts: 'dangerously',
        pretendToBeVisual: true,
        virtualConsole
    });
    const { window } = dom;

    await new Promise((resolve) => {
        if (window.document.readyState === 'complete') resolve();
        else window.addEventListener('load', resolve, { once: true });
    });

    installStubs(window);

    // jsdom не реализует matchMedia. По умолчанию рапортуем reduce-motion,
    // иначе GameOfLife крутит requestAnimationFrame всё время теста.
    window.matchMedia = (query) => ({
        media: query,
        matches: /prefers-reduced-motion/.test(query) ? reduceMotion : false,
        onchange: null,
        addListener() {}, removeListener() {},
        addEventListener() {}, removeEventListener() {},
        dispatchEvent() { return false; }
    });

    for (const name of scripts) runScriptFile(window, name);

    window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));

    return {
        dom,
        window,
        document: window.document,
        jsErrors,
        close: () => window.close()
    };
}

/**
 * Разбирает файл БЕЗ выполнения скриптов — нужно, чтобы проверить статичную
 * разметку ровно в том виде, в каком её получают поисковые и ИИ-краулеры.
 */
export function parseStatic(file = 'index.html') {
    const dom = new JSDOM(readRepoFile(file), { url: 'https://evocoders.ai/' });
    return dom.window.document;
}

/** Клик, который реально всплывает — jsdom требует явных настроек события. */
export function click(window, el) {
    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
}

export function pressKey(window, key, target) {
    (target || window.document).dispatchEvent(
        new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    );
}

export { repoFile };
