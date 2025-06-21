# 💰 WealFlow - Full-Stack Personal Finance Management

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=for-the-badge&logo=go)](https://golang.org/)
[![Fiber](https://img.shields.io/badge/Fiber-v2-00d9ff?style=for-the-badge&logo=fiber)](https://gofiber.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

> Современное Full-Stack приложение для управления личными финансами с REST API на Go, клиентской частью на React, поддержкой JWT аутентификации и OAuth интеграции.

## 🚀 Особенности

- ✅ **Full-Stack Решение**: Бэкенд на Go (Fiber) и фронтенд на React (TypeScript, Vite).
- ✅ **JWT Authentication**: Безопасная аутентификация с access/refresh токенами.
- ✅ **OAuth Integration**: Вход через Google (Auth0) с обработкой на клиенте и бэкенде.
- ✅ **Rich Client UI**: Интуитивно понятный интерфейс для управления финансами, просмотра статистики и настроек.
- ✅ **Transaction Management**: Полное CRUD управление финансовыми транзакциями.
- ✅ **Data Visualization**: Графики и диаграммы для анализа финансов на клиенте.
- ✅ **User Security**: Хеширование паролей, защищенные HTTP-only куки.
- ✅ **MongoDB Integration**: Оптимизированная работа с базой данных на бэкенде.
- ✅ **CORS Support**: Готовность к интеграции фронтенда и бэкенда.
- ✅ **Docker Ready**: Простое развертывание всего приложения или его частей в контейнерах.
- ✅ **API Documentation**: Автоматическая документация для REST API (Swagger).

## 📋 Требования

### Бэкенд (API):
- Go 1.21 или выше
- MongoDB 4.4+
- Auth0 аккаунт (для OAuth)

### Фронтенд (Клиент):
- Node.js (рекомендуется LTS версия)
- npm или yarn

## 🛠 Установка

### 1. Бэкенд (WealFlow API)

#### Клонирование репозитория (если еще не сделано)
Предполагается, что у вас есть основная директория проекта, где бэкенд и фронтенд могут находиться рядом (например, `WealFlow/backend` и `WealFlow/frontend`).
```bash
git clone https://github.com/IIkar/WealFlow.git
cd WealFlow/2025 # Или ваша директория с бэкендом
```

#### Установка зависимостей бэкенда
```bash
go mod tidy
```

#### Настройка переменных окружения бэкенда
Создайте файл `.env` в корневой директории бэкенда:
```env
# База данных
MONGODB_URI=mongodb://localhost:27017/

# JWT секреты (замените на собственные!)
ACCESS_SECRET=your_super_secret_access_key_here
REFRESH_SECRET=your_super_secret_refresh_key_here

# Время жизни токенов
ACCESS_EXPIRE_MINUTES=15
REFRESH_EXPIRE_HOURS=168

# OAuth настройки (для валидации токенов от Auth0)
AUTH0_DOMAIN=your-auth0-domain.auth0.com # Например, dev-llda056dyv6gzdab.us.auth0.com

# Настройки приложения
ENV=development
PORT=5000 # Порт, на котором будет работать API
FRONTEND_ORIGIN=http://localhost:5173 # URL вашего фронтенд-приложения
COOKIE_DOMAIN=localhost
```

### 2. Фронтенд (wealflow-app)

Предполагается, что код фронтенда находится в директории `wealflow-app` (или аналогичной).

#### Переход в директорию фронтенда
```bash
# Из корневой директории проекта
cd path/to/your/frontend/wealflow-app
```

#### Установка зависимостей фронтенда
```bash
npm install
# или
yarn install
```

#### Настройка переменных окружения фронтенда
Создайте файл `.env` (или `.env.local`) в корневой директории фронтенда (`wealflow-app`):
```env
VITE_API_URL=http://localhost:5000 # URL вашего бэкенд API

# Auth0 настройки для клиента
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com # Тот же, что и в AUTH0_DOMAIN бэкенда
VITE_AUTH0_CLIENT_ID=your_auth0_client_id # Client ID из настроек Auth0 приложения
VITE_AUTH0_REDIRECT_URI=http://localhost:5173/home # URI для редиректа после логина
VITE_AUTH0_AUDIENCE= # Если используется API Authorization в Auth0
```

### Запуск приложения

#### Запуск бэкенда (API)
```bash
# В директории бэкенда
ENV=development go run main.go
```
Бэкенд API будет доступен по адресу: `http://localhost:5000`

#### Запуск фронтенда (Клиент)
```bash
# В директории фронтенда (wealflow-app)
npm run dev
# или
yarn dev
```
Клиентское приложение будет доступно по адресу: `http://localhost:5173` (или другой порт, указанный Vite).

## 🐳 Docker

### Docker для бэкенда (API)
(Для информации о совместном Docker-развертывании см. полную документацию `wealflow_docs.md`)

#### Сборка и запуск бэкенда с Docker
```bash
# В директории бэкенда
# Сборка образа
docker build -t wealflow-api .

# Запуск контейнера (требуется запущенный MongoDB)
docker run -p 5000:5000 --env-file .env wealflow-api
```

### Docker Compose для бэкенда и MongoDB
(Пример из вашего оригинального README, актуален для API и БД)
```yaml
version: '3.8'
services:
  app: # Бэкенд API
    build: ./path/to/your/backend # Укажите путь к директории бэкенда
    ports:
      - "5000:5000"
    env_file:
      - ./path/to/your/backend/.env # Укажите путь к .env файлу бэкенда
    depends_on:
      - mongodb
  
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```
*Для развертывания фронтенда через Docker, его нужно собрать в статические файлы и раздавать через веб-сервер (например, Nginx) или интегрировать раздачу статики в Go-приложение.*

## 📚 API Документация

REST API предоставляет эндпоинты для аутентификации и управления транзакциями. Клиентское приложение взаимодействует с этим API.

### Аутентификация

#### Регистрация
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Иван Иванов",
  "email": "ivan@example.com", 
  "password": "securePassword123"
}
```

#### Вход```http
POST /api/auth/login
Content-Type: application/json

{
"email": "ivan@example.com",
"password": "securePassword123"
}
```

#### OAuth (Google)
Клиент инициирует OAuth поток с Auth0. После успешной аутентификации Auth0 возвращает токен клиенту, который затем отправляется на этот эндпоинт бэкенда для верификации и создания сессии.
```http
POST /api/auth/google
Content-Type: application/json

{
  "token": "auth0_id_token_here"
}
```

### Транзакции

Все эндпоинты транзакций требуют аутентификации (JWT токен в HTTP-only куки).

#### Получить все транзакции
```http
GET /api/transactions
```

#### Создать транзакцию
```http
POST /api/transactions
Content-Type: application/json

{
  "description": "Покупка продуктов",
  "category": "Еда",
  "amount": 1500.50,
  "type": false, // false - расход, true - доход
  "date": "2025-06-20T10:30:00Z" // Формат ISO 8601
}
```

#### Обновить транзакцию
```http
PATCH /api/transactions/:id_транзакции
Content-Type: application/json

{
  "description": "Обновленное описание",
  "amount": 2000.00
}
```

#### Удалить транзакцию
```http
DELETE /api/transactions/:id_транзакции
```

## 🏗 Архитектура проекта

### Бэкенд (API - Go)
```
WealFlow/backend/ (примерная структура)
├── main.go                     # Точка входа приложения
├── auth/                       # Модуль аутентификации
│   ├── authController.go       # Контроллеры auth
│   └── googleAuth0.go          # OAuth интеграция
├── database/                   # Слой базы данных
│   └── database.go             # MongoDB подключение
├── middleware/                 # Middleware компоненты
│   ├── jwtMiddleware.go        # JWT обработка
│   └── tokenService.go         # Утилиты токенов
├── models/                     # Модели данных
│   └── models.go               # User & Transaction модели
├── transactions/               # Модуль транзакций
│   └── transactionController.go# CRUD операции
├── go.mod                      # Go модули
└── go.sum                      # Зависимости
```

### Фронтенд (Клиент - React)
```
WealFlow/frontend/ (wealflow-app - примерная структура)
├── src/
│   ├── components/             # UI компоненты (auth, common, dashboard, etc.)
│   ├── context/                # React Context (AuthContext, ThemeContext)
│   ├── layouts/                # Основные макеты страниц
│   ├── pages/                  # Компоненты страниц
│   ├── App.tsx                 # Корневой компонент с маршрутизацией
│   ├── main.tsx                # Точка входа React
│   └── types.ts                # TypeScript типы
├── vite.config.ts              # Конфигурация Vite
├── tailwind.config.js          # Конфигурация Tailwind CSS
└── package.json                # Зависимости фронтенда
```

## 🔒 Безопасность

- **Хеширование паролей**: Использование bcrypt на бэкенде.
- **JWT токены**: Короткоживущие access токены + долгоживущие refresh токены, хранятся в HTTP-only куках.
- **OAuth 2.0 (Auth0)**: Безопасный вход через Google, управляемый Auth0 на клиенте и верифицируемый на бэкенде.
- **HTTP-only куки**: Защита от XSS атак.
- **CORS настройки**: Контроль доступа с фронтенд доменов на бэкенде.
- **Валидация данных**: Проверка входящих данных на бэкенде и на клиенте.
- **Проверка владения**: Пользователи могут управлять только своими транзакциями (логика на бэкенде).
- **Защищенные маршруты**: На клиенте используются `ProtectedRoute` для ограничения доступа.

## 🧪 Тестирование

### Ручное тестирование API с curl
(Примеры для регистрации и создания транзакции остаются актуальными, как в вашем оригинальном README)

#### Регистрация пользователя
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

#### Создание транзакции (после логина и получения куки с токеном)
```bash
# Сначала выполните логин, чтобы получить куки с токенами.
# Затем, используя эти куки:
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  --cookie "access_token=YOUR_ACCESS_TOKEN_VALUE_IF_NEEDED_MANUALLY; refresh_token=YOUR_REFRESH_TOKEN_VALUE_IF_NEEDED_MANUALLY" \
  -d '{"description":"Test transaction","category":"Test","amount":100.50,"type":true, "date":"2025-06-21T12:00:00Z"}'
```
*Примечание: При использовании HTTP-only кук, `curl` может потребовать указания файла с куками (`-b cookies.txt`) или ручной передачи заголовка `Cookie`, если вы тестируете без браузера.*

### Отладочные эндпоинты API (только для разработки)
- `GET /dev/access` - Проверка access токена
- `GET /dev/refresh` - Проверка refresh токена

### Тестирование фронтенда
- Фронтенд может быть протестирован с использованием стандартных инструментов для React, таких как Jest, React Testing Library. (Конкретные тесты не предоставлены в исходном коде).

## 🚀 Развертывание

### Бэкенд (API)
1. **Установите переменную окружения**: `ENV=production`
2. **Настройте SSL**: Используйте reverse proxy (nginx, traefik).
3. **Безопасные куки**: Флаги `Secure` и `SameSite` автоматически настраиваются для production.
4. **Мониторинг**: Настройте логирование и метрики.

### Фронтенд (Клиент)
1.  Соберите приложение для production:
    ```bash
    # В директории фронтенда
    npm run build
    ```
2.  Разместите статические файлы из директории `dist` (или аналогичной) на хостинге статических сайтов (Netlify, Vercel, AWS S3+CloudFront, GitHub Pages) или настройте ваш reverse proxy (Nginx) для их раздачи.

### Рекомендуемый production stack
- **Reverse Proxy**: Nginx или Traefik (для API и раздачи статики фронтенда).
- **SSL**: Let's Encrypt или Cloudflare.
- **База данных**: MongoDB Atlas или самостоятельный кластер.
- **Хостинг фронтенда**: CDN (Cloudflare Pages, Netlify, Vercel) или Nginx.
- **Мониторинг**: Prometheus + Grafana для бэкенда; Sentry или аналоги для фронтенда и бэкенда.
- **Логирование**: ELK Stack или облачные сервисы логирования.

## 📊 Мониторинг

### Бэкенд
Приложение логирует важные события:
- Подключения к базе данных
- Ошибки аутентификации
- CRUD операции с транзакциями
- Ошибки валидации

### Фронтенд
- Используйте инструменты разработчика в браузере для отладки.
- Для production рекомендуется интеграция с сервисами мониторинга ошибок, такими как Sentry.

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Changelog

### v1.1.0 (Планируется/Гипотетически)
- ✨ **Добавлена клиентская часть на React + TypeScript**
- ✨ Пользовательский интерфейс для всех основных функций
- ✨ Визуализация данных на дашборде и странице статистики
- ✨ Улучшена интеграция OAuth с Auth0 на клиенте

### v1.0.0 (2025-06-20)
- ✅ Базовая аутентификация JWT (Бэкенд)
- ✅ OAuth интеграция с Google/Auth0 (Бэкенд)
- ✅ CRUD операции для транзакций (Бэкенд)
- ✅ MongoDB интеграция с индексами (Бэкенд)
- ✅ CORS поддержка (Бэкенд)
- ✅ Docker конфигурация (Бэкенд)

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл `LICENSE` для деталей.

## 👨‍💻 Автор

**Карачебан Дмитрий**
- Email: your-email@example.com
- GitHub: [@IIkar](https://github.com/IIkar)

## 🆘 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [Issues](https://github.com/IIkar/WealFlow/issues)
2. Создайте новый Issue с подробным описанием
3. Опишите шаги для воспроизведения проблемы
4. Укажите версии Go, Node.js и операционную систему

---

⭐ **Если проект оказался полезным, поставьте звездочку!**