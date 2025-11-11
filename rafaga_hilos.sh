#!/bin/bash

# Script para ejecutar index.js en paralelo respetando intervalos de ráfaga
# Uso: ./rafaga_hilos.sh [cantidad] [segundos-totales]
# Ejemplo: ./rafaga_hilos.sh 100 60  (envía 100 comentarios distribuidos en 60 segundos)
# Ejemplo: ./rafaga_hilos.sh 50 30  (envía 50 comentarios distribuidos en 30 segundos)
# Los procesos se ejecutan en paralelo pero se lanzan con el intervalo calculado

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Faltan parámetros${NC}"
    echo "Uso: $0 [cantidad] [segundos-totales]"
    echo "Ejemplo: $0 100 60  (envía 100 comentarios en 60 segundos)"
    echo "Ejemplo: $0 50 30  (envía 50 comentarios en 30 segundos)"
    exit 1
fi

CANTIDAD=$1
SEGUNDOS_TOTALES=$2

# Validar que sean números
if ! [[ "$CANTIDAD" =~ ^[0-9]+$ ]] || ! [[ "$SEGUNDOS_TOTALES" =~ ^[0-9]+$ ]]; then
    echo -e "${RED}Error: Los parámetros deben ser números${NC}"
    exit 1
fi

# Verificar que existe index.js
if [ ! -f "index.js" ]; then
    echo -e "${RED}Error: No se encuentra index.js${NC}"
    exit 1
fi

# Calcular intervalo entre ejecuciones (en segundos)
# segundos totales / cantidad de comentarios
# Usar awk para cálculo decimal (más común que bc)
INTERVALO=$(awk "BEGIN {printf \"%.3f\", $SEGUNDOS_TOTALES / $CANTIDAD}")

# Validar que INTERVALO no esté vacío
if [ -z "$INTERVALO" ] || [ "$INTERVALO" = "" ]; then
    echo -e "${RED}Error: No se pudo calcular el intervalo${NC}"
    echo -e "${YELLOW}Intentando cálculo alternativo...${NC}"
    # Cálculo alternativo usando división entera y luego decimal
    INTERVALO_ENTERO=$((SEGUNDOS_TOTALES / CANTIDAD))
    RESTO=$((SEGUNDOS_TOTALES % CANTIDAD))
    # Convertir a decimal aproximado
    if [ $RESTO -gt 0 ]; then
        INTERVALO=$(awk "BEGIN {printf \"%.3f\", $SEGUNDOS_TOTALES.0 / $CANTIDAD}")
    else
        INTERVALO=$INTERVALO_ENTERO
    fi
fi

# Si el intervalo es menor a 0.1, usar 0.1 como mínimo para no sobrecargar
MIN_INTERVALO=0.1
INTERVALO_COMPARACION=$(awk "BEGIN {if ($INTERVALO < $MIN_INTERVALO) print 1; else print 0}")
if [ "$INTERVALO_COMPARACION" = "1" ]; then
    INTERVALO=$MIN_INTERVALO
    echo -e "${YELLOW}Advertencia: Intervalo muy pequeño, usando mínimo de ${MIN_INTERVALO} segundos${NC}"
    echo -e "${YELLOW}El tiempo total será mayor a ${SEGUNDOS_TOTALES} segundos${NC}"
fi

# Validar nuevamente que INTERVALO tenga un valor válido
if [ -z "$INTERVALO" ] || [ "$INTERVALO" = "" ]; then
    echo -e "${RED}Error crítico: No se pudo establecer el intervalo${NC}"
    echo -e "${YELLOW}Usando valor por defecto de 1 segundo${NC}"
    INTERVALO=1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Ejecutando ${CANTIDAD} comentarios en PARALELO${NC}"
echo -e "${BLUE}Distribuidos en ${SEGUNDOS_TOTALES} segundos${NC}"
echo -e "${BLUE}Intervalo entre lanzamientos: ${INTERVALO} segundos${NC}"
echo -e "${YELLOW}Los procesos correrán en paralelo sin esperar respuestas${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Crear carpeta logs si no existe
mkdir -p logs

INICIO_LANZAMIENTO=$(date +%s)
CONTADOR=1
PIDS=()  # Array para guardar los PIDs de los procesos

