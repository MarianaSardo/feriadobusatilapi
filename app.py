from dotenv import load_dotenv

load_dotenv()

import json
import os
from datetime import datetime, date
from typing import List, Dict, Optional
from pydantic import BaseModel, validator
from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from config import (
    FERIADOS_FILE,
    API_KEY,
    MIN_YEAR,
    MAX_YEAR_OFFSET,
    MAX_PROXIMOS_FERIADOS,
    API_PREFIX,
)


class Feriado(BaseModel):
    fecha: str
    nombre: str

    @validator("fecha")
    def validar_fecha(cls, v):
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("Formato de fecha inválido. Usa YYYY-MM-DD.")


class FeriadoResponse(BaseModel):
    anio: int
    feriados: List[Feriado]


class MensajeResponse(BaseModel):
    mensaje: str
    detalles: Optional[Dict] = None


docs_url = f"{API_PREFIX}/docs" if API_PREFIX else "/docs"
redoc_url = f"{API_PREFIX}/redoc" if API_PREFIX else "/redoc"
openapi_url = f"{API_PREFIX}/openapi.json" if API_PREFIX else "/openapi.json"

app = FastAPI(
    title="API de Feriados Bursátiles",
    description="API para consultar y gestionar feriados bursátiles argentinos",
    version="2.0.0",
    docs_url=docs_url,
    redoc_url=redoc_url,
    openapi_url=openapi_url,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key_header = APIKeyHeader(name="X-API-Key")


def validar_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=403, detail="Acceso denegado: API Key inválida."
        )
    return api_key


def cargar_feriados() -> Dict:
    try:
        with open(FERIADOS_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, detail="Error al leer el archivo de feriados"
        )


def guardar_feriados(feriados: Dict) -> None:
    try:
        with open(FERIADOS_FILE, "w", encoding="utf-8") as file:
            json.dump(feriados, file, indent=4, ensure_ascii=False)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al guardar feriados: {str(e)}"
        )


def validar_anio(anio: int) -> None:
    anio_actual = datetime.now().year
    if anio < MIN_YEAR or anio > anio_actual + MAX_YEAR_OFFSET:
        raise HTTPException(
            status_code=400,
            detail=f"El año debe estar entre {MIN_YEAR} y {anio_actual + MAX_YEAR_OFFSET}",
        )


def validar_fecha_futura(fecha_str: str) -> None:
    try:
        fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        fecha_minima = date(MIN_YEAR, 1, 1)
        if fecha < fecha_minima:
            raise HTTPException(
                status_code=400,
                detail=f"La fecha no puede ser anterior al año {MIN_YEAR}",
            )
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Formato de fecha inválido. Usa YYYY-MM-DD."
        )


FERIADOS_BYMA = cargar_feriados()


@app.get("/", response_model=Dict)
async def root():
    return {
        "mensaje": "API de Feriados Bursátiles Argentinos",
        "version": "2.0.0",
        "endpoints": {
            "todos_feriados": (
                f"{API_PREFIX}/feriados/all" if API_PREFIX else "/feriados/all"
            ),
            "feriados_por_anio": (
                f"{API_PREFIX}/feriados/{{anio}}" if API_PREFIX else "/feriados/{anio}"
            ),
            "consultar_fecha": (
                f"{API_PREFIX}/feriados/consultar/{{fecha}}"
                if API_PREFIX
                else "/feriados/consultar/{fecha}"
            ),
            "proximos_feriados": (
                f"{API_PREFIX}/feriados/proximos"
                if API_PREFIX
                else "/feriados/proximos"
            ),
            "agregar_feriado": (
                f"{API_PREFIX}/feriados/agregar/"
                if API_PREFIX
                else "/feriados/agregar/"
            ),
            "eliminar_feriado": (
                f"{API_PREFIX}/feriados/eliminar/"
                if API_PREFIX
                else "/feriados/eliminar/"
            ),
        },
        "documentacion": docs_url,
    }


@app.get("/feriados/all", response_model=Dict)
async def obtener_todos_feriados():
    return FERIADOS_BYMA


@app.get("/feriados/proximos", response_model=List[Dict])
async def proximos_feriados(
    cantidad: int = Query(
        default=5,
        ge=1,
        le=MAX_PROXIMOS_FERIADOS,
        description=f"Cantidad de próximos feriados a mostrar (máximo {MAX_PROXIMOS_FERIADOS})",
    )
):
    fecha_actual = datetime.now().date()
    proximos = []

    for anio_str, feriados in FERIADOS_BYMA.items():
        for feriado in feriados:
            try:
                fecha_feriado = datetime.strptime(feriado["fecha"], "%Y-%m-%d").date()
                if fecha_feriado >= fecha_actual:
                    proximos.append(
                        {
                            "fecha": feriado["fecha"],
                            "nombre": feriado["nombre"],
                            "dias_restantes": (fecha_feriado - fecha_actual).days,
                        }
                    )
            except ValueError:
                continue

    proximos.sort(key=lambda x: x["fecha"])
    return proximos[:cantidad]


