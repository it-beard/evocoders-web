import test from 'node:test';
import assert from 'node:assert/strict';
import { loadPage, click, pressKey } from './helpers/dom.js';

const page = await loadPage({ scripts: ['gameOfLife.js', 'main.js'] });
const { window, document } = page;
test.after(() => page.close());

const COURSES = {
    modal: '#courses-modal',
    open: '#courses-card',
    close: '#modal-close',
    track: '#carousel-track',
    prev: '#carousel-prev',
    next: '#carousel-next',
    current: '#carousel-counter .current-slide',
    total: '#carousel-counter .total-slides',
    indicators: '#carousel-indicators .indicator'
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const current = () => Number($(COURSES.current).textContent);
const slides = () => $$(`${COURSES.track} .carousel-slide`);

function openModal() {
    click(window, $(COURSES.open));
}

test('лендинг инициализируется без JS-ошибок', () => {
    assert.deepEqual(page.jsErrors, []);
});

test('счётчик знает реальное число слайдов', () => {
    assert.equal(Number($(COURSES.total).textContent), slides().length);
});

test('на старте активен первый слайд, «назад» заблокирована', () => {
    assert.equal(current(), 1);
    assert.equal($(COURSES.prev).disabled, true);
    assert.equal($(COURSES.next).disabled, false);
    assert.equal(slides()[0].classList.contains('active'), true);
});

test('«вперёд» листает и упирается в последний слайд', () => {
    const total = slides().length;
    for (let i = 0; i < total + 3; i++) click(window, $(COURSES.next));

    assert.equal(current(), total);
    assert.equal($(COURSES.next).disabled, true, 'на последнем слайде «вперёд» должна блокироваться');
    assert.equal($(COURSES.prev).disabled, false);
    assert.equal(slides()[total - 1].classList.contains('active'), true);
});

test('«назад» листает и упирается в первый слайд', () => {
    for (let i = 0; i < slides().length + 3; i++) click(window, $(COURSES.prev));

    assert.equal(current(), 1);
    assert.equal($(COURSES.prev).disabled, true);
});

test('активен ровно один слайд и один индикатор', () => {
    click(window, $(COURSES.next));

    assert.equal(slides().filter((s) => s.classList.contains('active')).length, 1);
    assert.equal($$(COURSES.indicators).filter((i) => i.classList.contains('active')).length, 1);
    assert.equal($$(COURSES.indicators)[current() - 1].classList.contains('active'), true);
});

test('клик по индикатору прыгает на нужный слайд', () => {
    const last = $$(COURSES.indicators).length - 1;
    click(window, $$(COURSES.indicators)[last]);

    assert.equal(current(), last + 1);
    assert.equal(slides()[last].classList.contains('active'), true);
});

test('лента сдвигается на 100% за слайд', () => {
    click(window, $$(COURSES.indicators)[1]);
    assert.equal($(COURSES.track).style.transform, 'translateX(-100%)');

    click(window, $$(COURSES.indicators)[0]);
    assert.equal($(COURSES.track).style.transform, 'translateX(-0%)');
});

test('открытие модалки блокирует прокрутку и сбрасывает на первый слайд', () => {
    click(window, $$(COURSES.indicators)[2]);
    assert.equal(current(), 3);

    openModal();

    assert.equal($(COURSES.modal).classList.contains('active'), true);
    assert.equal(document.body.style.overflow, 'hidden');
    assert.equal(current(), 1, 'модалка должна открываться с первого слайда');
});

test('крестик закрывает модалку и возвращает прокрутку', () => {
    openModal();
    click(window, $(COURSES.close));

    assert.equal($(COURSES.modal).classList.contains('active'), false);
    assert.equal(document.body.style.overflow, '');
});

test('клик по подложке закрывает, клик по содержимому — нет', () => {
    openModal();

    click(window, $(`${COURSES.modal} .modal-content`));
    assert.equal($(COURSES.modal).classList.contains('active'), true, 'клик внутри не должен закрывать');

    click(window, $(COURSES.modal));
    assert.equal($(COURSES.modal).classList.contains('active'), false);
});

test('стрелки листают, только пока модалка открыта', () => {
    const before = current();
    pressKey(window, 'ArrowRight');
    assert.equal(current(), before, 'закрытая модалка не должна реагировать на стрелки');

    openModal();
    pressKey(window, 'ArrowRight');
    assert.equal(current(), 2);
    pressKey(window, 'ArrowLeft');
    assert.equal(current(), 1);
});

test('Escape закрывает открытую модалку', () => {
    openModal();
    pressKey(window, 'Escape');

    assert.equal($(COURSES.modal).classList.contains('active'), false);
    assert.equal(document.body.style.overflow, '');
});

test('свайп по модалке листает слайды', () => {
    openModal();
    const modal = $(COURSES.modal);
    const touch = (type, screenX) => modal.dispatchEvent(
        new window.TouchEvent(type, { bubbles: true, changedTouches: [{ screenX }] })
    );

    touch('touchstart', 300);
    touch('touchend', 100);
    assert.equal(current(), 2, 'свайп влево — следующий слайд');

    touch('touchstart', 100);
    touch('touchend', 300);
    assert.equal(current(), 1, 'свайп вправо — предыдущий');

    touch('touchstart', 100);
    touch('touchend', 90);
    assert.equal(current(), 1, 'короткий свайп игнорируется');

    pressKey(window, 'Escape');
});

test('все три карусели поднялись независимо', () => {
    const carousels = [
        ['#courses-modal', '#courses-card', '#carousel-counter .total-slides', '#carousel-track'],
        ['#content-modal', '#content-card', '#content-carousel-counter .total-slides', '#content-carousel-track'],
        ['#digests-modal', '#digests-card', '#digests-carousel-counter .total-slides', '#digests-carousel-track']
    ];

    for (const [modal, opener, total, track] of carousels) {
        const count = $$(`${track} .carousel-slide`).length;
        assert.equal(Number($(total).textContent), count, `${modal}: счётчик разошёлся`);

        click(window, $(opener));
        assert.equal($(modal).classList.contains('active'), true, `${modal} не открылась`);
        pressKey(window, 'Escape');
        assert.equal($(modal).classList.contains('active'), false, `${modal} не закрылась`);
    }
});
