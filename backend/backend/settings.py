INSTALLED_APPS = [
    # ...
    'corsheaders',
    'rest_framework',
    'users',
]
DEBUG = True  # para desarrollo
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

# DRF + JWT
from datetime import timedelta
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# CORS: permite tu Vite dev server
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

# Base de datos: nos quedamos con SQLite por ahora (viene por defecto)
# ... lo que ya trae Django está ok
