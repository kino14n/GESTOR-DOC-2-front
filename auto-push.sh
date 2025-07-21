
#!/bin/bash

cd "/c/Users/Usuario/Escritorio/GESTOR-DOC/frontend"

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "No estás en un repositorio Git. Abortando."
  exit 1
fi

if [[ -n $(git status --porcelain) ]]; then
  git add .
  mensaje="Auto-commit: actualización frontend $(date '+%Y-%m-%d %H:%M:%S')"
  git commit -m "$mensaje"
  git push origin main
  echo "¡Cambios detectados y enviados a GitHub!"
else
  echo "Sin cambios nuevos para subir."
fi
