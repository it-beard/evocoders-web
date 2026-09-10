import fs from 'node:fs';
import path from 'node:path';

/** Файл навигатора → вкладка архива на лендинге. */
export const CATEGORY_BY_FILE = {
    'workshops': 'workshops',
    'club-calls': 'clubcalls',
    'late-coffee': 'latecoffee',
    'interviews': 'interviews',
    'reviews': 'reviews',
    'books-club': 'booksclub',
    'lessons': 'lessons',
    'talks': 'talks'
};

/** Не клубный контент на лендинг не выносим — это чужие материалы. */
export const IGNORED_FILES = new Set(['non-club-content']);

/**
 * Разбирает docs/content-navigator/<год>/<категория>.md.
 * Навигатор использует два формата строк:
 *   - YYYY.MM.DD / [Заголовок](ссылка)
 *   - [Заголовок](ссылка): хвост      ← книжный клуб 2024, без точной даты
 */
export function parseNavigator(learnRoot) {
    const base = path.join(learnRoot, 'docs', 'content-navigator');
    const byCategory = {};
    const unknownFiles = [];

    for (const year of fs.readdirSync(base).sort()) {
        const dir = path.join(base, year);
        if (!fs.statSync(dir).isDirectory()) continue;

        for (const file of fs.readdirSync(dir).sort()) {
            const slug = file.replace(/\.md$/, '');
            if (IGNORED_FILES.has(slug)) continue;

            const category = CATEGORY_BY_FILE[slug];
            if (!category) { unknownFiles.push(`${year}/${file}`); continue; }

            const lines = fs.readFileSync(path.join(dir, file), 'utf8').split('\n');
            for (const line of lines) {
                const dated = line.match(/^-\s*(\d{4}\.\d{2}\.\d{2})\s*\/\s*\[(.+?)\]\((.*?)\)\s*$/);
                if (dated) {
                    (byCategory[category] ||= []).push({ date: dated[1], title: dated[2].trim(), year, dated: true });
                    continue;
                }
                const undatedEntry = line.match(/^-\s*\[(.+?)\]\((.*?)\)\s*:?\s*(.*)$/);
                if (undatedEntry) {
                    const title = (undatedEntry[1] + (undatedEntry[3] ? `: ${undatedEntry[3]}` : '')).trim();
                    (byCategory[category] ||= []).push({ date: year, title, year, dated: false });
                }
            }
        }
    }

    return { byCategory, unknownFiles };
}
