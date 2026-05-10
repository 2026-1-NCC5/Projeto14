<div align="center">

# Projeto 14 - 🚀 LiderAI

### 💡 Inteligência Artificial a serviço da gestão humanitária

<img height="150" alt="LiderAI" src="https://github.com/user-attachments/assets/b0cf286e-2009-428a-8b20-5a4d9df4ebb9" /> &nbsp;&nbsp;&nbsp;&nbsp; <img height="150" alt="Logo FECAP" src="https://github.com/user-attachments/assets/01348b62-c4a4-43db-897b-15e4f8ed6a80" />

**FECAP - Fundação Escola de Comércio Álvares Penteado**

</div>

---

## 📝 Descrição

O **LiderAI** representa a evolução tecnológica da iniciativa **Lideranças Empáticas (LE)**, unindo impacto social, educação empreendedora e tecnologia para apoiar a gestão de campanhas de arrecadação de alimentos.

O projeto tem como objetivo automatizar parte do processo de triagem e contabilização das doações, reduzindo a dependência de registros manuais e tornando o acompanhamento das arrecadações mais rápido, organizado e confiável.

A solução utiliza **visão computacional com YOLO** para identificar alimentos por meio de câmera, webcam ou celular conectado. O sistema reconhece categorias como **arroz, feijão, macarrão, óleo, açúcar e fubá**, converte os nomes técnicos do modelo em nomes amigáveis e soma automaticamente o peso total arrecadado por categoria.

Além do módulo de Inteligência Artificial, o projeto conta com um **backend em Node.js hospedado no Azure App Service**, responsável pela comunicação com o banco de dados **MySQL hospedado na Aiven**, e uma interface web desenvolvida em **React com TypeScript e Vite**.

A interface permite acesso a funcionalidades como login, cadastro, dashboard, histórico, ranking, administração de grupos e acompanhamento dos dados enviados pela detecção por IA.

---

## ✅ Status atual do sistema

O sistema encontra-se funcional com a seguinte arquitetura:

```text
Frontend React/Vite
        ↓
Backend Node.js hospedado no Azure App Service
        ↓
Banco MySQL hospedado na Aiven
```

O módulo de Inteligência Artificial também foi ajustado para utilizar o backend em nuvem. Dessa forma, o detector não se conecta diretamente ao banco de dados. Ele executa localmente apenas porque depende de câmera, webcam, DroidCam ou outro dispositivo de vídeo conectado à máquina.

```text
Detector de IA local
        ↓
Backend Node.js hospedado no Azure App Service
        ↓
Banco MySQL hospedado na Aiven
```

### Estado atual dos módulos

- ✅ **Frontend:** funcional e configurado para consumir o backend hospedado no Azure.
- ✅ **Backend:** hospedado no Azure App Service e conectado ao banco MySQL da Aiven.
- ✅ **Banco de dados:** hospedado na Aiven, com tabelas para usuários, grupos e arrecadações.
- ✅ **Login e cadastro:** integrados ao backend online.
- ✅ **Administração:** permite visualizar usuários, criar grupos e alocar usuários em grupos.
- ✅ **Dashboard e histórico:** consomem os dados registrados no banco.
- ✅ **Detector de IA:** funcional localmente, buscando grupos pela API online e registrando arrecadações pela API online.
- ✅ **Detector sem credenciais locais de banco:** o script de IA não precisa de credenciais do banco para ser executado.
- ⚠️ **Execução do detector:** ainda precisa ser local, pois depende de câmera, webcam, DroidCam ou outro dispositivo de vídeo conectado à máquina.

---

## 👥 Integrantes

