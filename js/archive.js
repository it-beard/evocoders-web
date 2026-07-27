// Архив клубного контента — данные синхронизированы с docs/content-navigator/* в evocoders-learn.
(function () {
    const ARCHIVE_DATA = {
        workshops: {
            label: 'Воркшопы',
            icon: 'fas fa-flask-vial',
            items: [
                { year: 2026, date: '2026.06.16', title: 'INITE Brain: память, время и границы для AI-агентов / Михаил Савченко' },
                { year: 2026, date: '2026.06.10', title: 'Temporal как позвоночник мультиагентных систем / Михаил Савченко' },
                { year: 2026, date: '2026.04.16', title: 'Применения Spec Driven Development на монолитах и больших кодовых базах / Клубчанин Михаил' },
                { year: 2026, date: '2026.03.12', title: 'Воркшоп по использования ИИ в UI / Святослав Фёдоров' },
                { year: 2026, date: '2026.02.17', title: 'Воркшоп по юзкейсам использования ИИ в UX и Figma / Алексей Акимкин' },
                { year: 2026, date: '2026.01.28', title: 'Воркшоп по формальной верификации спецификаций через язык Quint / Михаил Савченко' },

                { year: 2025, date: '2025.12.18', title: 'Воркшоп по Kiro (SDD, Powers и др.) и Kiro CLI / Виктор Ведмич' },
                { year: 2025, date: '2025.12.11', title: 'Воркшоп по работе со Skills и Subagents в Claude Code / Игнат Рожко' },
                { year: 2025, date: '2025.10.15', title: 'Воркшоп по основам RAG и новому Knowledge Pipeline от Dify / Михаил Савченко' },
                { year: 2025, date: '2025.10.01', title: 'Воркшоп по ИИ в Xcode 26 / Алексей Никифоров' },
                { year: 2025, date: '2025.08.27', title: 'Воркшоп-митап по Context Engineering / Михаил Савченко' },
                { year: 2025, date: '2025.08.21', title: 'Kiro — IDE от AWS / Антон Коваленко' },
                { year: 2025, date: '2025.08.08', title: 'Сравниваем Cursor и Claude Code / Алексей Картынник' },
                { year: 2025, date: '2025.07.23', title: 'Как навайбкодить готовое приложение на Bolt.new & Supabase / Валентин Завадский' },
                { year: 2025, date: '2025.07.15', title: 'Создаем умных чат-ботов через n8n и Dify / Михаил Савченко' },
                { year: 2025, date: '2025.06.05', title: 'Воркшоп по созданию Remote MCP через Dify и n8n / Михаил Савченко' },
                { year: 2025, date: '2025.04.30', title: 'Воркшоп по голосовым агентам и LiveKit / Валентин Завадский' },
                { year: 2025, date: '2025.04.09', title: 'Митап по CodeAlive — RAG над кодовой базой на максималках / Родион Мостовой и Иван Бирюк' },
                { year: 2025, date: '2025.03.12', title: 'Вся база по Cursor (+ MCP) / Валера Селицкий и Лекс Картынник' },
                { year: 2025, date: '2025.03.11', title: 'Память для агентных приложений / Михаил Савченко' },
                { year: 2025, date: '2025.02.27', title: 'Базовые концепции фреймворка CrewAI / Валентин Завадский' },
                { year: 2025, date: '2025.02.06', title: 'Воркшоп по устройству и работе в Devin / Олександр Василейко' },
                { year: 2025, date: '2025.01.30', title: 'Воркшоп по созданию агентных приложений при помощи Dify / Михаил Савченко' },
                { year: 2025, date: '2025.01.23', title: '«Кухонный» self-hosted ИИ-ассистент Kaia и декоратор моделей BrainBox / Юрий Окуловский' },
                { year: 2025, date: '2025.01.16', title: 'Генерация и валидация ответов LLM с помощью structured outputs / Артём Нурмухаметов' },

                { year: 2024, date: '2024.12.23', title: 'Устройство и работа MCP / Сергей Парфенюк' },
                { year: 2024, date: '2024.11.28', title: 'Работа с данными через ИИ-инструменты / Алексей Картынник' },
                { year: 2024, date: '2024.11.15', title: 'Базовая работа с Jupyter Notebook / Константин Науменко' },
                { year: 2024, date: '2024.10.24', title: 'Строим RAG над кодовой базой / Дмитрий Андриенко' },
                { year: 2024, date: '2024.10.23', title: 'JetBrains AI Assistant / Антон Архипов' },
                { year: 2024, date: '2024.10.18', title: 'Инференс и квантизация для LLM / Артур Панюков' },
                { year: 2024, date: '2024.09.19', title: 'Эффективная работа с GitHub Copilot / Юлия Хадасевич' },
                { year: 2024, date: '2024.09.13', title: 'Файнтюним Llama3 / Виктория Латынина' },
                { year: 2024, date: '2024.09.07', title: 'Создаем агенты при помощи CrewAI и MetaGPT / Михаил Савченко' },
                { year: 2024, date: '2024.08.10', title: 'Эффективная работа с Cursor IDE / Валера Селицкий' },
                { year: 2024, date: '2024.08.03', title: 'Создание игр с помощью ИИ / Стася Кариленко' },
                { year: 2024, date: '2024.08.01', title: 'Obsidian + LLM / Игорь Нестереня' },
                { year: 2024, date: '2024.07.25', title: 'Работа с LangChain, LangSmith и LangGraph / Михаил Савченко' },
                { year: 2024, date: '2024.07.13', title: 'Эффективная работа с aider / Родион Мостовой' }
            ]
        },
        clubcalls: {
            label: 'Созвоны',
            icon: 'fas fa-headset',
            items: [
                { year: 2026, date: '2026.07.14', title: 'Созвон №37: Fable 5 vs Soul, концепция Dark Factory и оркестрация агентов, безопасность агентов на локальных машинах, VPS и облака для разработки, память агентов и персонализация, Gemini vs OpenAI/Anthropic, Agent Protocol, поездка Лекса в США' },
                { year: 2026, date: '2026.06.10', title: 'Созвон №36: Fable 5 — первые впечатления, цены и отключение headless-режима, Mythos vs Fable, Minimax M3 и DeepSeek, стоимость ИИ-фабрики (Dark Factory) из 25 агентов, миграция легаси с FoxPro, как проходить собеседование на ИИ-инженера' },
                { year: 2026, date: '2026.05.19', title: 'Созвон №35: Composer 2.5 и ценообразование моделей, $1.3 млн в месяц на ИИ-инфраструктуру, найм ИИ-разработчика, локальный инференс и железо для моделей, OpenClaw' },
                { year: 2026, date: '2026.05.05', title: 'Созвон №34: GPT 5.5, Opus 4.7, DeepSeek v4, рост цен, легаси и трансформация профессии' },
                { year: 2026, date: '2026.04.14', title: 'Созвон №32: Подписка Claude Code vs Codex, как не нанять вайбкодера, внедрение ИИ в команды разработки, SDD, выживут ли джуны, Product Engineer' },
                { year: 2026, date: '2026.03.24', title: 'Созвон №31: GPT-5.4, Cursor становится невыгодным, базы SDD, автоматизация бизнеса и тестирования, юзкейсы OpenClaw, ИИ для 3D-моделинга и чертежей' },
                { year: 2026, date: '2026.03.10', title: 'Созвон №30: GPT-5.4, RAG для продакшена, основы SDD, ИИ в iOS-разработке, работа с монолитом' },
                { year: 2026, date: '2026.02.23', title: 'Созвон №29: Gemini 3.1, Sonnet 4.6, Opus 4.6, Codex 5.3, внедрение AI в SDLC и лимиты подписок' },
                { year: 2026, date: '2026.02.10', title: 'Созвон №28: GPT-5.3 Codex, Claude Opus 4.6, Composer 1.5, внедрение ИИ-пайплайнов в команды, оценка навыков разработчика с ИИ, нужны ли университеты и будущее программирования' },
                { year: 2026, date: '2026.01.27', title: 'Созвон №27: Конец китайского Open Source, MCP Applications, MeltBot, LLM в Unitree G1, Junie CLI, AI Code Reviewer' },
                { year: 2026, date: '2026.01.13', title: 'Созвон №26: Генерация UI (FreePik, GenSpark, Figma MCP, Storybook), Skills vs MCP, проблемы с Claude Code и зависания Antigravity, современные веб-интерфейсы' },

                { year: 2025, date: '2025.12.23', title: 'Созвон №25: GLM-4.7, BYOK Jetbrains, Context Driven Development, Code Review, подведение итогов 2025 года' },
                { year: 2025, date: '2025.12.09', title: 'Созвон №24: GPT-5.1 Codex Max, Antigravity, ценообразование Cursor, построение архитектурных диаграмм, TypeScript-контракты в код, малые локальные модели, архитекторы ИИ-агентов и NPU' },
                { year: 2025, date: '2025.11.25', title: 'Созвон №23: GPT-5.1 Codex, Gemini 3 Pro Preview, Claude Sonnet 4.5, Spec Driven Development, ИИ-рефакторинг, TOON, TONL, Antigravity' },
                { year: 2025, date: '2025.11.12', title: 'Созвон №22: ИИ-хакатон, новые модели GPT-5 Codex mini, Kimi K2, Minimax M2, индексация кода, автоматизация звонков и связка кода и бизнес-требований' },
                { year: 2025, date: '2025.10.28', title: 'Созвон №21: Юзкейсы ИИ-браузеров, Claude Skills, Context Management, GitHub Copilot, замена нас ИИ и куда расти, чтобы не заменили' },
                { year: 2025, date: '2025.10.14', title: 'Созвон №20: GPT-5 Pro, Cursor Browser, Plan mode & Hooks, безопасность ИИ-инструментов и security-чек кода' },
                { year: 2025, date: '2025.09.30', title: 'Созвон №19: Claude Sonnet 4.5, Claude Agent SDK, AGI и проблемы вайбкодинга' },
                { year: 2025, date: '2025.09.16', title: 'Созвон №18: GPT-5 Codex, Qwen Next, Warp Code, многоагентность' },
                { year: 2025, date: '2025.09.02', title: 'Созвон №17: Grok Code Fast 1 и устройство датацентров' },
                { year: 2025, date: '2025.08.18', title: 'Созвон №16: GPT-5, Cursor CLI, Jules, Context7, Memory Bank, база для новичков и подражания' },
                { year: 2025, date: '2025.08.05', title: 'Созвон №15: EDGE AI, Comet, Qwen Coder 30B, LM Studio RAG, text-to-sql' },
                { year: 2025, date: '2025.07.22', title: 'Созвон №14: Comet, Kiro, Claude Code Action, Diffusion Models' },
                { year: 2025, date: '2025.07.08', title: 'Созвон №13: Gemini CLI, Warp 2.0, Trae Agent, ClaudeCode vs Cursor' },
                { year: 2025, date: '2025.06.24', title: 'Созвон №12: Dia, Warp, Gemini 2.5 Flash-Light, обработка PDF' },
                { year: 2025, date: '2025.06.10', title: 'Созвон №11: Gemini 2.5 Pro 05.06, Magistral, Gemini Diffusion и др.' },
                { year: 2025, date: '2025.05.27', title: 'Созвон №10: Claude 4, Cursor Background Agent, файнтюнинг и ЯП под ИИ' },
                { year: 2025, date: '2025.05.13', title: 'Созвон №9: обновления Cursor, RCP, Gemini Pro 2.5 I/O, Mistral Medium 3, вендорлоки, Product Engineer, MoE, Reasoning, полезные MCP' },
                { year: 2025, date: '2025.04.29', title: 'Созвон №8: Qwen 3, Trae IDE, Docker AI, экономика роботов и что из ИИ использует разработчик' },
                { year: 2025, date: '2025.04.15', title: 'Созвон №7: Junie, Windsurf, A2A, MCP, деградация моделей, Deep Research, налоги США и Трамп' },
                { year: 2025, date: '2025.04.01', title: 'Созвон №6: Gemini 2.5, новый GPT-4o, Manus, Deep Research и нужен ли MCP' },
                { year: 2025, date: '2025.03.18', title: 'Созвон №5: хостинг LLM, Cursor vs Windsurf и будущее разработки' },
                { year: 2025, date: '2025.03.04', title: 'Созвон №4: Sonnet 3.7, GPT 4.5, Cursor и Warp' },
                { year: 2025, date: '2025.02.18', title: 'Созвон №3: про VR, Cursor, локальные модели и децентраленд' },

                { year: 2024, date: '2024.12.16', title: 'Созвон №2: про Claude 3.5 Sonnet, джунов и базовую терминологию клуба и ИИ' }
            ]
        },
        interviews: {
            label: 'Интервью',
            icon: 'fas fa-microphone',
            items: [
                { year: 2026, date: '2026.05.07', title: 'Глеб Моргачёв — co-creator и главный инженер Gonka Protocol: децентрализованный инференс открытых моделей' },

                { year: 2025, date: '2025.06.17', title: 'Байрам Аннаков — AI Product Engineer и будущее разработки' },

                { year: 2024, date: '2024.09.01', title: 'Виктор Ведмич — всё про ИИ для разработчиков в AWS' },
                { year: 2024, date: '2024.07.13', title: 'Гриша Бакунов — будущее ИИ и инструментарий разработчика' },
                { year: 2024, date: '2024.06.07', title: 'Родион Мостовой — «разговаривать» со своим кодом — это круто' },
                { year: 2024, date: '2024.06.07', title: 'Валерий Селицкий — опыт использования ИИ, написание ботов-рисовальщиков и Cursor' },
                { year: 2024, date: '2024.06.06', title: 'Миша Ларченко — ИИ с самосознанием мы не увидим, но хотелось бы' },
                { year: 2024, date: '2024.05.29', title: 'Ринат Тухватшин — всем программистам будет нужно знать базу из ML и LLM' },
                { year: 2024, date: '2024.05.12', title: 'Виктор Шеленченко — опыт использования AI-инструментов' }
            ]
        },
        reviews: {
            label: 'Обзоры',
            icon: 'fas fa-magnifying-glass-chart',
            items: [
                { year: 2025, date: '2025.10.26', title: 'Обзор ИИ-браузеров GPT Atlas, Opera Neon и Strawberry' },
                { year: 2025, date: '2025.08.25', title: 'Обзор Qoder IDE' },
                { year: 2025, date: '2025.06.13', title: 'Обзор браузера Dia' },
                { year: 2025, date: '2025.04.15', title: 'Мини-обзор на плагин от Windsurf для IDE’шек от JetBrains' },
                { year: 2025, date: '2025.04.14', title: 'Обзор JetBrains Junie' },
                { year: 2025, date: '2025.03.29', title: 'Сравнение всех AI-first IDE' },
                { year: 2025, date: '2025.03.24', title: 'Обзор Windsurf Editor' },
                { year: 2025, date: '2025.02.08', title: 'ChatGPT Deep Research' },
                { year: 2025, date: '2025.01.28', title: 'Обзор OpenAI Operator' },
                { year: 2025, date: '2025.01.09', title: 'Обзор o1 Pro' },
                { year: 2025, date: '2025.01.07', title: 'Обзор SORA Pro' },

                { year: 2024, date: '2024.12.13', title: 'Gemini Deep Research' },
                { year: 2024, date: '2024.12.09', title: 'Большой обзор GitHub Copilot' },
                { year: 2024, date: '2024.11.06', title: 'Обзор World Summit AI 2024 (конференция)' },
                { year: 2024, date: '2024.10.18', title: 'Perplexity Spaces + Internal Knowledge Search' },
                { year: 2024, date: '2024.10.03', title: 'ChatGPT Canvas' },
                { year: 2024, date: '2024.09.27', title: 'Большой обзор ChatGPT' },
                { year: 2024, date: '2024.09.22', title: 'Cursor Composer + GPT o1-preview' },
                { year: 2024, date: '2024.09.03', title: 'Gemini Advanced и Gemini Gems' },
                { year: 2024, date: '2024.07.30', title: 'Репортаж с WADDC 2024 (конференция)' },
                { year: 2024, date: '2024.07.10', title: 'Poe + Previews' },
                { year: 2024, date: '2024.06.26', title: 'Claude Projects' },
                { year: 2024, date: '2024.06.22', title: 'Claude Artifacts' },
                { year: 2024, date: '2024.06.22', title: 'Copilot Workspace technical preview' },
                { year: 2024, date: '2024.06.16', title: 'Project IDX beta' },
                { year: 2024, date: '2024.06.09', title: 'Тестирую Whisper в браузере' }
            ]
        },
        booksclub: {
            label: 'Книжный клуб',
            icon: 'fas fa-book-open',
            items: [
                { year: 2025, date: '2025.04.24', title: 'Обсуждение статьи «AI 2027»' },

                { year: 2024, date: '2024', title: 'Книжный клуб №1 — статья «SITUATIONAL AWARENESS», часть 1: от GPT-2 до AGI к 2027' },
                { year: 2024, date: '2024', title: 'Книжный клуб №2 — «SITUATIONAL AWARENESS», часть 2: от AGI до ASI к 2030' },
                { year: 2024, date: '2024', title: 'Книжный клуб №3 — «SITUATIONAL AWARENESS», части 3a/3b: датацентры за $1T в 2030' },
                { year: 2024, date: '2024', title: 'Книжный клуб №4 — «SITUATIONAL AWARENESS», части 3c/3d: проблема Супералайнмента' },
                { year: 2024, date: '2024', title: 'Книжный клуб №5 — «SITUATIONAL AWARENESS», часть 4: Проект, Эндгейм и AGI-реализм' },
                { year: 2024, date: '2024', title: 'Книжный клуб №6 — «A Thousand Brains», часть 1: устройство неокортекса человека' },
                { year: 2024, date: '2024', title: 'Книжный клуб №7 — «A Thousand Brains», часть 2: Машинный интеллект' },
                { year: 2024, date: '2024', title: 'Книжный клуб №8 — «A Thousand Brains», часть 3: Человеческий интеллект' },
                { year: 2024, date: '2024', title: 'Книжный клуб №9 — «AI Superpowers», глава 1: Запуск китайского «спутника»' },
                { year: 2024, date: '2024', title: 'Книжный клуб №10 — «AI Superpowers», глава 2: Подражатели в Колизее' },
                { year: 2024, date: '2024', title: 'Книжный клуб №11 — «AI Superpowers», глава 3: Альтернативная интернет-вселенная' },
                { year: 2024, date: '2024', title: 'Книжный клуб №12 — «AI Superpowers», глава 4: Повесть о двух государствах' },
                { year: 2024, date: '2024', title: 'Книжный клуб №13 — «AI Superpowers», глава 5: Четыре волны ИИ' },
                { year: 2024, date: '2024', title: 'Книжный клуб №14 — «AI Superpowers», главы 6 и 7: Кризис ИИ и переосмысление' },
                { year: 2024, date: '2024', title: 'Книжный клуб №15 — «AI Superpowers», главы 8, 9 и доп.: Мирный ИИ и человек' }
            ]
        },
        lessons: {
            label: 'Обучалки',
            icon: 'fas fa-chalkboard-user',
            items: [
                { year: 2025, date: '2025.03.24', title: 'Устанавливаем GitHub Copilot и GitHub Copilot Chat в любую VSCode-based IDE' },

                { year: 2024, date: '2024.12.24', title: 'Базовая терминология: уровень «Horizons»' },
                { year: 2024, date: '2024.12.18', title: 'Базовая терминология: уровень «Master»' },
                { year: 2024, date: '2024.12.14', title: 'Пишем поисковый MCP Server для Cline через Cline' },
                { year: 2024, date: '2024.10.13', title: 'Как запустить LLM локально' },
                { year: 2024, date: '2024.09.20', title: 'Базовая терминология: уровень «Pro»' },
                { year: 2024, date: '2024.08.25', title: 'Базовая терминология: уровень «User»' },
                { year: 2024, date: '2024.08.25', title: 'Базовая терминология: уровень «Newbie»' }
            ]
        },
        talks: {
            label: 'Доклады',
            icon: 'fas fa-person-chalkboard',
            items: [
                { year: 2024, date: '2024.10.30', title: 'Влад Янченко — новый подход к созданию веб-приложений: agentic LLM-based webapps' },
                { year: 2024, date: '2024.06.20', title: 'Евгений Сорокин — Machinet: от unit-тестов на Java до Mate. Устройство ассистентов под капотом' },
                { year: 2024, date: '2024.06.13', title: 'Влад Янченко — вероятностные попугаи, которые изменяют программирование / Mate & Machinet' }
            ]
        }
    };

    const TAB_ORDER = ['workshops', 'clubcalls', 'interviews', 'reviews', 'booksclub', 'lessons', 'talks'];

    function renderTabs(container) {
        container.innerHTML = TAB_ORDER.map((key, idx) => {
            const cat = ARCHIVE_DATA[key];
            const active = idx === 0 ? ' active' : '';
            return `<button class="archive-tab${active}" data-tab="${key}" type="button">
                <i class="${cat.icon}"></i>
                <span class="archive-tab-label">${cat.label}</span>
                <span class="archive-tab-count">${cat.items.length}</span>
            </button>`;
        }).join('');
    }

    function renderList(container, key) {
        const cat = ARCHIVE_DATA[key];
        const byYear = {};
        cat.items.forEach(item => {
            if (!byYear[item.year]) byYear[item.year] = [];
            byYear[item.year].push(item);
        });
        const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

        const html = years.map(year => {
            const itemsHtml = byYear[year].map(item => {
                const dateOnly = item.date === String(year) ? '' : `<span class="archive-item-date">${item.date}</span>`;
                return `<li class="archive-item">${dateOnly}<span class="archive-item-title">${item.title}</span></li>`;
            }).join('');
            return `<div class="archive-year-block">
                <h4 class="archive-year">▓▒░ ${year} ░▒▓</h4>
                <ul class="archive-list">${itemsHtml}</ul>
            </div>`;
        }).join('');

        container.innerHTML = html;
        container.scrollTop = 0;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const tabsEl = document.getElementById('archive-tabs');
        const listEl = document.getElementById('archive-list');
        if (!tabsEl || !listEl) return;

        renderTabs(tabsEl);
        renderList(listEl, TAB_ORDER[0]);

        tabsEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.archive-tab');
            if (!btn) return;
            const key = btn.dataset.tab;
            tabsEl.querySelectorAll('.archive-tab').forEach(b => b.classList.toggle('active', b === btn));
            renderList(listEl, key);
        });
    });
})();
