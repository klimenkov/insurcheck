#!/usr/bin/env node

/**
 * CLI Tool to import InsurCheck product backlog into Linear via GraphQL API.
 * Usage:
 *   node scripts/importLinear.js <LINEAR_API_KEY>
 *   or:
 *   LINEAR_API_KEY=lin_api_... node scripts/importLinear.js
 */

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const TASKS = [
  {
    title: 'Автоматическая фильтрация и отсечение аномалий ($10 / $9999)',
    description: `## Context
Внедрить строгую валидацию входных премий на фронтенде и бэкенде, чтобы исключить попадание спама и шуток ($10 или $9999) в расчеты актуарных средних.

## Acceptance Criteria
- [ ] Ограничить допустимый диапазон ежемесячной премии: $50 – $1,200/мес.
- [ ] Выводить информативное предупреждение при вводе нереалистичных значений.
- [ ] Подозрительные сабмиты помечать статусом flagged_for_review.`,
    priority: 1, // Urgent
    status: 'Todo'
  },
  {
    title: 'Защищенная панель модератора /admin',
    description: `## Context
Интерфейс для просмотра всех сабмитов водителей (submissions), отзывов (reviews) и контактных сообщений (contact_messages).

## Acceptance Criteria
- [ ] Доступ по защищенному PIN/паролю администратора.
- [ ] Таблица сабмитов с пагинацией и поиском по городу/страховщику.
- [ ] Кнопки: Одобрить, Скрыть, Удалить.
- [ ] Возможность быстро исправить опечатки в названии страховщика или тексте отзыва.`,
    priority: 2, // High
    status: 'Todo'
  },
  {
    title: 'Fuzzy Matching и авто-нормализация названий страховых компаний',
    description: `## Context
Пользователи при ручном вводе пишут названия страховых с ошибками ('td', 'meloche', 'belair', 'белэйр'). Нужно нормализовать их к 15 каноническим страховщикам.

## Acceptance Criteria
- [ ] Словарь синонимов и нечеткий поиск (Fuzzy Match).
- [ ] Авто-привязка к ID канонического страховщика.
- [ ] Неопознанные варианты сохранять как Other с оригинальным текстом для модерации.`,
    priority: 2, // High
    status: 'Todo'
  },
  {
    title: 'Подключение кастомного домена (insurcheck.ca / insurcheck.com)',
    description: `## Context
Запустить проект на собственном канадском домене для повышения доверия водителей (onrender.com снижает конверсию сабмитов).

## Acceptance Criteria
- [ ] Зарегистрировать домен insurcheck.ca / .com.
- [ ] Настроить DNS в Cloudflare и привязать к Render Web Service.
- [ ] Проверить работу бесплатного SSL и авторедиректа с HTTP на HTTPS.`,
    priority: 1, // Urgent
    status: 'Todo'
  },
  {
    title: 'OpenGraph мета-теги и превью для соцсетей',
    description: `## Context
Настроить привлекательные превью при шеринге ссылки в Telegram, WhatsApp, Reddit и LinkedIn.

## Acceptance Criteria
- [ ] Добавить мета-теги og:title, og:description, og:image в index.html.
- [ ] Создать превью-баннер с логотипом InsurCheck и бенчмарком Онтарио.`,
    priority: 3, // Medium
    status: 'Todo'
  },
  {
    title: 'Актуарная когортная сегментация (Smart Match Engine)',
    description: `## Context
По мере накопления 300–500+ записей краудсорсинга вычислять, какие страховщики исторически дают лучшие ставки для конкретных групп водителей.

## Acceptance Criteria
- [ ] Когорты: Молодой G2 / Прайм-семья / High-theft SUV / Safe Rural.
- [ ] Расчет медианной ставки и индекса Value for Money для каждого сегмента.`,
    priority: 2, // High
    status: 'Backlog'
  },
  {
    title: 'Персонализированный блок рекомендаций в ResultCard',
    description: `## Context
После прохождения Sanity Check показывать рекомендацию самого выгодного и надежного страховщика под профиль пользователя.

## Acceptance Criteria
- [ ] Динамическая карточка: 'Для водителей вашего возраста в Ottawa лучшим соотношением цена/качество обладает Desjardins (~$172/mo).'
- [ ] Прямая ссылка на отзывы и официальный сайт страховщика.`,
    priority: 3, // Medium
    status: 'Backlog'
  },
  {
    title: 'Расширение Playwright-парсера на Sonnet и Belairdirect',
    description: `## Context
Сейчас автоматический сбор котировок настроен для Square One. Нужно собирать публичные котировки с сайтов Sonnet и Belairdirect.

## Acceptance Criteria
- [ ] Headless Playwright сценарии для Sonnet и Belairdirect.
- [ ] Сохранение котировок в таблицу scraped_quotes с датой и persona_id.
- [ ] Ежемесячный запуск по расписанию для отслеживания инфляции.`,
    priority: 3, // Medium
    status: 'Backlog'
  },
  {
    title: 'Интеграция ежеквартальных отчетов FSRA Rate Approvals',
    description: `## Context
Использовать официальные ежеквартальные отчеты регулятора FSRA по одобренным изменениям тарифов для калибровки актуарной модели.

## Acceptance Criteria
- [ ] Таблица индексаций (FSRA approved % rate changes) по топ-15 страховщикам.
- [ ] Отображение бейджа динамики цен регулятора в профиле страховой.`,
    priority: 3, // Medium
    status: 'Backlog'
  },
  {
    title: 'Интеграция легковесной веб-аналитики (PostHog / Umami)',
    description: `## Context
Подключить анонимную аналитику воронки без тяжелых куки.

## Acceptance Criteria
- [ ] Трекинг шагов: Открытие чекера -> Расчет -> Шеринг ставки -> Переход к брокеру.
- [ ] Дашборд конверсий для оценки вовлеченности водителей.`,
    priority: 4, // Low
    status: 'Backlog'
  }
];

