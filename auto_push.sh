#!/bin/bash

# Ruta a tu carpeta local del proyecto (ajustar según tu caso)
PROYECTO_PATH="/c/Users/Usuario/Desktop/pdf-extractor NEW"

cd "$PROYECTO_PATH" || { echo "ERROR: Carpeta no encontrada: $PROYECTO_PATH"; exit 1; }

echo "🔍 Revisando cambios en $PROYECTO_PATH..."

# Añade todos los cambios (nuevos, modificados, borrados)
git add .

# Verifica si hay algo para commitear
if git diff --cached --quiet; then
    echo "⚠️ No hay cambios para commitear. No se hará push."
else
    echo "📝 Cambios detectados. Escribí mensaje de commit o dejá vacío para mensaje por defecto:"
    read -r MENSAJE

    if [ -z "$MENSAJE" ]; then
        MENSAJE="Commit automático: cambios detectados"
    fi

    git commit -m "$MENSAJE"
    echo "⬆️ Haciendo push a origin main..."
    git push origin main
fi

echo "✅ Proceso finalizado."
