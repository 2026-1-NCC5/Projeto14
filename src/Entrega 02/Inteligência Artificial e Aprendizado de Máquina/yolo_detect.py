import os
import sys
import argparse
import glob
import time
import math
import json
import threading # ADICIONADO: Para salvar no banco sem travar o vídeo
import tkinter as tk
from tkinter import ttk, messagebox
import mysql.connector

import cv2
import numpy as np
from ultralytics import YOLO

# ==============================================================================
# FUNÇÃO PARA SALVAR NO BANCO DE DADOS (ASSÍNCRONA)
# ==============================================================================
def salvar_banco_async(equipe, nome_alimento, quantidade, peso_total):
    def run():
        try:
            conexao = mysql.connector.connect(
                host="localhost",
                user="root",
                password="230604",
                database="liderai"
            )
            cursor = conexao.cursor()
            
            # Garante que a tabela de arrecadações existe
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS arrecadacao (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    team_group VARCHAR(100),
                    alimento VARCHAR(100),
                    quantidade INT,
                    peso_kg DECIMAL(10,2),
                    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            sql = "INSERT INTO arrecadacao (team_group, alimento, quantidade, peso_kg) VALUES (%s, %s, %s, %s)"
            valores = (equipe, nome_alimento, quantidade, peso_total)
            cursor.execute(sql, valores)
            conexao.commit()
            conexao.close()
            print(f"✅ Salvo no DB: {quantidade}x {nome_alimento} ({peso_total}kg) - Equipe: {equipe}")
        except Exception as e:
            print(f"⚠️ Erro ao salvar no banco: {e}")
            
    # Executa a função em uma thread separada para não causar lag no vídeo
    threading.Thread(target=run).start()
# ==============================================================================

# ==============================================================================
# TELA DE SELEÇÃO DE GRUPO (BANCO DE DADOS)
# ==============================================================================
grupo_selecionado = None

def obter_grupos_db():
    try:
        conexao = mysql.connector.connect(
            host="localhost",
            user="root",
            password="230604",
            database="liderai"
        )
        cursor = conexao.cursor()
        cursor.execute("SELECT DISTINCT team_group FROM users WHERE team_group IS NOT NULL AND team_group != ''")
        grupos = [linha[0] for linha in cursor.fetchall()]
        conexao.close()
        
        return grupos if grupos else ["Nenhum grupo cadastrado no DB"]
    except Exception as e:
        print(f"⚠️ Erro ao conectar no MySQL: {e}")
        return ["Grupo A (Modo Offline)", "Grupo B (Modo Offline)"]

def iniciar_interface_selecao():
    global grupo_selecionado
    grupos = obter_grupos_db()
    
    janela = tk.Tk()
    janela.title("LiderAI - Configuração de Sessão")
    janela.geometry("380x180")
    janela.eval('tk::PlaceWindow . center')
    
    tk.Label(janela, text="Selecione a sua equipe:", font=("Arial", 12, "bold")).pack(pady=15)
    
    combo_grupos = ttk.Combobox(janela, values=grupos, state="readonly", font=("Arial", 11), width=30)
    combo_grupos.pack(pady=5)
    if grupos:
        combo_grupos.current(0)
        
    def confirmar():
        global grupo_selecionado
        grupo_selecionado = combo_grupos.get()
        janela.destroy()
        
    btn = tk.Button(janela, text="🚀 Iniciar Detecção", command=confirmar, bg="#28a745", fg="white", font=("Arial", 11, "bold"))
    btn.pack(pady=15)
    janela.mainloop()

iniciar_interface_selecao()

if not grupo_selecionado:
    print("Nenhum grupo selecionado. Encerrando sistema.")
    sys.exit(0)

print(f"\n✅ Sessão iniciada para a equipe: {grupo_selecionado}")

# ==============================================================================
# TABELA DE PESOS PADRÃO (Em KG)
# ==============================================================================
PESOS_PADRAO = {
    '1kg_rice_package': 1.0,
    '5kg_rice_package': 5.0,
    'beans_package': 1.0,
    'fuba_package': 0.5,
    'oil_package': 0.9,
    'pasta_package': 0.5,
    'spaghetti_package': 0.5,
    'sugar_package': 1.0
}

# Configurações de Argumentos
parser = argparse.ArgumentParser()
parser.add_argument('--model', help='Path to YOLO model file', default='my_model.pt')
parser.add_argument('--source', help='Image source (usb0, file, etc)', default='usb0')
parser.add_argument('--thresh', help='Minimum confidence threshold', default=0.5)
parser.add_argument('--resolution', help='Resolution in WxH', default='1280x720')
parser.add_argument('--record', help='Record results', action='store_true')

args = parser.parse_args()

model_path = args.model
img_source = args.source
min_thresh = float(args.thresh)
user_res = args.resolution
record = args.record

if not os.path.exists(model_path):
    print('ERROR: Model path is invalid or model was not found.')
    sys.exit(0)

print("\nCarregando IA...")
model = YOLO(model_path, task='detect')
labels = model.names

img_ext_list = ['.jpg','.JPG','.jpeg','.JPEG','.png','.PNG','.bmp','.BMP']
vid_ext_list = ['.avi','.mov','.mp4','.mkv','.wmv']

if os.path.isdir(img_source):
    source_type = 'folder'
elif os.path.isfile(img_source):
    _, ext = os.path.splitext(img_source)
    if ext in img_ext_list: source_type = 'image'
    elif ext in vid_ext_list: source_type = 'video'
    else: sys.exit(0)
elif 'usb' in img_source:
    source_type = 'usb'
    usb_idx = int(img_source[3:])
elif 'picamera' in img_source:
    source_type = 'picamera'
    picam_idx = int(img_source[8:])
else:
    sys.exit(0)

resize = False
if user_res:
    resize = True
    resW, resH = int(user_res.split('x')[0]), int(user_res.split('x')[1])

if record:
    record_name = 'demo1.avi'
    recorder = cv2.VideoWriter(record_name, cv2.VideoWriter_fourcc(*'MJPG'), 30, (resW,resH))

if source_type == 'image': imgs_list = [img_source]
elif source_type == 'folder':
    imgs_list = [f for f in glob.glob(img_source + '/*') if os.path.splitext(f)[1] in img_ext_list]
elif source_type in ['video', 'usb']:
    cap_arg = img_source if source_type == 'video' else usb_idx
    cap = cv2.VideoCapture(cap_arg)
    if user_res:
        cap.set(3, resW)
        cap.set(4, resH)
elif source_type == 'picamera':
    from picamera2 import Picamera2
    cap = Picamera2()
    cap.configure(cap.create_video_configuration(main={"format": 'XRGB8888', "size": (resW, resH)}))
    cap.start()

# CALIBRAÇÃO FIXA
pontos_imagem_pixel = np.array([[47, 31], [555, 32], [558, 443], [60, 432]], dtype="float32")
pontos_real_cm = np.array([[0, 0], [50, 0], [50, 50], [0, 50]], dtype="float32")
matriz_medidas, _ = cv2.findHomography(pontos_imagem_pixel, pontos_real_cm)

bbox_colors = [(164,120,87), (68,148,228), (93,97,209), (178,182,133), (88,159,106), 
              (96,202,231), (159,124,168), (169,162,241), (98,118,150), (172,176,184)]

avg_frame_rate = 0
frame_rate_buffer = []
fps_avg_len = 200
img_count = 0

# ==============================================================================
# VARIÁVEIS DO TRACKER (RASTREADOR PARA EVITAR DUPLICIDADE)
# ==============================================================================
tracked_objects = [] 
global_counts = {} # Acumula o total de itens cruzados na sessão
linha_contagem_y = resH // 2 if resize else 360 # Define a linha no meio da tela
# ==============================================================================

print(f"\n🚀 Monitoramento ativo para: {grupo_selecionado}")

while True:
    t_start = time.perf_counter()

    if source_type in ['image', 'folder']:
        if img_count >= len(imgs_list): break
        frame = cv2.imread(imgs_list[img_count])
        img_count += 1
    elif source_type in ['video', 'usb']:
        ret, frame = cap.read()
        if not ret: break
    elif source_type == 'picamera':
        frame_bgra = cap.capture_array()
        frame = cv2.cvtColor(np.copy(frame_bgra), cv2.COLOR_BGRA2BGR)
        if frame is None: break

    if resize: frame = cv2.resize(frame,(resW,resH))

    results = model(frame, verbose=False)
    detections = results[0].boxes
    
    current_detections = [] # Lista temporária para o tracker

    for i in range(len(detections)):
        xyxy = detections[i].xyxy.cpu().numpy().squeeze()
        if xyxy.ndim == 0: continue 
        xmin, ymin, xmax, ymax = xyxy.astype(int)
        conf = detections[i].conf.item()

        if conf > min_thresh:
            classidx = int(detections[i].cls.item())
            classname = labels[classidx]
            color = bbox_colors[classidx % 10]
            
            # Adiciona a detecção para o rastreamento
            current_detections.append({
                'xmin': xmin, 'ymin': ymin, 'xmax': xmax, 'ymax': ymax,
                'classname': classname
            })
            
            cv2.rectangle(frame, (xmin,ymin), (xmax,ymax), color, 2)

            # CÁLCULO DE TAMANHO
            base_esq_pixel = np.array([[[xmin, ymax]]], dtype="float32")
            base_dir_pixel = np.array([[[xmax, ymax]]], dtype="float32")

            base_esq_cm = cv2.perspectiveTransform(base_esq_pixel, matriz_medidas)[0][0]
            base_dir_cm = cv2.perspectiveTransform(base_dir_pixel, matriz_medidas)[0][0]

            largura_cm = math.sqrt((base_dir_cm[0] - base_esq_cm[0])**2 + (base_dir_cm[1] - base_esq_cm[1])**2)
            cv2.line(frame, (xmin, ymax), (xmax, ymax), (0, 255, 255), 3)

            label = f'{classname}: {int(conf*100)}% | {largura_cm:.1f}cm'
            
            labelSize, baseLine = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            label_ymin = max(ymin, labelSize[1] + 10)
            cv2.rectangle(frame, (xmin, label_ymin-labelSize[1]-10), (xmin+labelSize[0], label_ymin+baseLine-10), color, cv2.FILLED)
            cv2.putText(frame, label, (xmin, label_ymin-7), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

    # ==============================================================================
    # LÓGICA DE TRACKING E LINHA DE PASSAGEM
    # ==============================================================================
    novos_rastreados = []
    for d in current_detections:
        cx = (d['xmin'] + d['xmax']) // 2
        cy = (d['ymin'] + d['ymax']) // 2
        
        obj_match = None
        min_dist = 80 # Distância máxima em pixels para ser considerado o mesmo objeto
        
        for obj in tracked_objects:
            dist = math.hypot(cx - obj['cx'], cy - obj['cy'])
            if dist < min_dist and obj['classe'] == d['classname'] and not obj.get('matched', False):
                obj_match = obj
                min_dist = dist
                
        if obj_match:
            obj_match['cx'] = cx
            obj_match['cy'] = cy
            obj_match['frames_sumido'] = 0
            obj_match['matched'] = True
            novos_rastreados.append(obj_match)
        else:
            # É um objeto novo na tela
            novos_rastreados.append({
                'cx': cx, 'cy': cy, 'classe': d['classname'],
                'contado': False, 'frames_sumido': 0, 'matched': True
            })
            
    # Mantém na memória objetos que piscaram/sumiram rápido
    for obj in tracked_objects:
        if not obj.get('matched', False):
            obj['frames_sumido'] += 1
            if obj['frames_sumido'] < 10:
                novos_rastreados.append(obj)
                
    for obj in novos_rastreados:
        obj['matched'] = False
        
    tracked_objects = novos_rastreados
    
    # Desenha a Linha de Contagem (Azul)
    w_frame = resW if resize else frame.shape[1]
    cv2.line(frame, (0, linha_contagem_y), (w_frame, linha_contagem_y), (255, 0, 0), 2)
    cv2.putText(frame, "LINHA DE CONTAGEM", (10, linha_contagem_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
    
    # Verifica quem cruzou a linha (de cima para baixo)
    for obj in tracked_objects:
        if not obj['contado'] and obj['cy'] > linha_contagem_y:
            obj['contado'] = True
            
            # Incrementa o total geral da sessão
            global_counts[obj['classe']] = global_counts.get(obj['classe'], 0) + 1
            peso = PESOS_PADRAO.get(obj['classe'], 0.0)
            
            # DISPARA A FUNÇÃO PARA SALVAR NO BANCO
            salvar_banco_async(grupo_selecionado, obj['classe'], 1, peso)
            
            # Feedback visual verde no centro do objeto
            cv2.circle(frame, (obj['cx'], obj['cy']), 20, (0, 255, 0), -1)
    # ==============================================================================

    # ==============================================================================
    # GERAÇÃO DO RELATÓRIO JSON COM OS DADOS ACUMULADOS (TOTAIS)
    # ==============================================================================
    relatorio = {
        "status": "ativo",
        "equipe": grupo_selecionado,
        "peso_total_kg": 0.0,
        "itens": {}
    }

    count_display = ""
    # Agora usa global_counts (acumulado) em vez do count temporário
    if global_counts:
        for nome, qtd in global_counts.items():
            peso_unitario = PESOS_PADRAO.get(nome, 0.0)
            subtotal_kg = qtd * peso_unitario
            
            relatorio["itens"][nome] = {
                "quantidade": qtd,
                "peso_unitario_kg": peso_unitario,
                "subtotal_kg": subtotal_kg
            }
            relatorio["peso_total_kg"] += subtotal_kg
            count_display += f"{qtd}x {nome} | "
            
        count_display = count_display[:-3]
    else:
        count_display = "Aguardando itens cruzarem a linha..."

    with open('dados_liderai.json', 'w', encoding='utf-8') as f:
        json.dump(relatorio, f, indent=4, ensure_ascii=False)

    # Exibição na tela
    cv2.putText(frame, f"EQUIPE: {grupo_selecionado}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(frame, count_display, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
    cv2.putText(frame, f"TOTAL ACUMULADO: {relatorio['peso_total_kg']:.2f} KG", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    # ==============================================================================
    
    cv2.imshow('LiderAI - Detector, Medidor e Pesagem', frame)
    if record: recorder.write(frame)

    key = cv2.waitKey(0 if source_type in ['image', 'folder'] else 5)
    if key in [ord('q'), ord('Q')]: break
    elif key in [ord('s'), ord('S')]: cv2.waitKey()
    elif key in [ord('p'), ord('P')]: cv2.imwrite('capture.png', frame)
    
    t_stop = time.perf_counter()
    frame_rate_buffer.append(float(1/(t_stop - t_start)))
    if len(frame_rate_buffer) >= fps_avg_len: frame_rate_buffer.pop(0)
    avg_frame_rate = np.mean(frame_rate_buffer)

print(f'Average pipeline FPS: {avg_frame_rate:.2f}')

if source_type in ['video', 'usb']: cap.release()
elif source_type == 'picamera': cap.stop()
if record: recorder.release()
cv2.destroyAllWindows()