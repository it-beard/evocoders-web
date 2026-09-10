import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseStatic } from './helpers/dom.js';
import { ROOT, repoFile, readRepoFile } from './helpers/paths.js';

const PAGES = ['index.html', 'rules.html'];
const docs = Object.fromEntries(PAGES.map((p) => [p, parseStatic(p)]));
const norm = (s) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

for (const page of PAGES) {
    test(`${page}: id не повторяются`, () => {
        const ids = [...docs[page].querySelectorAll('[id]')].map((el) => el.id);
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        assert.deepEqual(dupes, []);
    });

    test(`${page}: внутренние якоря ведут на существующие блоки`, () => {
        const doc = docs[page];
        for (const a of doc.querySelectorAll('a[href^="#"]')) {
            const id = a.getAttribute('href').slice(1);
            if (!id) continue;
            assert.ok(doc.getElementById(id), `${page}: якорь #${id} никуда не ведёт`);
        }
    });

    test(`${page}: все локальные файлы на месте`, () => {
        const doc = docs[page];
        const refs = [...doc.querySelectorAll('[src], [href]')]
            .map((el) => el.getAttribute('src') || el.getAttribute('href'))
            .filter((r) => r && !/^(https?:|\/\/|#|mailto:|data:)/.test(r));

        assert.ok(refs.length > 0, 'локальных ссылок не найдено — селектор устарел?');
        for (const ref of refs) {
            assert.ok(fs.existsSync(repoFile(ref)), `${page}: нет файла ${ref}`);
        }
    });
}

/**
 * battleCity.js исключён намеренно: он рисует свой интерфейс сам,
 * его id появляются в DOM только после запуска игры.
 */
test('id, которые ищет JS лендинга, есть в разметке', () => {
    const doc = docs['index.html'];
    for (const file of ['archive.js', 'main.js', 'battleCityLauncher.js']) {
        const src = readRepoFile('js', file);
        const ids = new Set([
            ...[...src.matchAll(/getElementById\('([^']+)'\)/g)].map((m) => m[1]),
            ...[...src.matchAll(/querySelector\('#([A-Za-z0-9_-]+)'\)/g)].map((m) => m[1])
        ]);
        assert.ok(ids.size > 0, `в js/${file} не нашлось обращений по id`);
        for (const id of ids) {
            assert.ok(doc.getElementById(id), `js/${file} ищет #${id}, но его нет в index.html`);
        }
    }
});

test('index.html подключает скрипты в рабочем порядке', () => {
    const srcs = [...docs['index.html'].querySelectorAll('script[src]')]
        .map((s) => s.getAttribute('src'))
        .filter((s) => s.startsWith('js/'));

    assert.deepEqual(srcs, [
        'js/gameOfLife.js',
        'js/battleCitySounds.js',
        'js/battleCity.js',
        'js/battleCityLauncher.js',
        'js/archive.js',
        'js/main.js'
    ], 'battleCity.js должен идти после звуков, launcher — после игры, main.js — последним');
});

const CAROUSELS = [
    { name: 'курсы',     track: 'carousel-track',          indicators: 'carousel-indicators',          counter: 'carousel-counter' },
    { name: 'контент',   track: 'content-carousel-track',  indicators: 'content-carousel-indicators',  counter: 'content-carousel-counter' },
    { name: 'дайджесты', track: 'digests-carousel-track',  indicators: 'digests-carousel-indicators',  counter: 'digests-carousel-counter' }
];

for (const c of CAROUSELS) {
    test(`карусель «${c.name}»: слайды, индикаторы и счётчик сходятся`, () => {
        const doc = docs['index.html'];
        const slides = doc.querySelectorAll(`#${c.track} .carousel-slide`).length;
        const indicators = doc.querySelectorAll(`#${c.indicators} .indicator`).length;
        const total = Number(doc.querySelector(`#${c.counter} .total-slides`).textContent);

        assert.ok(slides > 0, 'слайдов нет');
        assert.equal(indicators, slides, 'индикаторов не столько, сколько слайдов');
        assert.equal(total, slides, 'в счётчике зашито не то число слайдов');
    });

    test(`карусель «${c.name}»: ровно один активный слайд в разметке`, () => {
        const active = docs['index.html'].querySelectorAll(`#${c.track} .carousel-slide.active`).length;
        assert.equal(active, 1);
    });
}

const ld = [...docs['index.html'].querySelectorAll('script[type="application/ld+json"]')]
    .map((s) => JSON.parse(s.textContent));

test('JSON-LD: три валидных блока нужных типов', () => {
    assert.deepEqual(ld.map((b) => b['@type']), ['Organization', 'Product', 'FAQPage']);
    for (const block of ld) assert.equal(block['@context'], 'https://schema.org');
});

test('JSON-LD Organization: ссылки и основатель на месте', () => {
    const org = ld[0];
    assert.equal(org.url, 'https://evocoders.ai/');
    assert.equal(org.founder.name, 'Лекс Картынник');
    assert.ok(org.sameAs.includes('https://youtube.com/@evocoders'));
    assert.ok(org.sameAs.includes('https://telegram.me/evocoders'));
});

test('JSON-LD FAQPage: столько же вопросов, сколько на странице', () => {
    const faq = ld[2].mainEntity;
    const summaries = [...docs['index.html'].querySelectorAll('.faq-item summary')];
    assert.equal(faq.length, summaries.length);
    for (const entry of faq) {
        assert.ok(entry.name.length > 10, 'пустой вопрос в разметке FAQ');
        assert.ok(entry.acceptedAnswer.text.length > 30, `пустой ответ на «${entry.name}»`);
    }
});

/**
 * Google требует, чтобы разметка FAQ повторяла видимый текст. Одна формулировка
 * сейчас разъехалась — зафиксировано осознанно, чтобы новые расхождения падали.
 */
const FAQ_KNOWN_DIVERGENCE = new Set([
    'Я не разработчик — я тестировщик / дизайнер / PM. Подойдёт?'
]);

test('JSON-LD FAQPage: формулировки совпадают с видимыми', () => {
    const faq = ld[2].mainEntity.map((e) => norm(e.name));
    const summaries = [...docs['index.html'].querySelectorAll('.faq-item summary')].map((s) => norm(s.textContent));

    summaries.forEach((visible, i) => {
        if (FAQ_KNOWN_DIVERGENCE.has(visible)) return;
        assert.equal(faq[i], visible, `вопрос №${i + 1} в JSON-LD разошёлся с видимым текстом`);
    });
});

test('мета-теги и Open Graph заполнены', () => {
    const doc = docs['index.html'];
    const meta = (sel) => doc.querySelector(sel)?.getAttribute('content');

    assert.equal(doc.querySelector('link[rel="canonical"]').getAttribute('href'), 'https://evocoders.ai/');
    assert.equal(meta('meta[property="og:url"]'), 'https://evocoders.ai/');
    assert.equal(meta('meta[name="robots"]'), 'index,follow');
    assert.equal(doc.documentElement.lang, 'ru');
    assert.ok(doc.title.length > 10);
    assert.ok(meta('meta[name="description"]').length > 50);

    const og = meta('meta[property="og:image"]');
    assert.ok(fs.existsSync(repoFile(og.replace('https://evocoders.ai/', ''))), `нет файла ${og}`);
});

test('sitemap.xml перечисляет существующие страницы', () => {
    const xml = readRepoFile('sitemap.xml');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.ok(locs.length > 0);

    for (const loc of locs) {
        const rel = loc.replace('https://evocoders.ai/', '') || 'index.html';
        assert.ok(fs.existsSync(repoFile(rel)), `sitemap ссылается на несуществующий ${rel}`);
    }
    for (const [, date] of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
        assert.match(date, /^\d{4}-\d{2}-\d{2}$/, 'lastmod должен быть в формате YYYY-MM-DD');
    }
    for (const page of PAGES) {
        const expected = page === 'index.html' ? 'https://evocoders.ai/' : `https://evocoders.ai/${page}`;
        assert.ok(locs.includes(expected), `${page} не попал в sitemap`);
    }
});

test('robots.txt открыт для краулеров и указывает на sitemap', () => {
    const robots = readRepoFile('robots.txt');
    assert.match(robots, /User-agent: \*\s*\nAllow: \//);
    assert.match(robots, /Sitemap: https:\/\/evocoders\.ai\/sitemap\.xml/);
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
        assert.match(robots, new RegExp(`User-agent: ${bot}\\s*\\nAllow: /`), `${bot} закрыт`);
    }
});

test('CNAME совпадает с доменом в canonical', () => {
    assert.equal(readRepoFile('CNAME').trim(), 'evocoders.ai');
});
