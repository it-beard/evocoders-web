import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const repoFile = (...p) => path.join(ROOT, ...p);
export const readRepoFile = (...p) => fs.readFileSync(repoFile(...p), 'utf8');

/**
 * Соседний репозиторий с базой знаний. Тесты синхронности пропускаются,
 * если его нет рядом — чтобы прогон не зависел от чужого чекаута.
 */
export function findLearnRepo() {
    // Явно заданный путь считаем единственным источником правды: так тест
    // синхронности можно осознанно выключить (EVOCODERS_LEARN_PATH=none).
    const candidates = process.env.EVOCODERS_LEARN_PATH
        ? [process.env.EVOCODERS_LEARN_PATH]
        : [path.resolve(ROOT, '..', 'evocoders-learn')];

    for (const dir of candidates) {
        if (fs.existsSync(path.join(dir, 'docs', 'content-navigator'))) return dir;
    }
    return null;
}
