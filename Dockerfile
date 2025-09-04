# Usar una imagen base oficial de Python
FROM python:3.11-slim

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar el archivo de requirements primero para aprovechar el cache de Docker
COPY requirements.txt .

# Instalar las dependencias de Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Crear un usuario no-root para ejecutar la aplicación
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app
USER app

# Exponer el puerto en el que correrá la aplicación
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]