# Bucle principal - lanzar procesos en paralelo con intervalo
while [ $CONTADOR -le $CANTIDAD ]; do
    echo -e "${YELLOW}[${CONTADOR}/${CANTIDAD}]${NC} Lanzando proceso en background..."
    echo -e "${YELLOW}Hora: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    
    # Ejecutar el script en background y guardar el PID
    node index.js > "logs/exec_${CONTADOR}.log" 2>&1 &
    PID=$!
    PIDS+=($PID)
    
    echo -e "${BLUE}Proceso ${CONTADOR} lanzado (PID: ${PID})${NC}"
    
    # Si no es la última ejecución, esperar el intervalo calculado antes de lanzar el siguiente
    if [ $CONTADOR -lt $CANTIDAD ]; then
        echo -e "${BLUE}Esperando ${INTERVALO} segundos antes del siguiente lanzamiento...${NC}"
        echo ""
        # Validar que INTERVALO sea un número antes de usar sleep
        if [[ "$INTERVALO" =~ ^[0-9]+\.?[0-9]*$ ]]; then
            sleep $INTERVALO
        else
            echo -e "${RED}Error: Intervalo inválido: ${INTERVALO}${NC}"
            echo -e "${YELLOW}Usando 1 segundo por defecto${NC}"
            sleep 1
        fi
    fi
    
    CONTADOR=$((CONTADOR + 1))
done

FIN_LANZAMIENTO=$(date +%s)
TIEMPO_LANZAMIENTO=$((FIN_LANZAMIENTO - INICIO_LANZAMIENTO))

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Todos los procesos lanzados${NC}"
echo -e "${GREEN}Total lanzados: ${CANTIDAD} procesos${NC}"
echo -e "${GREEN}Tiempo de lanzamiento: ${TIEMPO_LANZAMIENTO} segundos${NC}"
echo -e "${YELLOW}Esperando a que todos los procesos terminen...${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Esperar a que todos los procesos terminen
INICIO_ESPERA=$(date +%s)
EXITOS=0
FALLOS=0

for i in "${!PIDS[@]}"; do
    PID=${PIDS[$i]}
    NUMERO_PROCESO=$((i + 1))
    
    # Esperar a que termine este proceso
    wait $PID
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✓ Proceso ${NUMERO_PROCESO} (PID: ${PID}) completado exitosamente${NC}"
        EXITOS=$((EXITOS + 1))
    else
        echo -e "${RED}✗ Proceso ${NUMERO_PROCESO} (PID: ${PID}) falló con código: ${EXIT_CODE}${NC}"
        FALLOS=$((FALLOS + 1))
    fi
done

FIN_ESPERA=$(date +%s)
TIEMPO_TOTAL=$((FIN_ESPERA - INICIO_LANZAMIENTO))
TIEMPO_ESPERA=$((FIN_ESPERA - INICIO_ESPERA))

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Todas las ejecuciones completadas${NC}"
echo -e "${GREEN}Total: ${CANTIDAD} comentarios${NC}"
echo -e "${GREEN}Tiempo de lanzamiento: ${TIEMPO_LANZAMIENTO} segundos${NC}"
echo -e "${GREEN}Tiempo de espera de respuestas: ${TIEMPO_ESPERA} segundos${NC}"
echo -e "${GREEN}Tiempo total: ${TIEMPO_TOTAL} segundos${NC}"
echo -e "${GREEN}Tiempo objetivo de lanzamiento: ${SEGUNDOS_TOTALES} segundos${NC}"

# Calcular diferencia en el tiempo de lanzamiento
if [ $TIEMPO_LANZAMIENTO -gt $SEGUNDOS_TOTALES ]; then
    DIFERENCIA=$((TIEMPO_LANZAMIENTO - SEGUNDOS_TOTALES))
    echo -e "${YELLOW}Diferencia en lanzamiento: +${DIFERENCIA} segundos${NC}"
else
    DIFERENCIA=$((SEGUNDOS_TOTALES - TIEMPO_LANZAMIENTO))
    echo -e "${BLUE}Diferencia en lanzamiento: -${DIFERENCIA} segundos${NC}"
fi

echo -e "${GREEN}Exitosos: ${EXITOS}${NC}"
if [ $FALLOS -gt 0 ]; then
    echo -e "${RED}Fallidos: ${FALLOS}${NC}"
fi
echo -e "${GREEN}========================================${NC}" 