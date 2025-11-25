#!/bin/bash

echo "📊 Status do ArquivaMais"
echo "======================="
echo ""

echo "🐳 Containers:"
docker-compose ps

echo ""
echo "💾 Uso de Memória:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker-compose ps -q)

echo ""
echo "📦 Espaço em Disco:"
docker system df

echo ""
echo "🔍 Últimas 10 linhas de log:"
docker-compose logs --tail=10 app
