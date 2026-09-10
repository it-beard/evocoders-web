import { loadPage, click } from './dom.js';

/**
 * Восстанавливает данные архива из отрендеренного DOM, а не из внутренностей
 * js/archive.js: ARCHIVE_DATA спрятан в IIFE, и «щупать» его напрямую значило бы
 * тестировать реализацию вместо поведения.
 */
export async function loadArchive() {
    const page = await loadPage({ scripts: ['archive.js'] });
    const { window, document } = page;

    const tabs = [...document.querySelectorAll('#archive-tabs .archive-tab')];
    const order = tabs.map((t) => t.dataset.tab);
    const categories = {};

    for (const tab of tabs) {
        click(window, tab);

        const items = [];
        const years = [];
        for (const block of document.querySelectorAll('#archive-list .archive-year-block')) {
            const heading = block.querySelector('.archive-year').textContent.trim();
            const year = Number(heading.replace(/[^\d]/g, ''));
            years.push({ year, heading });

            for (const li of block.querySelectorAll('.archive-item')) {
                const dateEl = li.querySelector('.archive-item-date');
                items.push({
                    year,
                    date: dateEl ? dateEl.textContent.trim() : String(year),
                    dated: Boolean(dateEl),
                    title: li.querySelector('.archive-item-title').textContent.trim()
                });
            }
        }

        categories[tab.dataset.tab] = {
            key: tab.dataset.tab,
            label: tab.querySelector('.archive-tab-label').textContent.trim(),
            icon: tab.querySelector('i').getAttribute('class'),
            badgeCount: Number(tab.querySelector('.archive-tab-count').textContent.trim()),
            years,
            items
        };
    }

    const total = Object.values(categories).reduce((sum, c) => sum + c.items.length, 0);
    return { page, order, categories, total };
}

/** Типографика лендинга отличается от базы знаний — сравниваем по смыслу. */
export function normalizeTitle(str) {
    return str
        .replace(/[«»"'’‘]/g, '"')
        .replace(/[—–-]/g, '-')
        .replace(/\s+/g, ' ')
        .replace(/\s*\.\s*$/, '')
        .trim()
        .toLowerCase();
}
