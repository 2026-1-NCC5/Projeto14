# 👁️ Detector - Lideranças Empáticas  
## Módulo de Visão Computacional

Este diretório contém o modelo de visão computacional treinado com YOLO para identificação de alimentos arrecadados, como arroz, feijão, espaguete, óleo, açúcar, fubá e massas.

Este módulo faz parte da **Entrega 02 do Projeto Interdisciplinar LiderAI**, na área de **Inteligência Artificial e Aprendizado de Máquina**.

---

## 📁 Estrutura do Diretório

```text
Inteligência Artificial e Aprendizado de Máquina/
├── yolo_detect.py
├── my_model.pt
├── requirements.txt
└── README.md
```

---

## 🛠️ Pré-requisitos

Antes de rodar o projeto, certifique-se de ter o **Python** instalado.

Para instalar as dependências necessárias, abra o terminal nesta pasta e execute:

```bash
pip install -r requirements.txt
```

---

## ▶️ Como Executar

O script deve ser executado informando a origem da imagem pelo parâmetro `--source`.

### Usando Webcam como câmera

```bash
python yolo_detect.py --source usb0
```

### Usando câmera externa ou outro dispositivo

```bash
python yolo_detect.py --source usb1
```

A numeração `usb0` ou `usb1` pode variar conforme o reconhecimento dos dispositivos pelo sistema operacional.

Também é possível informar manualmente o modelo, a confiança mínima e a resolução:

```bash
python yolo_detect.py --model my_model.pt --source usb0 --thresh 0.5 --resolution 1280x720
```

---

## ⚙️ Parâmetros Principais

| Parâmetro | Descrição | Exemplo |
|---|---|---|
| `--model` | Caminho do modelo YOLO treinado | `my_model.pt` |
| `--source` | Fonte de imagem, vídeo ou câmera | `usb0`, `usb1` |
| `--thresh` | Confiança mínima da detecção | `0.5` |
| `--resolution` | Resolução da execução | `1280x720` |

---

## 📦 Alimentos Detectados

O modelo foi treinado para reconhecer itens como:

```text
arroz
feijão
espaguete
óleo
açúcar
fubá
massas
```

---

## 📌 Observações

- O arquivo `my_model.pt` contém o modelo treinado.
- O arquivo `yolo_detect.py` é o script principal de execução.
- O parâmetro `usb0` foi utilizado para execução com a Webcam.
- O parâmetro `usb1` pode ser usado para uma câmera externa ou outro dispositivo de vídeo.
- O arquivo `yolo_detect.py` é o script principal de execução.
- O parâmetro `usb0` foi utilizado para execução com celular.
- O parâmetro `usb1` pode ser usado para uma câmera externa ou outro dispositivo de vídeo.
