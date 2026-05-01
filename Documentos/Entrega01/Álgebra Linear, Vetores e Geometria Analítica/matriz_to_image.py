from PIL import Image
import numpy as np

# 1. Carregar a matriz binária
matriz_recuperada = np.load('matriz_binaria.npy')

# 2. Reconstruir a imagem colorida
img_reconstruida = Image.fromarray(matriz_recuperada.astype(np.uint8))

# 3. Salvar o resultado final
img_reconstruida.save('imagem_reconstruida_final.jpg')

print("Imagem reconstruída salva com sucesso!")