- [Arthur Paltrinieri Silva](https://www.linkedin.com/in/arthur-paltrinieri/)
- [Lucas Kenichi Soares Abe](https://www.linkedin.com/in/lucasskenichi/)
- [Pedro Della Rosa Antônio](https://www.linkedin.com/in/pedrodra/)
- [Pedro Dimitry Zyrianoff](https://www.linkedin.com/in/pedro-dimitry-zyrianoff-2223b1268/)

---

## 👨‍🏫 Professores Orientadores

- [Marcos Minoru Nakatsugawa](https://www.linkedin.com/in/marcosminorunakatsugawa/?locale=pt_BR)
- [Rafael Diogo Rossetti](https://www.linkedin.com/in/rafael-diogo-rossetti/?originalSubdomain=br)
- [Rodnil da Silva Moreira Lisboa](https://www.linkedin.com/in/professorrodnil/)
- [Rodrigo da Rosa](https://www.linkedin.com/in/rodrigo-da-rosa-phd/)
- [Victor Rosseti](https://www.linkedin.com/in/victorbarq/)

---

## 📌 Detalhes do Projeto

### 👁️ Visão Computacional

O módulo de visão computacional foi desenvolvido em **Python**, utilizando **YOLO**, **Ultralytics**, **OpenCV** e **NumPy**. Ele é responsável por detectar alimentos em tempo real a partir de uma câmera, webcam ou celular conectado.

As classes técnicas utilizadas no treinamento do modelo são convertidas para nomes amigáveis. Por exemplo, `1kg_rice_package` e `5kg_rice_package` são exibidas como **arroz**, com seus respectivos pesos somados automaticamente.

---

### ⚖️ Contagem e pesagem automática

O sistema contabiliza os alimentos detectados e soma o peso total por categoria. Dessa forma, se forem detectados dois pacotes de arroz de 1kg e um pacote de arroz de 5kg, o sistema exibirá o total de **7KG arroz**.

A mesma lógica é aplicada para os demais alimentos reconhecidos, como feijão, macarrão, óleo, açúcar e fubá.

---

### 🔁 Controle de duplicidade

Para evitar múltiplas contagens do mesmo item, foi implementada uma lógica simples de rastreamento. O sistema acompanha os objetos detectados ao longo dos frames e só contabiliza um alimento após ele permanecer visível por uma quantidade mínima de frames.

Essa estratégia reduz erros causados por oscilações da câmera, pequenas falhas momentâneas de detecção ou repetição do mesmo objeto em frames consecutivos.

---

### 🖥️ Backend

O backend foi desenvolvido em **Node.js** com **Express**, sendo responsável por organizar as rotas, controlar a comunicação com o banco de dados e registrar as informações das arrecadações.

Atualmente, o backend está hospedado no **Azure App Service** e se conecta a um banco **MySQL hospedado na Aiven**. Isso permite que o frontend e o detector de IA utilizem dados centralizados sem exigir que o usuário rode o backend localmente.

Os dados armazenados incluem informações como equipe, alimento detectado, quantidade, peso e data do registro.

---

### 🌐 Frontend

A interface web foi desenvolvida em **React com TypeScript**, utilizando **Vite** como ambiente de desenvolvimento.

O frontend está configurado para consumir o backend online hospedado no Azure. Dessa forma, para testar a interface web, o usuário precisa apenas instalar as dependências do frontend e executar o projeto localmente.

---

### 🧠 Detector de IA

O detector de IA é executado separadamente, pois depende de câmera, webcam ou celular conectado à máquina.

Ele busca os grupos cadastrados por meio da API online, permite selecionar a equipe responsável pela sessão e envia automaticamente os registros detectados para o backend hospedado no Azure.

O backend, por sua vez, registra os dados no banco MySQL hospedado na Aiven.

Assim, o detector não precisa acessar diretamente o banco de dados nem armazenar credenciais sensíveis localmente.

---

## 🗂️ Estrutura de Pastas

```text
Projeto14/
├── Documentos/
│   ├── Entrega 01/
│   └── Entrega 02/
│
├── src/
│   ├── Entrega 01/
│   └── Entrega 02/
│       ├── Inteligência Artificial e Aprendizado de Máquina/
│       ├── backend/
│       └── frontend/
│
├── .gitignore
└── README.md
```

---

## 📁 Descrição das principais pastas

📂 **Documentos:** reúne os arquivos relacionados às entregas das disciplinas do Projeto Interdisciplinar, como documentos, relatórios, evidências e materiais de apoio.

📂 **src:** contém os arquivos de implementação do projeto, separados por entrega.

📂 **src/Entrega 02/Inteligência Artificial e Aprendizado de Máquina:** contém o modelo de visão computacional, o script principal de detecção, o arquivo de dependências e a documentação específica do módulo de IA.

📂 **src/Entrega 02/backend:** contém a aplicação backend em Node.js, responsável pela comunicação com o banco de dados e organização das rotas. Atualmente, essa aplicação está hospedada no Azure App Service.

📂 **src/Entrega 02/frontend:** contém a interface web desenvolvida em React com TypeScript e Vite.

---

## 🛠️ Como executar o sistema atualmente

### Execução recomendada

Atualmente, para utilizar o sistema web, **não é necessário rodar o backend localmente**, pois ele já está hospedado no Azure.

O usuário precisa apenas rodar o frontend localmente.

---

## 🌐 Executar o frontend

### 1. Clonar o repositório

```bash
git clone https://github.com/2026-1-NCC5/Projeto14.git
```

```bash
cd Projeto14
```

---

### 2. Acessar a pasta do frontend

```bash
cd "src/Entrega 02/frontend"
```

---

### 3. Instalar as dependências

```bash
npm install
```

---

### 4. Executar o frontend

```bash
npm run dev
```

O Vite exibirá um endereço local, normalmente:

```text
http://localhost:5173
```

Acesse esse endereço no navegador.

O frontend já está configurado para consumir a API hospedada no Azure:

```text
https://liderai-backend-arthur-dmbmckczgbftg9hk.eastus-01.azurewebsites.net
```

Assim, o usuário não precisa configurar banco de dados, backend local ou credenciais para testar a interface web.

---

## 👁️ Executar o módulo de Visão Computacional

O módulo de IA deve ser executado localmente, pois depende do acesso a uma câmera, webcam, DroidCam ou outro dispositivo de vídeo conectado.

Mesmo sendo executado localmente, o detector utiliza o backend hospedado no Azure para buscar grupos e registrar arrecadações.

### 1. Acessar a pasta do módulo de IA

```bash
cd "src/Entrega 02/Inteligência Artificial e Aprendizado de Máquina"
```

---

### 2. Instalar as dependências

```bash
pip install -r requirements.txt
```

---

### 3. Executar o detector

Usando a câmera principal:

```bash
python yolo_detect.py --source usb0 --model my_model.pt --thresh 0.5 --resolution 1280x720
```

Para câmera externa, DroidCam ou outro dispositivo de vídeo:

```bash
python yolo_detect.py --source usb1 --model my_model.pt --thresh 0.5 --resolution 1280x720
```

Durante a execução, o sistema abrirá uma janela para selecionar o grupo responsável pela contagem. Os grupos são buscados diretamente pela API hospedada no Azure.

Após a detecção dos alimentos, os registros são enviados para o backend online, que realiza o cadastro no banco MySQL da Aiven. Os dados poderão ser visualizados no dashboard e no histórico da interface web.

---

## ⚙️ Ferramentas e Tecnologias

### Desenvolvimento principal

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### Inteligência Artificial e Visão Computacional

![YOLO](https://img.shields.io/badge/YOLO-00FFFF?style=for-the-badge&logoColor=black)
![Ultralytics](https://img.shields.io/badge/Ultralytics-111F68?style=for-the-badge&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![Label Studio](https://img.shields.io/badge/Label%20Studio-FF7557?style=for-the-badge&logoColor=white)
![Google Colab](https://img.shields.io/badge/Google%20Colab-F9AB00?style=for-the-badge&logo=googlecolab&logoColor=black)

### Banco de dados e backend

![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Aiven](https://img.shields.io/badge/Aiven-FF4A00?style=for-the-badge&logoColor=white)
![Azure](https://img.shields.io/badge/Azure%20App%20Service-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![REST API](https://img.shields.io/badge/REST%20API-000000?style=for-the-badge&logoColor=white)

### Organização e versionamento

![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Scrum](https://img.shields.io/badge/Scrum-009FDA?style=for-the-badge&logoColor=white)
![Kanban](https://img.shields.io/badge/Kanban-0052CC?style=for-the-badge&logo=trello&logoColor=white)

---

## 📊 Funcionalidades principais

- Detecção de alimentos por visão computacional.
- Conversão de classes técnicas do modelo para nomes amigáveis.
- Soma automática de peso por categoria de alimento.
- Redução de duplicidade por rastreamento simples entre frames.
- Registro das contagens por equipe em banco de dados MySQL.
- Detector de IA integrado ao backend em nuvem.
- Backend em Node.js hospedado no Azure.
- Banco de dados MySQL hospedado na Aiven.
- Interface web em React com TypeScript.
- Login e cadastro integrados ao backend.
- Administração de grupos e usuários.
- Visualização de informações em dashboard, histórico e ranking.

---

## 📦 Alimentos reconhecidos

O modelo considera classes associadas aos seguintes alimentos:

```text
arroz
feijão
macarrão
óleo
açúcar
fubá
```

As classes técnicas do modelo são convertidas para esses nomes durante a execução do detector.

---

## 🔐 Observações de segurança

- O frontend consome o backend hospedado no Azure.
- O detector de IA não utiliza credenciais locais de banco.
- As credenciais do banco ficam configuradas diretamente no Azure App Service, como variáveis do ambiente de produção do backend.

---

## 📄 Licença

LiderAI © 2026 by Arthur Paltrinieri Silva, Lucas Kenichi Soares Abe, Pedro Della Rosa Antônio e Pedro Dimitry Zyrianoff.

Este projeto foi desenvolvido para fins acadêmicos no curso de Ciência da Computação da FECAP, no contexto do Projeto Interdisciplinar do 5º semestre.
