from pathlib import Path
from datetime import timedelta
import os
from decouple import config
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# FIX: no insecure default — will raise ImproperlyConfigured if not set in env
SECRET_KEY = config("SECRET_KEY")

# FIX: default False — never expose stack traces on Render if env var is missing
DEBUG = config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "kenyaprimeback.onrender.com",
]

# Add from env if provided
_allowed_host = config("ALLOWED_HOST", default="").strip()
if _allowed_host:
    ALLOWED_HOSTS.append(_allowed_host)

# ─── CORS ─────────────────────────────────────────────────────────────────────

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://kenyaprime.vercel.app",
]

# Add from env if provided
_frontend_url = config("FRONTEND_URL", default="").strip()
if _frontend_url:
    CORS_ALLOWED_ORIGINS.append(_frontend_url)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "x-csrftoken",
    "x-requested-with",
]
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

# ─── Apps ─────────────────────────────────────────────────────────────────────

INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",  # enables logout token blacklisting
    "django_filters",
    "channels",
    "properties",
    "accounts",
    "agents",
    "leads",
    "payments",
    "analytics",
    "bookings",
    "notifications",
]

# ─── Middleware ────────────────────────────────────────────────────────────────

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # must be first
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

AUTHENTICATION_BACKENDS = [
    "accounts.backends.EmailOrUsernameModelBackend",
    "django.contrib.auth.backends.ModelBackend",
]

ROOT_URLCONF = "realestate.urls"
ASGI_APPLICATION = "realestate.asgi.application"
WSGI_APPLICATION = "realestate.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ─── Database ─────────────────────────────────────────────────────────────────

DATABASES = {
    "default": dj_database_url.config(
        default=config("DATABASE_URL", default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

if config("DATABASE_URI", default=None):
    DATABASES["default"] = dj_database_url.parse(config("DATABASE_URI"))

# ─── Channels ─────────────────────────────────────────────────────────────────
# Use Redis in production for multi-instance support on Render.
# Add a free Redis instance on Render and set REDIS_URL env var.
# Falls back to InMemory for local dev when REDIS_URL is not set.

_REDIS_URL = config("REDIS_URL", default=None)

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": (
            "channels_redis.core.RedisChannelLayer"
            if _REDIS_URL
            else "channels.layers.InMemoryChannelLayer"
        ),
        **({"CONFIG": {"hosts": [_REDIS_URL]}} if _REDIS_URL else {}),
    },
}

# ─── REST Framework ───────────────────────────────────────────────────────────

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 12,
    # FIX: throttling was completely absent — added now
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/hour",  # unauthenticated browsing/search
        "user": "1000/hour",  # authenticated agents and users
        "auth": "10/minute",  # tight limit on login/register/token endpoints
        "leads": "30/minute",  # lead creation from property pages
    },
}

# ─── JWT ──────────────────────────────────────────────────────────────────────

SIMPLE_JWT = {
    # FIX: 1-day access token was dangerously long — 15 minutes is standard
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    # FIX: every refresh call issues a new refresh token, old one blacklisted
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": config("SECRET_KEY"),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ─── Security headers ─────────────────────────────────────────────────────────
# Only enforce in production — Render always serves HTTPS

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = "DENY"
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = False  # frontend must read this

SESSION_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SAMESITE = "None"

# ─── Upload size limits ───────────────────────────────────────────────────────

DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB

# ─── Password validation ──────────────────────────────────────────────────────

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─── Localisation ─────────────────────────────────────────────────────────────

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True

# ─── Static & media ───────────────────────────────────────────────────────────

STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "accounts.CustomUser"

# ─── Email ────────────────────────────────────────────────────────────────────

if DEBUG:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
    EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
    EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
    DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="noreply@kenyaprime.com")

# ─── Logging ──────────────────────────────────────────────────────────────────

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{asctime} {levelname} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django.security": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": True,
        },
        "django.request": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": True,
        },
        "accounts": {
            "handlers": ["console"],
            "level": "DEBUG" if DEBUG else "WARNING",
            "propagate": True,
        },
    },
}
