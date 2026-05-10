import os
import sys
import argparse
import glob
import time
import math
import threading
import tkinter as tk
from tkinter import ttk

import cv2
import numpy as np
import mysql.connector
from dotenv import load_dotenv
from ultralytics import YOLO

load_dotenv()

# ==============================================================================
# CONFIGURAÇÕES DO BANCO DE DADOS
# ==============================================================================

DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")
DB_SSL = os.getenv("DB_SSL", "false").lower() == "true"


# ==============================================================================
# CONFIGURAÇÕES DO MODELO
# ==============================================================================

PESOS_CLASSES = {
    "1kg_rice_package": 1.0,
    "5kg_rice_package": 5.0,
    "beans_package": 1.0,
    "fuba_package": 0.5,
    "oil_package": 0.9,
    "pasta_package": 0.5,
    "spaghetti_package": 0.5,
    "sugar_package": 1.0
}

NOMES_ALIMENTOS = {
    "1kg_rice_package": "arroz",
    "5kg_rice_package": "arroz",
    "beans_package": "feijao",
    "fuba_package": "fuba",
    "oil_package": "oleo",
    "pasta_package": "macarrao",
    "spaghetti_package": "macarrao",
    "sugar_package": "acucar"
}

DISTANCIA_MAX_ASSOCIACAO = 140
FRAMES_PARA_CONTAR = 8
FRAMES_MAX_SUMIDO = 30


# ==============================================================================
# BANCO DE DADOS
# ==============================================================================

def conectar_banco():
    if not all([DB_HOST, DB_USER, DB_PASSWORD, DB_NAME]):
        raise ValueError(
            "Configuração do banco incompleta. "
            "Verifique DB_HOST, DB_USER, DB_PASSWORD e DB_NAME no arquivo .env."
        )

    return mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        ssl_disabled=not DB_SSL
    )


def testar_conexao():
    try:
        conexao = conectar_banco()
        cursor = conexao.cursor()
        cursor.execute("SELECT DATABASE()")
        banco_atual = cursor.fetchone()[0]

        cursor.close()
        conexao.close()

        print(f"✅ Conectado ao banco: {banco_atual}")
        return True

    except Exception as e:
        print(f"❌ Erro ao testar conexão com o banco: {e}")
        return False


def salvar_banco_async(equipe, alimento, quantidade, peso_total):
    def run():
        try:
            conexao = conectar_banco()
            cursor = conexao.cursor()

            cursor.execute(
                """
                INSERT INTO arrecadacao 
                (team_group, alimento, quantidade, peso_kg) 
                VALUES (%s, %s, %s, %s)
                """,
                (equipe, alimento, quantidade, peso_total)
            )

            conexao.commit()

            cursor.close()
            conexao.close()

            print(
                f"✅ Salvo no DB: {quantidade}x {alimento} "
                f"({peso_total}kg) - Equipe: {equipe}"
            )

        except Exception as e:
            print(f"⚠️ Erro ao salvar no banco: {e}")

    threading.Thread(target=run, daemon=True).start()


def obter_grupos_db():
    try:
        conexao = conectar_banco()
        cursor = conexao.cursor()

        cursor.execute("""
            SELECT grupo
            FROM (
                SELECT name AS grupo
                FROM team_groups

                UNION

                SELECT team_group AS grupo
                FROM users
                WHERE team_group IS NOT NULL
                AND team_group != ''
            ) AS grupos_unificados
            WHERE grupo IS NOT NULL
            AND grupo != ''
            ORDER BY grupo
        """)

        grupos = [linha[0] for linha in cursor.fetchall()]

        cursor.close()
        conexao.close()

        print(f"✅ Grupos encontrados no banco: {grupos}")

        return grupos if grupos else ["Nenhum grupo cadastrado no DB"]

    except Exception as e:
        print(f"⚠️ Erro ao buscar grupos no MySQL: {e}")
        return ["Grupo A (Modo Offline)", "Grupo B (Modo Offline)"]


# ==============================================================================
# SELEÇÃO DO GRUPO
# ==============================================================================

def selecionar_grupo():
    grupos = obter_grupos_db()
    selecionado = {"grupo": None}

    janela = tk.Tk()
    janela.title("LiderAI - Configuração de Sessão")
    janela.geometry("420x190")
    janela.eval("tk::PlaceWindow . center")

    tk.Label(
        janela,
        text="Selecione a sua equipe:",
        font=("Arial", 12, "bold")
    ).pack(pady=15)

    combo = ttk.Combobox(
        janela,
        values=grupos,
        state="readonly",
        font=("Arial", 11),
        width=38
    )
    combo.pack(pady=5)
    combo.current(0)

    def confirmar():
        selecionado["grupo"] = combo.get()
        janela.destroy()

    tk.Button(
        janela,
        text="🚀 Iniciar Detecção",
        command=confirmar,
        bg="#28a745",
        fg="white",
        font=("Arial", 11, "bold")
    ).pack(pady=15)

    janela.mainloop()
    return selecionado["grupo"]


