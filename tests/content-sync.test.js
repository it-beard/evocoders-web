import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStatic } from './helpers/dom.js';
import { readRepoFile } from './helpers/paths.js';
import { loadArchive } from './helpers/archive.js';

const archive = await loadArchive();
test.after(() => archive.page.close());

const staticDoc = parseStatic('index.html');
const html = readRepoFile('index.html');
const llms = readRepoFile('llms.txt');

const squash = (s) => s.replace(/\s+/g, ' ').trim();
const textOf = (doc, id) => squash(doc.getElementById(id).textContent);

/**
 * В index.html сводка архива и бейдж «последнее событие» продублированы статикой:
 * их видят краулеры без JS. js/archive.js пересчитывает их из данных при загрузке.
 * Эти два теста ловят расхождение — самый вероятный способ, которым лендинг устаревает.
 */
test('статичная сводка архива совпадает с пересчитанной из данных', () => {
    assert.equal(
        textOf(staticDoc, 'archive-summary'),
        textOf(archive.page.document, 'archive-summary')
    );
});

test('статичный бейдж «последнее событие» совпадает с пересчитанным', () => {
    assert.equal(
        textOf(staticDoc, 'hero-latest-text'),
        textOf(archive.page.document, 'hero-latest-text')
    );
});

test('сводка перечисляет реальные количества по категориям', () => {
    const summary = textOf(archive.page.document, 'archive-summary');
    for (const cat of Object.values(archive.categories)) {
        assert.match(
            summary, new RegExp(`\\b${cat.items.length}\\s`),
            `в сводке нет числа ${cat.items.length} для «${cat.label}»`
        );
    }
    assert.match(summary, new RegExp(`всего ${archive.total} запис`));
});

test('бейдж показывает самое свежее датированное событие', () => {
    const dated = Object.values(archive.categories)
        .flatMap((c) => c.items)
        .filter((i) => /^\d{4}\.\d{2}\.\d{2}$/.test(i.date))
        .sort((a, b) => b.date.localeCompare(a.date));

    const latest = dated[0];
    const [y, m, d] = latest.date.split('.').map(Number);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const shortTitle = latest.title.split(':')[0].split(' / ')[0].trim();

    assert.equal(
        textOf(archive.page.document, 'hero-latest-text'),
        `${shortTitle} — ${d} ${months[m - 1]} ${y}`
    );
});

test('llms.txt не завышает размер архива и округлён вниз до десятков', () => {
    const claimed = Number(llms.match(/Архив:\s*(\d+)\+\s*записей/)[1]);
    assert.ok(claimed <= archive.total, `llms.txt обещает ${claimed}+, а записей ${archive.total}`);
    assert.ok(
        archive.total - claimed < 10,
        `llms.txt отстал: обещает ${claimed}+, а записей уже ${archive.total}`
    );
    assert.equal(claimed % 10, 0, 'число в llms.txt округляется до десятков');
});

test('llms.txt перечисляет те же типы контента, что и вкладки архива', () => {
    const line = llms.match(/- Архив:.*/)[0].toLowerCase();
    const expectPresent = ['воркшоп', 'созвон', 'late coffee', 'интервью', 'обзор', 'книжный клуб', 'обучалк', 'доклад'];
    for (const token of expectPresent) {
        assert.ok(line.includes(token), `в строке «Архив» llms.txt нет «${token}»`);
    }
});

/**
 * Одни и те же цифры разбросаны по hero, карточкам, FAQ, JSON-LD и llms.txt.
 * Здесь ловим ситуацию, когда цифру поправили в одном месте и забыли в остальных.
 */
const FACTS = [
    { name: 'размер сообщества', pattern: /(\d+)\+(?:&nbsp;|\s)*(?:инженер|разработчик)/g, value: '700' },
    { name: 'каталог инструментов', pattern: /(\d+)\+(?:&nbsp;|\s|<\/strong>)*\s*(?:AI-инструмент|инструмент)/g, value: '450' },
    { name: 'часов контента', pattern: /(\d+)\+(?:&nbsp;|\s|<\/strong>)*\s*часов/g, value: '200' },
    { name: 'число курсов', pattern: /(\d+)(?:&nbsp;|\s)*курс/g, value: '3' }
];

for (const fact of FACTS) {
    test(`${fact.name}: одна цифра во всех местах`, () => {
        const found = [...(html + llms).matchAll(fact.pattern)].map((m) => m[1]);
        assert.ok(found.length > 1, `${fact.name} упоминается всего ${found.length} раз — регулярка устарела?`);
        assert.deepEqual([...new Set(found)], [fact.value]);
    });
}

test('цены совпадают в разметке и в JSON-LD', () => {
    const inMarkup = [...new Set(html.match(/€\s?[\d.]+/g).map((s) => s.replace(/\s/g, '')))].sort();
    assert.deepEqual(inMarkup, ['€11.7', '€14', '€140'], 'на странице появилась новая цена');

    const offers = [...html.matchAll(/"price":\s*"(\d+)"/g)].map((m) => m[1]);
    assert.deepEqual(offers, ['14', '140'], 'JSON-LD разошёлся с ценами на странице');
});

test('годовая цена даёт заявленную выгоду', () => {
    const monthly = 14;
    const yearly = 140;
    const perMonth = yearly / 12;
    assert.match(html, /≈&nbsp;€11\.7 в&nbsp;месяц/, 'подпись помесячной выгоды разошлась с ценой');
    assert.equal(Math.round(perMonth * 10) / 10, 11.7);

    const discount = Math.round((1 - yearly / (monthly * 12)) * 100);
    assert.match(html, new RegExp(`выгода&nbsp;${discount}%`), `заявленная скидка ≠ ${discount}%`);
});
