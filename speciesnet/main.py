
import json
import subprocess
import sys
import tempfile

from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool


app = FastAPI(
    title="Animal Safety - SpeciesNet",
    description="Serviço de reconhecimento de animais.",
    version="1.0.0",
)

BASE_DIR = Path(__file__).resolve().parent

MODEL = "kaggle:google/speciesnet/pyTorch/v4.0.3a/1"

MAX_FILE_SIZE = 5 * 1024 * 1024

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def separar_classificacao(classificacao: dict) -> dict:
    classe = classificacao.get("class", "")
    partes = classe.split(";")

    partes += [""] * (7 - len(partes))

    genero = partes[4]
    especie = partes[5]
    nome_comum = partes[6]

    nome_cientifico = " ".join(
        parte for parte in [genero, especie] if parte
    )

    return {
        "nome_comum": nome_comum or None,
        "nome_cientifico": nome_cientifico or None,
    }


def processar_imagem(caminho_imagem: Path, caminho_resultado: Path):
    comando = [
        sys.executable,
        "-m",
        "speciesnet.scripts.run_model",
        "--filepaths",
        str(caminho_imagem),
        "--predictions_json",
        str(caminho_resultado),
        "--country",
        "BRA",
        "--model",
        MODEL,
        "--bypass_prompts",
    ]

    try:
        processo = subprocess.run(
            comando,
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            timeout=900,
        )

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=504,
            detail="O reconhecimento demorou mais que o esperado.",
        )

    if processo.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Não foi possível processar a imagem.",
                "error": processo.stderr[-3000:],
            },
        )

    if not caminho_resultado.exists():
        raise HTTPException(
            status_code=500,
            detail="O SpeciesNet não gerou o arquivo de resultado.",
        )

    with caminho_resultado.open("r", encoding="utf-8") as arquivo:
        resultado = json.load(arquivo)

    predictions = resultado.get("predictions", [])

    if not predictions:
        return {
            "detectado": False,
            "mensagem": "Nenhum resultado foi encontrado.",
            "deteccoes": [],
        }

    deteccoes = []

    for deteccao in predictions[0].get("detections", []):

        if deteccao.get("label") != "animal":
            continue

        classificacao = deteccao.get(
            "processed_classification", {}
        )

        origem = classificacao.get("source")
        pontuacao = classificacao.get("score", 0)

        identificacao = separar_classificacao(classificacao)

        identificado = (
            origem == "classifier"
            and identificacao["nome_cientifico"] is not None
            and identificacao["nome_comum"] not in {
                "animal",
                "blank",
            }
        )

        if pontuacao >= 0.90:
            nivel_confianca = "alta"
        elif pontuacao >= 0.70:
            nivel_confianca = "moderada"
        else:
            nivel_confianca = "baixa"

        candidatos = []

        classificacoes_brutas = deteccao.get(
            "raw_classifications", {}
        )

        classes = classificacoes_brutas.get("classes", [])
        scores = classificacoes_brutas.get("scores", [])

        for classe, score in zip(classes, scores):
            candidato = separar_classificacao({"class": classe})

            candidatos.append({
                **candidato,
                "pontuacao": score,
            })

        deteccoes.append({
            "detectado": True,
            "identificado": identificado,
            "nome_comum": (
                identificacao["nome_comum"] if identificado else None
            ),
            "nome_cientifico": (
                identificacao["nome_cientifico"] if identificado else None
            ),
            "confianca": pontuacao if identificado else None,
            "nivel_confianca": (
                nivel_confianca if identificado else None
            ),
            "origem": origem,
            "confianca_deteccao": deteccao.get("conf"),
            "candidatos": candidatos,
        })

    return {
        "detectado": len(deteccoes) > 0,
        "modelo": predictions[0].get("model_version"),
        "deteccoes": deteccoes,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "servico": "Animal Safety - SpeciesNet",
    }


@app.post("/reconhecer")
async def reconhecer(foto: UploadFile = File(...)):

    if foto.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Formato inválido. Envie JPG, PNG ou WEBP.",
        )

    conteudo = await foto.read(MAX_FILE_SIZE + 1)

    if not conteudo:
        raise HTTPException(
            status_code=400,
            detail="A imagem está vazia.",
        )

    if len(conteudo) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="A imagem deve ter no máximo 5 MB.",
        )

    extensao = ALLOWED_TYPES[foto.content_type]

    with tempfile.TemporaryDirectory() as pasta_temporaria:

        pasta = Path(pasta_temporaria)

        caminho_imagem = pasta / f"animal{extensao}"
        caminho_resultado = pasta / "resultado.json"

        caminho_imagem.write_bytes(conteudo)

        resultado = await run_in_threadpool(
            processar_imagem,
            caminho_imagem,
            caminho_resultado,
        )

        return resultado
