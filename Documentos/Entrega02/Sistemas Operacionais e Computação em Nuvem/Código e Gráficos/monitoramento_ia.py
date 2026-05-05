import psutil
import time
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import IsolationForest

print("Iniciando monitoramento de recursos da VM...")

# 1. COLETA DE DADOS (MONITORAMENTO)
dados = []
tempos = list(range(1, 61)) # Monitorar por 60 segundos

for t in tempos:
    cpu = psutil.cpu_percent(interval=1)
    ram = psutil.virtual_memory().percent
    # Regra de alerta artificial para o KNN treinar (1 = Alerta, 0 = Normal)
    alerta = 1 if cpu > 20 or ram > 60 else 0
    dados.append([t, cpu, ram, alerta])

df = pd.DataFrame(dados, columns=['Tempo', 'CPU', 'RAM', 'Alerta'])

# Preparando a figura 2x2 para os 4 gráficos
fig, axs = plt.subplots(2, 2, figsize=(14, 10))


# 1 - REGRESSÃO LINEAR (Tendência de CPU)

X_tempo = df[['Tempo']]
y_cpu = df['CPU']

modelo_lr = LinearRegression()
modelo_lr.fit(X_tempo, y_cpu)
tendencia_cpu = modelo_lr.predict(X_tempo)

axs[0, 0].plot(df['Tempo'], df['CPU'], label='Uso Real de CPU (%)', marker='o')
axs[0, 0].plot(df['Tempo'], tendencia_cpu, color='red', linestyle='--', label='Tendência (LR)')
axs[0, 0].set_title('Ex. 1: Tendência de CPU (Regressão Linear)')
axs[0, 0].set_xlabel('Tempo (s)')
axs[0, 0].set_ylabel('Uso CPU (%)')
axs[0, 0].legend()


# 2 - K-MEANS (Clusterização de Estados)

X_cluster = df[['CPU', 'RAM']]
kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
df['Cluster'] = kmeans.fit_predict(X_cluster)

cores_kmeans = ['blue' if c == 0 else 'orange' for c in df['Cluster']]
axs[0, 1].scatter(df['CPU'], df['RAM'], c=cores_kmeans, s=50)
centros = kmeans.cluster_centers_
axs[0, 1].scatter(centros[:, 0], centros[:, 1], c='red', s=200, marker='X', label='Centróides')
axs[0, 1].set_title('Ex. 2: Agrupamento de Estados (K-Means)')
axs[0, 1].set_xlabel('Uso CPU (%)')
axs[0, 1].set_ylabel('Uso RAM (%)')
axs[0, 1].legend()


# 3 - K-NEIGHBORS CLASSIFIER (Previsão de Alertas)

X_train = df[['CPU', 'RAM']][:40]
y_train = df['Alerta'][:40]
X_test = df[['CPU', 'RAM']][40:]
y_test = df['Alerta'][40:]

knn = KNeighborsClassifier(metric="manhattan", n_neighbors=3)
knn.fit(X_train, y_train)
predicoes_knn = knn.predict(X_test)

axs[1, 0].plot(df['Tempo'][40:], y_test, label='Alerta Real', drawstyle='steps-pre')
axs[1, 0].plot(df['Tempo'][40:], predicoes_knn, label='Previsto (KNN)', linestyle='--', color='red', drawstyle='steps-pre')
axs[1, 0].set_title('Ex. 3: Previsão de Regras de Alerta (KNN)')
axs[1, 0].set_xlabel('Tempo (s)')
axs[1, 0].set_yticks([0, 1])
axs[1, 0].set_yticklabels(['Normal', 'Alerta'])
axs[1, 0].legend()


# 4 - ISOLATION FOREST (Detecção de Anomalias)

# Contamination define a proporção esperada de anomalias (ex: 5%)
iso_forest = IsolationForest(contamination=0.05, random_state=42)
df['Anomalia'] = iso_forest.fit_predict(df[['CPU', 'RAM']])

# O algoritmo retorna -1 para anomalias e 1 para dados normais
cores_iso = ['red' if a == -1 else 'green' for a in df['Anomalia']]
axs[1, 1].scatter(df['Tempo'], df['CPU'], c=cores_iso, s=50)
axs[1, 1].set_title('Ex. 4: Detecção de Anomalias (Isolation Forest)')
axs[1, 1].set_xlabel('Tempo (s)')
axs[1, 1].set_ylabel('Uso CPU (%)')

# Criando legenda manual para o scatter plot
from matplotlib.lines import Line2D
legend_elements = [Line2D([0], [0], marker='o', color='w', markerfacecolor='green', markersize=8, label='Normal'),
                   Line2D([0], [0], marker='o', color='w', markerfacecolor='red', markersize=8, label='Anomalia')]
axs[1, 1].legend(handles=legend_elements)

plt.tight_layout()
plt.savefig('graficos_monitoramento_ia.png')
print("Monitoramento concluído! O painel foi salvo em 'graficos_monitoramento_ia.png'.")
