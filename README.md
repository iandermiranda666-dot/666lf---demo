666LF Win - Demo (arquivo único)
================================

Conteúdo:
- index.html : aplicação demo (frontend estática, usa localStorage)
- README.md : este arquivo

Como usar localmente:
1. Descompacte o ZIP (ex.: `unzip 666lf-demo.zip -d 666lf-demo`)
2. Abra `index.html` em um navegador moderno (Chrome/Edge/Firefox). Para funcionalidades completas, rode via servidor local:
   - Python 3: `python -m http.server 8000` (na pasta) e abra http://localhost:8000
3. Contas:
   - Admin: email `admin@666lf.win` senha `admin123`
   - Usuários: qualquer email/ senha — ao registrar, recebe saldo inicial de 1000 créditos
4. Observações:
   - Esta é uma DEMO estática: não use com dinheiro real. Todos os jogos são simulados no frontend.
   - Para subir no Vercel:
     - Crie um novo projeto e faça o deploy apontando para este repositório / pasta com `index.html`.
     - Ou faça upload do diretório contendo index.html no Vercel GUI.

Arquitetura:
- Single file HTML + JS para facilitar testes.
- Dados persistidos em localStorage (key: lf_users).

Bom teste!