# ==============================================================================
# FONTE DE IMAGEM
# ==============================================================================

def identificar_fonte(source):
    img_ext = [".jpg", ".jpeg", ".png", ".bmp", ".JPG", ".JPEG", ".PNG", ".BMP"]
    vid_ext = [".avi", ".mov", ".mp4", ".mkv", ".wmv"]

    if os.path.isdir(source):
        imagens = [
            f for f in glob.glob(source + "/*")
            if os.path.splitext(f)[1] in img_ext
        ]
        return "folder", imagens

    if os.path.isfile(source):
        _, ext = os.path.splitext(source)

        if ext in img_ext:
            return "image", [source]

        if ext in vid_ext:
            return "video", source

    if source.startswith("usb"):
        return "usb", int(source[3:])

    print("Fonte inválida.")
    sys.exit(0)


def abrir_captura(source_type, source_data, resW, resH):
    if source_type in ["usb", "video"]:
        cap = cv2.VideoCapture(source_data)
        cap.set(3, resW)
        cap.set(4, resH)
        return cap

    return None


def ler_frame(source_type, source_data, cap, img_count):
    if source_type in ["image", "folder"]:
        if img_count >= len(source_data):
            return None, img_count, False

        frame = cv2.imread(source_data[img_count])
        return frame, img_count + 1, frame is not None

    ret, frame = cap.read()
    return frame, img_count, ret


# ==============================================================================
# CONVERSÃO DE CLASSES
# ==============================================================================

def obter_nome_alimento(classe_modelo):
    return NOMES_ALIMENTOS.get(classe_modelo, classe_modelo)


def obter_peso_classe(classe_modelo):
    return PESOS_CLASSES.get(classe_modelo, 0.0)


def calcular_peso_total(contagens_peso):
    return sum(contagens_peso.values())


def texto_contagem(contagens_peso):
    if not contagens_peso:
        return "Aguardando itens..."

    partes = []

    for alimento, peso in contagens_peso.items():
        partes.append(f"{peso:.1f}KG {alimento}")

    return " | ".join(partes)


# ==============================================================================
# TRACKING / ANTI-DUPLICAÇÃO
# ==============================================================================

def atualizar_tracker(tracked_objects, detections, next_object_id):
    novos = []

    for det in detections:
        obj_match = None
        menor_distancia = DISTANCIA_MAX_ASSOCIACAO

        for obj in tracked_objects:
            dist = math.hypot(det["cx"] - obj["cx"], det["cy"] - obj["cy"])

            if (
                dist < menor_distancia
                and obj["classe_modelo"] == det["classe_modelo"]
                and not obj.get("matched", False)
            ):
                obj_match = obj
                menor_distancia = dist

        if obj_match:
            obj_match["cx"] = det["cx"]
            obj_match["cy"] = det["cy"]
            obj_match["frames_visivel"] += 1
            obj_match["frames_sumido"] = 0
            obj_match["matched"] = True
            novos.append(obj_match)

        else:
            novos.append({
                "id": next_object_id,
                "cx": det["cx"],
                "cy": det["cy"],
                "classe_modelo": det["classe_modelo"],
                "frames_visivel": 1,
                "frames_sumido": 0,
                "contado": False,
                "matched": True
            })

            next_object_id += 1

    for obj in tracked_objects:
        if not obj.get("matched", False):
            obj["frames_sumido"] += 1

            if obj["frames_sumido"] < FRAMES_MAX_SUMIDO:
                novos.append(obj)

    for obj in novos:
        obj["matched"] = False

    return novos, next_object_id


def contar_objetos(tracked_objects, contagens_peso, contagens_unidade, grupo):
    for obj in tracked_objects:
        if not obj["contado"] and obj["frames_visivel"] >= FRAMES_PARA_CONTAR:
            obj["contado"] = True

            classe_modelo = obj["classe_modelo"]
            alimento = obter_nome_alimento(classe_modelo)
            peso = obter_peso_classe(classe_modelo)

            contagens_peso[alimento] = contagens_peso.get(alimento, 0.0) + peso
            contagens_unidade[alimento] = contagens_unidade.get(alimento, 0) + 1

            salvar_banco_async(grupo, alimento, 1, peso)

            print(
                f"✅ CONTADO: {alimento} "
                f"| +{peso:.1f}KG "
                f"| Total {alimento}: {contagens_peso[alimento]:.1f}KG"
            )

    return contagens_peso, contagens_unidade


# ==============================================================================
# PROGRAMA PRINCIPAL
# ==============================================================================

parser = argparse.ArgumentParser()
parser.add_argument("--model", default="my_model.pt")
parser.add_argument("--source", default="usb0")
parser.add_argument("--thresh", default=0.5)
parser.add_argument("--resolution", default="1280x720")
parser.add_argument("--record", action="store_true")

args = parser.parse_args()

resW, resH = map(int, args.resolution.split("x"))
min_thresh = float(args.thresh)

