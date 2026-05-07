import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import math
import os
from PIL import Image

def preparar_projeto():
    if not os.path.exists('imagens'):
        os.makedirs('imagens')

    img = Image.open('feijao_camil.jpg').convert('RGB')
    img = img.resize((200, 200))
    matriz_rgb = np.array(img)
    
    h, w = 200, 200
    y_coords, x_coords = np.indices((h, w))
    pixels_planos = matriz_rgb.reshape(-1, 3)
    
    df = pd.DataFrame(pixels_planos, columns=['Red', 'Green', 'Blue'])
    df['X'] = x_coords.ravel()
    df['Y'] = y_coords.ravel()
    
    df.to_csv('imagens/matriz_imagem_alimento.csv', index=False)
    return df

def processar_e_salvar(df, matriz, nome_arquivo):
    x_c = df['X'] - 100
    y_c = df['Y'] - 100

    coords = np.vstack((x_c, y_c))
    novas_coords = matriz @ coords

    x_novo = novas_coords[0, :] + 100
    y_novo = novas_coords[1, :] + 100

    plt.figure(figsize=(6, 6))
    plt.scatter(x_novo, y_novo, c=df[['Red', 'Green', 'Blue']].values/255.0, s=1)
    plt.gca().invert_yaxis()
    plt.axis('equal')
    plt.axis('off')
    
    caminho_salvamento = os.path.join('imagens', f"{nome_arquivo}.png")
    plt.savefig(caminho_salvamento)
    plt.close()

df_projeto = preparar_projeto()

M_identidade = np.array([[1, 0], [0, 1]])
M_escalonamento = np.array([[1.5, 0], [0, 0.5]])
M_cisalhamento = np.array([[1, 0.5], [0, 1]])
theta = math.radians(45)
M_rotacao = np.array([[math.cos(theta), -math.sin(theta)], [math.sin(theta), math.cos(theta)]])
M_reflexao = np.array([[-1, 0], [0, 1]])
M_colapso = np.array([[1, 0], [0, 0]])

processar_e_salvar(df_projeto, M_identidade, 'original')
processar_e_salvar(df_projeto, M_escalonamento, 'escalonamento')
processar_e_salvar(df_projeto, M_cisalhamento, 'cisalhamento')
processar_e_salvar(df_projeto, M_rotacao, 'rotacao')
processar_e_salvar(df_projeto, M_reflexao, 'reflexao')
processar_e_salvar(df_projeto, M_colapso, 'colapso_dimensional')