import test from 'node:test';
import assert from 'node:assert/strict';
import { findLearnRepo } from './helpers/paths.js';
import { parseNavigator, CATEGORY_BY_FILE } from './helpers/learn.js';
import { loadArchive, normalizeTitle } from './helpers/archive.js';

const learnRoot = findLearnRepo();
const skip = learnRoot
    ? false
    : 'репозиторий evocoders-learn не найден рядом (задай EVOCODERS_LEARN_PATH, чтобы включить сверку)';

/**
 * Архив на лендинге — витрина навигатора контента из базы знаний. Разъезжаются
 * они молча: контент добавляют в evocoders-learn, а js/archive.js правят потом.
 * Тест мягкий: без соседнего репозитория он пропускается, а не падает.
 */
const learn = learnRoot ? parseNavigator(learnRoot) : { byCategory: {}, unknownFiles: [] };
const archive = skip ? null : await loadArchive();
test.after(() => archive?.page.close());

/**
 * Осознанные расхождения: лендинг местами формулирует иначе.
 * Всё, чего здесь нет, обязано совпадать с базой знаний.
 */
const ALLOWED_DIVERGENCE = new Map([
    ['clubcalls|2024.12.16', 'в базе знаний опечатка «Sonet» — на лендинге «Sonnet»'],
    ['reviews|2024.10.18', 'в базе знаний опечатка «Knowlege» — на лендинге «Knowledge»'],
    ['talks|2024.10.30', 'на лендинге двоеточие вместо тире перед темой доклада'],
    ['latecoffee|2026.09.03', 'выпуск пронумерован «Late Coffee №1» ради бейджа «последнее событие» в hero']
]);

test('в навигаторе нет незнакомых категорий', { skip }, () => {
    assert.deepEqual(
        learn.unknownFiles, [],
        'появился новый тип контента — заведи вкладку в js/archive.js и категорию в tests/helpers/learn.js'
    );
});

test('каждая категория навигатора есть на лендинге', { skip }, () => {
    for (const category of Object.keys(learn.byCategory)) {
        assert.ok(archive.categories[category], `на лендинге нет вкладки «${category}»`);
    }
});

test('количество записей совпадает по каждой категории', { skip }, () => {
    for (const [category, items] of Object.entries(learn.byCategory)) {
        assert.equal(
            archive.categories[category].items.length, items.length,
            `«${category}»: в базе знаний ${items.length}, на лендинге ${archive.categories[category].items.length}`
        );
    }
});

test('ни одно датированное событие не потерялось', { skip }, () => {
    const missing = [];
    for (const [category, items] of Object.entries(learn.byCategory)) {
        const onSite = new Set(archive.categories[category].items.map((i) => i.date));
        for (const item of items.filter((i) => i.dated)) {
            if (!onSite.has(item.date)) missing.push(`${category} ${item.date} — ${item.title}`);
        }
    }
    assert.deepEqual(missing, [], `нет на лендинге:\n${missing.join('\n')}`);
});

test('на лендинге нет событий, которых нет в базе знаний', { skip }, () => {
    const extra = [];
    for (const [category, cat] of Object.entries(archive.categories)) {
        const known = new Set((learn.byCategory[category] || []).map((i) => i.date));
        for (const item of cat.items.filter((i) => /^\d{4}\.\d{2}\.\d{2}$/.test(i.date))) {
            if (!known.has(item.date)) extra.push(`${category} ${item.date} — ${item.title}`);
        }
    }
    assert.deepEqual(extra, [], `есть на лендинге, но нет в базе знаний:\n${extra.join('\n')}`);
});

/**
 * Записи без точной даты (книжный клуб 2024) сравниваем только по количеству:
 * на лендинге к ним осознанно дописано название разбираемой книги или статьи.
 */
test('заголовки датированных событий совпадают с базой знаний', { skip }, () => {
    const diffs = [];

    for (const [category, items] of Object.entries(learn.byCategory)) {
        const onSite = new Map();
        for (const item of archive.categories[category].items) {
            (onSite.get(item.date) || onSite.set(item.date, []).get(item.date)).push(item.title);
        }

        for (const item of items.filter((i) => i.dated)) {
            if (ALLOWED_DIVERGENCE.has(`${category}|${item.date}`)) continue;

            const candidates = onSite.get(item.date) || [];
            const matched = candidates.some((title) => normalizeTitle(title) === normalizeTitle(item.title));
            if (!matched) {
                diffs.push(`${category} ${item.date}\n  база знаний: ${item.title}\n  лендинг    : ${candidates.join('\n               ')}`);
            }
        }
    }

    assert.deepEqual(diffs, [], `расходятся заголовки:\n\n${diffs.join('\n\n')}`);
});

test('список осознанных расхождений не протух', { skip }, () => {
    for (const [key, reason] of ALLOWED_DIVERGENCE) {
        const [category, date] = key.split('|');
        const learnItem = (learn.byCategory[category] || []).find((i) => i.date === date);
        const siteItem = archive.categories[category]?.items.find((i) => i.date === date);

        assert.ok(learnItem, `${key}: записи больше нет в базе знаний — убери её из ALLOWED_DIVERGENCE`);
        assert.ok(siteItem, `${key}: записи больше нет на лендинге — убери её из ALLOWED_DIVERGENCE`);
        assert.notEqual(
            normalizeTitle(learnItem.title), normalizeTitle(siteItem.title),
            `${key}: заголовки уже совпали (${reason}) — убери запись из ALLOWED_DIVERGENCE`
        );
    }
});

test('карта категорий покрывает все вкладки лендинга', { skip }, () => {
    const mapped = new Set(Object.values(CATEGORY_BY_FILE));
    for (const key of archive.order) {
        assert.ok(mapped.has(key), `вкладка «${key}» не привязана ни к одному файлу навигатора`);
    }
});