if not os.path.exists(args.model):
    print("ERRO: modelo não encontrado.")
    sys.exit(0)


# 1. Teste de conexão
if not testar_conexao():
    print("Encerrando por falha na conexão com o banco.")
    sys.exit(0)


# 2. Seleção do grupo
grupo_selecionado = selecionar_grupo()

if not grupo_selecionado:
    print("Nenhum grupo selecionado. Encerrando.")
    sys.exit(0)

grupos_invalidos = [
    "Nenhum grupo cadastrado no DB",
    "Grupo A (Modo Offline)",
    "Grupo B (Modo Offline)"
]

if grupo_selecionado in grupos_invalidos:
    print("Grupo inválido ou modo offline selecionado. Encerrando.")
    sys.exit(0)

print(f"\n✅ Sessão iniciada para a equipe: {grupo_selecionado}")


# 3. Preparação da fonte
source_type, source_data = identificar_fonte(args.source)
cap = abrir_captura(source_type, source_data, resW, resH)
img_count = 0


# 4. Carregamento do YOLO
print("\nCarregando IA...")
model = YOLO(args.model, task="detect")
labels = model.names


# 5. Gravação opcional
if args.record:
    recorder = cv2.VideoWriter(
        "demo1.avi",
        cv2.VideoWriter_fourcc(*"MJPG"),
        30,
        (resW, resH)
    )


# 6. Variáveis de contagem
tracked_objects = []
contagens_peso = {}
contagens_unidade = {}
next_object_id = 1
frame_rate_buffer = []
avg_frame_rate = 0

bbox_colors = [
    (164, 120, 87),
    (68, 148, 228),
    (93, 97, 209),
    (178, 182, 133),
    (88, 159, 106),
    (96, 202, 231),
    (159, 124, 168),
    (169, 162, 241),
    (98, 118, 150),
    (172, 176, 184)
]

print("\n🚀 Contagem iniciada.")


# ==============================================================================
# LOOP PRINCIPAL
# ==============================================================================

while True:
    inicio = time.perf_counter()

    frame, img_count, ok = ler_frame(source_type, source_data, cap, img_count)

    if not ok or frame is None:
        break

    frame = cv2.resize(frame, (resW, resH))

    results = model(frame, verbose=False)
    detections = results[0].boxes
    detections_validas = []

    for i in range(len(detections)):
        box = detections[i]
        conf = box.conf.item()

        if conf < min_thresh:
            continue

        xyxy = box.xyxy.cpu().numpy().squeeze()

        if xyxy.ndim == 0:
            continue

        xmin, ymin, xmax, ymax = xyxy.astype(int)
        classidx = int(box.cls.item())
        classe_modelo = labels[classidx]

        alimento = obter_nome_alimento(classe_modelo)
        peso = obter_peso_classe(classe_modelo)

        cx = (xmin + xmax) // 2
        cy = (ymin + ymax) // 2

        detections_validas.append({
            "cx": cx,
            "cy": cy,
            "classe_modelo": classe_modelo
        })

        color = bbox_colors[classidx % len(bbox_colors)]
        label = f"{alimento}: {int(conf * 100)}% | {peso:.1f}KG"

        cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), color, 2)

        cv2.putText(
            frame,
            label,
            (xmin, max(20, ymin - 10)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            color,
            2
        )

    tracked_objects, next_object_id = atualizar_tracker(
        tracked_objects,
        detections_validas,
        next_object_id
    )

    contagens_peso, contagens_unidade = contar_objetos(
        tracked_objects,
        contagens_peso,
        contagens_unidade,
        grupo_selecionado
    )

    peso_total = calcular_peso_total(contagens_peso)

    cv2.putText(
        frame,
        f"EQUIPE: {grupo_selecionado}",
        (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255, 255, 255),
        2
    )

    cv2.putText(
        frame,
        texto_contagem(contagens_peso),
        (10, 60),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (0, 255, 255),
        2
    )

    cv2.putText(
        frame,
        f"TOTAL: {peso_total:.1f}KG",
        (10, 90),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )

    cv2.imshow("LiderAI - Detector e Pesagem", frame)

    if args.record:
        recorder.write(frame)

    tecla = cv2.waitKey(0 if source_type in ["image", "folder"] else 5)

    if tecla in [ord("q"), ord("Q")]:
        break

    if tecla in [ord("p"), ord("P")]:
        cv2.imwrite("capture.png", frame)

    fim = time.perf_counter()

    if fim - inicio > 0:
        frame_rate_buffer.append(1 / (fim - inicio))

    if len(frame_rate_buffer) > 200:
        frame_rate_buffer.pop(0)

    if frame_rate_buffer:
        avg_frame_rate = np.mean(frame_rate_buffer)


print(f"Average pipeline FPS: {avg_frame_rate:.2f}")

if source_type in ["usb", "video"]:
    cap.release()

if args.record:
    recorder.release()

cv2.destroyAllWindows()