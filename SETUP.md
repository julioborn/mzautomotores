# Configuración de Variables de Entorno

Para que el sistema funcione correctamente, necesitas configurar estas variables de entorno:

## 1. MONGODB_URI
- Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
- Crea un cluster gratuito si no tienes uno
- Ve a "Database Access" y crea un usuario
- Ve a "Network Access" y permite tu IP
- En "Clusters", haz clic en "Connect" → "Connect your application"
- Copia el string de conexión y reemplaza `<password>` con tu contraseña

## 2. JWT_SECRET
- Genera una clave secreta fuerte
- Puedes usar: `openssl rand -base64 32` en terminal
- O cualquier string aleatorio de al menos 32 caracteres

## 3. Ejecutar el script
Una vez configuradas las variables, ejecuta el script para crear el usuario admin:
- Username: admin
- Password: admin123

¡Después de esto tu sistema estará listo para usar!