@app.get("/feriados/consultar/{fecha}", response_model=Dict)
async def consultar_fecha(fecha: str):
    validar_fecha_futura(fecha)

    try:
        fecha_obj = datetime.strptime(fecha, "%Y-%m-%d")
        anio_str = str(fecha_obj.year)
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Formato de fecha inválido. Usa YYYY-MM-DD."
        )

    if anio_str not in FERIADOS_BYMA:
        return {
            "fecha": fecha,
            "es_feriado": False,
            "nombre": None,
            "mensaje": "No hay datos de feriados para este año",
        }

    for feriado in FERIADOS_BYMA[anio_str]:
        if feriado["fecha"] == fecha:
            return {"fecha": fecha, "es_feriado": True, "nombre": feriado["nombre"]}

    return {"fecha": fecha, "es_feriado": False, "nombre": None}


@app.get("/feriados/{anio}", response_model=FeriadoResponse)
async def obtener_feriados(anio: int):
    validar_anio(anio)
    anio_str = str(anio)

    if anio_str not in FERIADOS_BYMA:
        raise HTTPException(
            status_code=404, detail=f"No hay datos de feriados para el año {anio}"
        )

    return {"anio": anio, "feriados": FERIADOS_BYMA[anio_str]}


@app.post(
    "/feriados/agregar/",
    response_model=MensajeResponse,
    dependencies=[Depends(validar_api_key)],
)
async def agregar_feriado(anio: int, fecha: str, nombre: str):
    validar_anio(anio)
    validar_fecha_futura(fecha)

    try:
        fecha_obj = datetime.strptime(fecha, "%Y-%m-%d")
        if fecha_obj.year != anio:
            raise HTTPException(
                status_code=400, detail="La fecha debe corresponder al año especificado"
            )
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Formato de fecha inválido. Usa YYYY-MM-DD."
        )

    anio_str = str(anio)

    if anio_str not in FERIADOS_BYMA:
        FERIADOS_BYMA[anio_str] = []

    for f in FERIADOS_BYMA[anio_str]:
        if f["fecha"] == fecha:
            raise HTTPException(
                status_code=400, detail=f"Ya existe un feriado en la fecha {fecha}"
            )

    nuevo_feriado = {"fecha": fecha, "nombre": nombre}
    FERIADOS_BYMA[anio_str].append(nuevo_feriado)

    FERIADOS_BYMA[anio_str].sort(key=lambda x: x["fecha"])

    guardar_feriados(FERIADOS_BYMA)

    return {
        "mensaje": f"Feriado '{nombre}' agregado correctamente",
        "detalles": {
            "fecha": fecha,
            "anio": anio,
            "total_feriados_anio": len(FERIADOS_BYMA[anio_str]),
        },
    }


@app.delete(
    "/feriados/eliminar/",
    response_model=MensajeResponse,
    dependencies=[Depends(validar_api_key)],
)
async def eliminar_feriado(anio: int, fecha: str):
    validar_anio(anio)
    validar_fecha_futura(fecha)

    anio_str = str(anio)

    if anio_str not in FERIADOS_BYMA:
        raise HTTPException(
            status_code=404, detail=f"No hay feriados para el año {anio}"
        )

    feriado_encontrado = None
    for feriado in FERIADOS_BYMA[anio_str]:
        if feriado["fecha"] == fecha:
            feriado_encontrado = feriado
            break

    if not feriado_encontrado:
        raise HTTPException(
            status_code=404, detail=f"No se encontró un feriado en la fecha {fecha}"
        )

    FERIADOS_BYMA[anio_str] = [
        f for f in FERIADOS_BYMA[anio_str] if f["fecha"] != fecha
    ]

    guardar_feriados(FERIADOS_BYMA)

    return {
        "mensaje": f"Feriado eliminado correctamente",
        "detalles": {
            "fecha": fecha,
            "nombre": feriado_encontrado["nombre"],
            "anio": anio,
            "total_feriados_restantes": len(FERIADOS_BYMA[anio_str]),
        },
    }


@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Recurso no encontrado",
            "mensaje": "El endpoint o recurso solicitado no existe",
            "endpoints_disponibles": [
                "/",
                "/feriados/all",
                "/feriados/{anio}",
                "/feriados/consultar/{fecha}",
                "/feriados/proximos",
                docs_url,
            ],
        },
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=80)
