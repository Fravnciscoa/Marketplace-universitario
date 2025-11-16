# Usa Node.js 22 (versión LTS compatible con Angular)
FROM node:22-alpine

# Instala Ionic CLI globalmente
RUN npm install -g @ionic/cli

# Establece el directorio de trabajo
WORKDIR /app

# Copia archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm ci

# Copia todo el código del frontend
COPY . .

# Expone el puerto 8100 (Ionic)
EXPOSE 8100

# Comando para iniciar Ionic en modo desarrollo
CMD ["ionic", "serve", "--host=0.0.0.0", "--port=8100", "--external"]
