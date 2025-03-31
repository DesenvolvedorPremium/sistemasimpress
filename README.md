Um site hospedado no Render com um banco de dados Firebase Firestore, permitindo armazenar e recuperar informações diretamente do frontend, sem necessidade de backend.

🚀 Tecnologias Utilizadas
✔️ HTML, CSS, JavaScript → Interface do usuário
✔️ Firebase Firestore → Banco de dados na nuvem
✔️ Render → Hospedagem gratuita do site

📂 Estrutura do Projeto
bash
Copiar
Editar
/meu-projeto
│── index.html      # Página principal
│── styles.css      # Estilos do site
│── script.js       # Lógica e conexão com Firebase
│── README.md       # Documentação do projeto
🌐 Como Rodar o Projeto?
1️⃣ Acesse a versão online:
📌 Link do site no Render

2️⃣ Rodando Localmente:
Clone o repositório:

sh
Copiar
Editar
git clone https://github.com/seu-usuario/seu-repositorio.git
Abra o index.html no navegador.

O site já estará rodando! 🚀

⚡ Configuração do Firebase
Para usar o Firebase Firestore, siga estes passos:

Crie um projeto no Firebase Console.

Vá em Configuração Web e copie suas credenciais Firebase.

No arquivo script.js, substitua esta parte com suas credenciais:

js
Copiar
Editar
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_ID",
    appId: "SEU_APP_ID"
};
🛠 Funcionalidades
✅ Cadastro de usuários no Firebase
✅ Listagem de usuários cadastrados
✅ Hospedagem gratuita no Render

📄 Licença
Este projeto está sob a licença MIT – sinta-se à vontade para usar e modificar.

