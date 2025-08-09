import os

FERIADOS_FILE = os.getenv("FERIADOS_FILE", "feriados.json")

API_KEY = os.getenv("API_KEY")

MIN_YEAR = int(os.getenv("MIN_YEAR", "1900"))
MAX_YEAR_OFFSET = int(os.getenv("MAX_YEAR_OFFSET", "10"))

MAX_PROXIMOS_FERIADOS = int(os.getenv("MAX_PROXIMOS_FERIADOS", "20"))
API_PREFIX = os.getenv("API_PREFIX", "")


def validate_config():
    """Valida la configuración de la aplicación"""
    if not API_KEY:
        raise ValueError("API_KEY es requerida pero no está configurada")

    if MIN_YEAR < 1900:
        raise ValueError("MIN_YEAR no puede ser menor a 1900")

    if MAX_YEAR_OFFSET < 1:
        raise ValueError("MAX_YEAR_OFFSET debe ser al menos 1")

    if MAX_PROXIMOS_FERIADOS < 1:
        raise ValueError("MAX_PROXIMOS_FERIADOS debe ser al menos 1")


validate_config()