async function runGraphQL(apiKey, query, variables = {}) {
  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey
    },
    body: JSON.stringify({ query, variables })
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

async function main() {
  console.log('\n======================================================');
  console.log('🚀 InsurCheck → Linear CLI Backlog Importer');
  console.log('======================================================\n');

  let apiKey = process.argv[2] || process.env.LINEAR_API_KEY;

  if (!apiKey) {
    const rl = readline.createInterface({ input, output });
    apiKey = await rl.question('🔑 Введите ваш Linear API Key (получить в linear.app/settings/api):\n> ');
    rl.close();
    apiKey = apiKey.trim();
  }

  if (!apiKey) {
    console.error('❌ Ошибка: API Key не указан.');
    process.exitCode = 1;
    return;
  }

  console.log('\n📡 Подключение к Linear API...');

  let data;
  try {
    data = await runGraphQL(
      apiKey,
      `query {
        viewer {
          id
          name
          email
        }
        teams {
          nodes {
            id
            name
            key
            states {
              nodes {
                id
                name
                type
              }
            }
          }
        }
      }`
    );
  } catch (err) {
    console.error(`❌ Ошибка авторизации: ${err.message}`);
    console.log('\n💡 Совет: Проверьте API Key в https://linear.app/settings/api (Personal API Keys).');
    process.exitCode = 1;
    return;
  }

  const user = data.viewer;
  const teams = data.teams.nodes;

  if (!teams || teams.length === 0) {
    console.error('❌ Ошибка: В вашем аккаунте Linear не найдено ни одной команды. Создайте команду в Linear и повторите.');
    process.exitCode = 1;
    return;
  }

  // Pick team (prefer InsurCheck, or first team)
  const team = teams.find(t => t.name.toLowerCase().includes('insur') || t.key === 'INS') || teams[0];

  console.log(`✅ Авторизован как: ${user.name || user.email}`);
  console.log(`🎯 Целевая команда: "${team.name}" [${team.key}]\n`);

  // Find states
  const states = team.states.nodes;
  const todoState = states.find(s => s.type === 'unstarted' || s.name.toLowerCase() === 'todo') || states[0];
  const backlogState = states.find(s => s.type === 'backlog' || s.name.toLowerCase() === 'backlog') || states[0];

  console.log(`📦 Загрузка ${TASKS.length} задач в Linear...\n`);

  let createdCount = 0;

  for (const task of TASKS) {
    const targetState = task.status === 'Backlog' ? backlogState : todoState;

    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            url
          }
        }
      }
    `;

    try {
      const res = await runGraphQL(apiKey, mutation, {
        input: {
          teamId: team.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          stateId: targetState.id
        }
      });

      if (res.issueCreate?.success) {
        const issue = res.issueCreate.issue;
        const priorityIcon = task.priority === 1 ? '🔴 [Urgent]' : task.priority === 2 ? '🟠 [High]' : '🟡 [Medium]';
        console.log(`✔ [${issue.identifier}] ${priorityIcon} ${issue.title}`);
        createdCount++;
      }
    } catch (err) {
      console.error(`✖ Ошибка при создании "${task.title}": ${err.message}`);
    }
  }

  console.log('\n======================================================');
  console.log(`🎉 Успешно создано задач: ${createdCount} из ${TASKS.length}!`);
  console.log(`🔗 Откройте доску Linear: https://linear.app`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Непредвиденная ошибка:', err);
  process.exit(1);
});
