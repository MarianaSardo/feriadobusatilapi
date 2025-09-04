# Guía de Deployment con Docker en AWS EC2

## Preparación en tu máquina local

### 1. Crear archivo .env
```bash
cp .env.example .env
```

Edita el archivo `.env` y configura tu API_KEY:
```
API_KEY=tu_api_key_super_secreta_aqui
```

### 2. Probar localmente (opcional)
```bash
docker-compose up --build
```

## Deployment en AWS EC2

### 1. Conectarse a la instancia EC2
```bash
ssh -i "app.pem" ec2-user@ec2-50-18-187-142.us-west-1.compute.amazonaws.com
```

### 2. Instalar Docker y Docker Compose
```bash
# Actualizar el sistema
sudo yum update -y

# Instalar Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar la sesión para aplicar los cambios de grupo
exit
```

### 3. Reconectarse y verificar instalación
```bash
ssh -i "app.pem" ec2-user@ec2-50-18-187-142.us-west-1.compute.amazonaws.com
docker --version
docker-compose --version
```

### 4. Subir el código a la instancia

#### Opción A: Usando git (recomendado)
```bash
# Si tienes el código en un repositorio
git clone https://github.com/tu-usuario/FeriadoBursatilApi.git
cd FeriadoBursatilApi
```

#### Opción B: Usando scp desde tu máquina local
```bash
# Desde tu máquina local (PowerShell)
scp -i "app.pem" -r c:\Users\kiuti\Documents\Python\FeriadoBursatilApi ec2-user@ec2-50-18-187-142.us-west-1.compute.amazonaws.com:~/
```

### 5. Configurar variables de entorno
```bash
cd ~/FeriadoBursatilApi  # o ~/feriadobusatilapi si ya existía
cp .env.example .env
nano .env  # Editar y configurar API_KEY
```

### 6. Construir y ejecutar con Docker
```bash
# Construir y ejecutar en segundo plano
docker-compose up -d --build

# Verificar que esté corriendo
docker-compose ps

# Ver logs
docker-compose logs -f
```

### 7. Configurar Security Group en AWS

En la consola de AWS:
1. Ve a EC2 → Security Groups
2. Selecciona el security group de tu instancia
3. Agrega regla de entrada:
   - Type: Custom TCP
   - Port: 8000
   - Source: 0.0.0.0/0 (o tu IP específica)

### 8. Probar la API
```bash
# Desde la instancia EC2
curl http://localhost:8000/

# Desde internet
curl http://ec2-50-18-187-142.us-west-1.compute.amazonaws.com:8000/
```

## Comandos útiles para gestión

```bash
# Ver estado de los contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar la aplicación
docker-compose restart

# Detener la aplicación
docker-compose down

# Actualizar la aplicación (después de cambios en el código)
docker-compose down
docker-compose up -d --build

# Ver uso de recursos
docker stats

# Limpiar imágenes no utilizadas
docker system prune -f
```

## Ventajas de usar Docker

✅ **Consistencia**: El mismo entorno en desarrollo y producción
✅ **Aislamiento**: La aplicación corre en su propio contenedor
✅ **Fácil deployment**: Un solo comando para desplegar
✅ **Escalabilidad**: Fácil de escalar horizontalmente
✅ **Rollback**: Fácil volver a versiones anteriores
✅ **Portabilidad**: Funciona en cualquier sistema que tenga Docker

## Backup automático (opcional)

Para hacer backup del archivo feriados.json:

```bash
# Crear script de backup
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker cp feriado-bursatil-api:/app/feriados.json ./backups/feriados_$DATE.json
EOF

chmod +x backup.sh
mkdir -p backups

# Ejecutar backup
./backup.sh

# Programar backup diario con cron
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ec2-user/FeriadoBursatilApi/backup.sh") | crontab -
```