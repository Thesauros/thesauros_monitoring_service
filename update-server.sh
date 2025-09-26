#!/bin/bash

# Скрипт для обновления файлов на сервере
# Использование: ./update-server.sh [server-ip] [username]

set -e

SERVER_IP=${1:-"46.62.166.163"}
USERNAME=${2:-"root"}
PROJECT_PATH="/root/thesauros_monitoring_service"  # Измените на актуальный путь

echo "🚀 Обновление Thesauros Monitoring Service на сервере $SERVER_IP"
echo "👤 Пользователь: $USERNAME"
echo "📁 Путь: $PROJECT_PATH"
echo ""

# Проверяем что файлы существуют
required_files=(
    "server.js"
    "simple-dashboard.html"
    "utils/logger.js"
    "deployments/arbitrumOne/deployed-vaults.json"
)

echo "🔍 Проверка файлов..."
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Файл не найден: $file"
        exit 1
    else
        echo "✅ $file"
    fi
done

echo ""
echo "📤 Копирование файлов на сервер..."

# Создаем директорию utils на сервере
ssh $USERNAME@$SERVER_IP "mkdir -p $PROJECT_PATH/utils"

# Копируем основные файлы
echo "📄 Копирование server.js..."
scp server.js $USERNAME@$SERVER_IP:$PROJECT_PATH/

echo "📄 Копирование simple-dashboard.html..."
scp simple-dashboard.html $USERNAME@$SERVER_IP:$PROJECT_PATH/

echo "📄 Копирование utils/logger.js..."
scp utils/logger.js $USERNAME@$SERVER_IP:$PROJECT_PATH/utils/

echo "📄 Копирование deployed-vaults.json..."
scp deployments/arbitrumOne/deployed-vaults.json $USERNAME@$SERVER_IP:$PROJECT_PATH/deployments/arbitrumOne/

echo ""
echo "🔄 Перезапуск сервиса на сервере..."

# Останавливаем и перезапускаем сервис
ssh $USERNAME@$SERVER_IP "cd $PROJECT_PATH && pm2 restart thesauros-monitoring"

echo ""
echo "⏳ Ожидание запуска сервиса..."
sleep 5

echo ""
echo "🔍 Проверка статуса сервиса..."
ssh $USERNAME@$SERVER_IP "pm2 status thesauros-monitoring"

echo ""
echo "🧪 Тестирование API endpoints..."

# Проверяем health endpoint
echo "📊 Health check:"
curl -s https://monitoring.thesauros.tech/api/health | head -1

echo ""
echo "📊 Keepers endpoint:"
keepers_response=$(curl -s https://monitoring.thesauros.tech/api/keepers)
if echo "$keepers_response" | grep -q "keepers"; then
    echo "✅ Keepers API работает!"
else
    echo "❌ Keepers API не работает. Ответ:"
    echo "$keepers_response" | head -3
fi

echo ""
echo "📊 Alerts endpoint:"
alerts_response=$(curl -s https://monitoring.thesauros.tech/api/alerts)
if echo "$alerts_response" | grep -q "total"; then
    echo "✅ Alerts API работает!"
else
    echo "❌ Alerts API не работает. Ответ:"
    echo "$alerts_response" | head -3
fi

echo ""
echo "🎯 Проверка dashboard..."
dashboard_response=$(curl -s https://monitoring.thesauros.tech/ | grep -o "Chainlink Keepers" || echo "Not found")
if [ "$dashboard_response" = "Chainlink Keepers" ]; then
    echo "✅ Вкладка 'Chainlink Keepers' найдена в dashboard!"
else
    echo "❌ Вкладка 'Chainlink Keepers' не найдена в dashboard"
fi

echo ""
echo "📋 Следующие шаги:"
echo "1. Откройте https://monitoring.thesauros.tech/"
echo "2. Проверьте что появилась вкладка 'Chainlink Keepers'"
echo "3. Убедитесь что данные загружаются без ошибок"
echo "4. Настройте CHAINLINK_API_KEY в .env файле на сервере"

echo ""
echo "🔧 Для настройки API ключа выполните на сервере:"
echo "ssh $USERNAME@$SERVER_IP"
echo "cd $PROJECT_PATH"
echo "nano .env"
echo "# Добавьте: CHAINLINK_API_KEY=your_actual_api_key_here"
echo "pm2 restart thesauros-monitoring"

echo ""
echo "✅ Обновление завершено!"
