import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPage, click } from './helpers/dom.js';

const page = await loadPage({ scripts: ['archive.js'] });
const { window, document } = page;
test.after(() => page.close());

const tabs = () => [...document.querySelectorAll('#archive-tabs .archive-tab')];
const items = () => [...document.querySelectorAll('#archive-list .archive-item')];

test('вкладки отрисовались и первая активна', () => {
    const all = tabs();
    assert.ok(all.length >= 2, 'вкладок почти нет');
    assert.equal(all[0].classList.contains('active'), true);
    assert.equal(all.filter((t) => t.classList.contains('active')).length, 1);
});

test('у каждой вкладки есть иконка, подпись и счётчик', () => {
    for (const tab of tabs()) {
        assert.ok(tab.querySelector('i'), `${tab.dataset.tab}: нет иконки`);
        assert.ok(tab.querySelector('.archive-tab-label').textContent.trim(), `${tab.dataset.tab}: нет подписи`);
        assert.match(tab.querySelector('.archive-tab-count').textContent.trim(), /^\d+$/);
        assert.equal(tab.getAttribute('type'), 'button', 'кнопка внутри формы отправит её');
    }
});

test('при загрузке показан список первой вкладки', () => {
    assert.equal(items().length, Number(tabs()[0].querySelector('.archive-tab-count').textContent));
});

test('клик по вкладке переключает активность и содержимое', () => {
    const [first, second] = tabs();
    const before = items().map((li) => li.textContent);

    click(window, second);

    assert.equal(second.classList.contains('active'), true);
    assert.equal(first.classList.contains('active'), false);
    assert.equal(tabs().filter((t) => t.classList.contains('active')).length, 1);

    const after = items().map((li) => li.textContent);
    assert.notDeepEqual(after, before, 'содержимое не перерисовалось');
    assert.equal(after.length, Number(second.querySelector('.archive-tab-count').textContent));
});

test('клик по иконке внутри вкладки тоже переключает её', () => {
    const target = tabs().find((t) => t.dataset.tab === 'reviews');
    click(window, target.querySelector('i'));
    assert.equal(target.classList.contains('active'), true);
});

test('список прокручивается наверх при переключении', () => {
    const list = document.getElementById('archive-list');
    list.scrollTop = 300;
    click(window, tabs().find((t) => t.dataset.tab === 'workshops'));
    assert.equal(list.scrollTop, 0);
});

test('клик мимо вкладки ничего не ломает', () => {
    const before = document.getElementById('archive-list').innerHTML;
    click(window, document.getElementById('archive-tabs'));
    assert.equal(document.getElementById('archive-list').innerHTML, before);
});

test('записи сгруппированы по годам, внутри блока — только его год', () => {
    click(window, tabs().find((t) => t.dataset.tab === 'clubcalls'));

    const blocks = [...document.querySelectorAll('#archive-list .archive-year-block')];
    assert.ok(blocks.length >= 2, 'ожидались несколько годовых блоков');

    for (const block of blocks) {
        const year = block.querySelector('.archive-year').textContent.replace(/[^\d]/g, '');
        for (const li of block.querySelectorAll('.archive-item')) {
            const date = li.querySelector('.archive-item-date');
            if (date) assert.ok(date.textContent.trim().startsWith(year), `${date.textContent} не из ${year}`);
        }
    }
});

test('переключение туда-обратно возвращает тот же список', () => {
    const workshops = tabs().find((t) => t.dataset.tab === 'workshops');
    click(window, workshops);
    const snapshot = document.getElementById('archive-list').innerHTML;

    click(window, tabs().find((t) => t.dataset.tab === 'talks'));
    click(window, workshops);

    assert.equal(document.getElementById('archive-list').innerHTML, snapshot);
});

test('в заголовках записей нет сырых HTML-тегов', () => {
    for (const tab of tabs()) {
        click(window, tab);
        for (const li of items()) {
            assert.doesNotMatch(li.querySelector('.archive-item-title').textContent, /<[a-z/]/i);
        }
    }
});
