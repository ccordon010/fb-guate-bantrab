#!/bin/bash

# Script para ejecutar index.js múltiples veces con intervalo
# Uso: ./run_delay.sh [cantidad] [segundos]
# Ejemplo: ./run_delay.sh 10 30  (ejecuta 10 veces con 30 segundos + delay aleatorio entre cada una)

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar parámetros
if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Faltan parámetros${NC}"
    echo "Uso: $0 [cantidad] [segundos]"
    echo "Ejemplo: $0 10 30"
    exit 1
fi

CANTIDAD=$1
SEGUNDOS=$2

# Validar que sean números
if ! [[ "$CANTIDAD" =~ ^[0-9]+$ ]] || ! [[ "$SEGUNDOS" =~ ^[0-9]+$ ]]; then
    echo -e "${RED}Error: Los parámetros deben ser números${NC}"
    exit 1
fi

# Verificar que existe index.js
if [ ! -f "index.js" ]; then
    echo -e "${RED}Error: No se encuentra index.js${NC}"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Ejecutando script ${CANTIDAD} veces${NC}"
echo -e "${GREEN}Intervalo base: ${SEGUNDOS} segundos${NC}"
echo -e "${BLUE}Delay aleatorio: 1-5 segundos (se suma al intervalo)${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Contador
CONTADOR=1

# Bucle principal
while [ $CONTADOR -le $CANTIDAD ]; do
    echo -e "${YELLOW}[${CONTADOR}/${CANTIDAD}]${NC} Ejecutando script..."
    echo -e "${YELLOW}Hora: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""
    
    # Ejecutar el script
    node index.js
    
    # Verificar si hubo error
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ]; then
        echo -e "${RED}Error en la ejecución ${CONTADOR}. Código de salida: ${EXIT_CODE}${NC}"
    else
        echo -e "${GREEN}✓ Ejecución ${CONTADOR} completada${NC}"
    fi
    
    # Si no es la última ejecución, esperar con delay aleatorio
    if [ $CONTADOR -lt $CANTIDAD ]; then
        # Generar delay aleatorio entre 1 y 5 segundos
        DELAY_RANDOM=$((RANDOM % 5 + 1))
        # Calcular tiempo total de espera
        TIEMPO_TOTAL=$((SEGUNDOS + DELAY_RANDOM))
        
        echo ""
        echo -e "${BLUE}Delay aleatorio generado: ${DELAY_RANDOM} segundos${NC}"
        echo -e "${YELLOW}Esperando ${TIEMPO_TOTAL} segundos (${SEGUNDOS} base + ${DELAY_RANDOM} aleatorio) antes de la siguiente ejecución...${NC}"
        echo ""
        
        sleep $TIEMPO_TOTAL
    fi
    
    CONTADOR=$((CONTADOR + 1))
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Todas las ejecuciones completadas${NC}"
echo -e "${GREEN}Total: ${CANTIDAD} ejecuciones${NC}"
echo -e "${GREEN}========================================${NC}"