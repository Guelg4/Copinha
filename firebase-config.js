/* =========================================================
   firebase-config.js — Configuração do Firebase
   ========================================================= 

   COMO OBTER ESSAS CHAVES:
   1. Acesse https://console.firebase.google.com
   2. Crie um projeto novo (gratuito, plano "Spark")
   3. No menu lateral, clique em "Firestore Database" > "Criar banco de dados"
      - Escolha o modo "produção" e a região (ex: southamerica-east1)
   4. Em "Regras" do Firestore, cole isto (acesso liberado de leitura/escrita —
      simples e funcional para um app escolar; veja nota de segurança abaixo):

        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if true;
            }
          }
        }

   5. No menu lateral, clique no ícone de engrenagem > "Configurações do projeto"
   6. Em "Seus apps", clique em "Adicionar app" > ícone "</>" (Web)
   7. Dê um nome (ex: "copinha-web") e clique em "Registrar app"
   8. Copie os valores de firebaseConfig que aparecem e cole abaixo
   ========================================================= */



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAomJ1LUEl1eX-S-m_qLpXWBKnzFaeqTQw",
  authDomain: "copinha2026-242e3.firebaseapp.com",
  projectId: "copinha2026-242e3",
  storageBucket: "copinha2026-242e3.firebasestorage.app",
  messagingSenderId: "303347378305",
  appId: "1:303347378305:web:0ce21b97cf29be48104580"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* NOTA DE SEGURANÇA:
   As regras acima permitem que qualquer pessoa com o link do site leia e
   grave dados no banco. Isso é aceitável para um campeonato escolar simples,
   mas significa que alguém mal-intencionado que descubra a URL do Firestore
   poderia alterar dados sem fazer login no painel admin do site (o login
   "admin/org" é apenas uma trava na interface, não no banco).
   Se quiser mais segurança depois, me avise — dá para configurar o Firebase
   Authentication e regras que exigem login real para escrever dados. */
