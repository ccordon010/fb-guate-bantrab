#!/bin/bash

# Script para ejecutar index.js múltiples veces con intervalo
# Uso: ./run-multiple.sh [cantidad] [segundos]
# Ejemplo: ./run-multiple.sh 10 30  (ejecuta 10 veces con 30 segundos entre cada una)

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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
echo -e "${GREEN}Intervalo: ${SEGUNDOS} segundos${NC}"
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
    
    # Si no es la última ejecución, esperar
    if [ $CONTADOR -lt $CANTIDAD ]; then
        echo ""
        echo -e "${YELLOW}Esperando ${SEGUNDOS} segundos antes de la siguiente ejecución...${NC}"
        echo ""
        sleep $SEGUNDOS
    fi
    
    CONTADOR=$((CONTADOR + 1))
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Todas las ejecuciones completadas${NC}"
echo -e "${GREEN}Total: ${CANTIDAD} ejecuciones${NC}"
echo -e "${GREEN}========================================${NC}"