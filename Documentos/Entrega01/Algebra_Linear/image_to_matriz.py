from PIL import Image
import numpy as np
import pandas as pd

# 1. Carregar a imagem original
img = Image.open('images/feijao_camil.jpg').convert('RGB')

# 2. Redimensionar para 200x200 (Equilíbrio entre qualidade e performance)
img_balanço = img.resize((200, 200)) 

# 3. Transformar em matriz NumPy
matriz_rgb = np.array(img_balanço)

# 4. Aplanar para o CSV (Pixels x 3 Cores)
pixels_planos = matriz_rgb.reshape(-1, 3)
df = pd.DataFrame(pixels_planos, columns=['Red', 'Green', 'Blue'])

# 5. Salvar os arquivos
df.to_csv('matriz_imagem_alimento.csv', index=False)
np.save('matriz_binaria.npy', matriz_rgb)

print("Matriz de 200x200 exportada! Qualidade ótima para o relatório.")