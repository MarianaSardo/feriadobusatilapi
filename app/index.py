import json
import os
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import APIKeyHeader

from config import FERIADOS_FILE

load_dotenv()

API_KEY = os.getenv("API_KEY")

if not API_KEY:
    raise ValueError("API_KEY no está configurada.")

app = FastAPI()

api_key_header = APIKeyHeader(name="X-API-Key")


def validar_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Acceso denegado: API Key invalida.")
    return api_key


def cargar_feriados():
    with open("../feriados.json", "r", encoding="utf-8") as file:
        return json.load(file)


def guardar_feriados(feriados):
    with open(FERIADOS_FILE, "w") as file:
        json.dump(feriados, file, indent=4)


FERIADOS_BYMA = cargar_feriados()


@app.get("/feriados/all")
def obtener_todos_feriados():
    """Devuelve todos los feriados disponibles en la base de datos."""
    return cargar_feriados()


@app.get("/feriados/{anio}")
def obtener_feriados(anio: int):
    """Devuelve los feriados de un año específico"""
    anio_str = str(anio)
    if anio_str in FERIADOS_BYMA:
        return {"anio": anio, "feriados": FERIADOS_BYMA[anio_str]}
    else:
        return {"error": "No hay datos de feriados para este año"}


@app.post("/feriados/agregar/", dependencies=[Depends(validar_api_key)])
def agregar_feriado(anio: int, fecha: str, nombre: str):
    """
    Agrega un nuevo feriado al JSON.
    """
    anio_str = str(anio)

    try:
        datetime.strptime(fecha, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inv├ílido. Usa YYYY-MM-DD.")

    if anio_str not in FERIADOS_BYMA:
        FERIADOS_BYMA[anio_str] = []

    # Verificar si ya existe
    for f in FERIADOS_BYMA[anio_str]:
        if f["fecha"] == fecha:
            raise HTTPException(status_code=400, detail="El feriado ya existe.")

    FERIADOS_BYMA[anio_str].append({"fecha": fecha, "nombre": nombre})

    guardar_feriados(FERIADOS_BYMA)

    return {"mensaje": f"Feriado '{nombre}' agregado correctamente el {fecha}."}


@app.delete("/feriados/eliminar/", dependencies=[Depends(validar_api_key)])
def eliminar_feriado(anio: int, fecha: str):
    """
    Elimina un feriado del JSON.
    """
    anio_str = str(anio)

    if anio_str not in FERIADOS_BYMA:
        raise HTTPException(status_code=404, detail="No hay feriados para este a├▒o.")

    feriados_actualizados = [f for f in FERIADOS_BYMA[anio_str] if f["fecha"] != fecha]

    if len(feriados_actualizados) == len(FERIADOS_BYMA[anio_str]):
        raise HTTPException(status_code=404, detail="El feriado no existe.")

    FERIADOS_BYMA[anio_str] = feriados_actualizados

    guardar_feriados(FERIADOS_BYMA)

    return {"mensaje": f"Feriado del {fecha} eliminado correctamente."}

