# Gestão de Membros

Considerando as constrições de tempo do projeto, e minha propria agenda nesta semana que esteve inteiramente ocupada, optei por realizar o desafio na metodologia Vibecode. Busquei entender as tecnologia solicitadas para o projeto, além de usar algumas outras fora do escopo, como autenticação via Bearer Token visando segurança. Tendo em mente o objetivo do projeto, utilizei o Codex da OpenAi, designei precisamente o escopo do projeto e realizei com ajuda da IA. Teria desenvolvido o projeto por conta propria sem uso de IA, estudando as tecnologias solicitas, mas utilizei para atender a restrição de tempo, e minha propria agenda.
Aplicação full stack para cadastro e listagem de membros, com validação de maioridade, CPF real, CPF único, alteração de status ativo/inativo, persistência em H2 em memória e comunicação protegida por Bearer Token.

## Tecnologias Utilizadas

Backend:

- Java 17
- Spring Boot 3.3.5
- Spring Web
- Spring Data JPA
- Spring Validation
- Spring Security
- Spring Security Crypto
- H2 Database
- Maven

Frontend:

- Node.js
- npm
- React 18
- TypeScript
- Vite
- Lucide React

## Pré-requisitos

Antes de rodar o projeto, instale:

- Git
- Java JDK 17
- Maven
- Node.js com npm

No Windows, usando Chocolatey:

```powershell
choco install git -y
choco install temurin17 -y
choco install maven -y
choco install nodejs-lts -y
```

Depois de instalar, feche e abra o terminal novamente. Confira:

```powershell
java -version
mvn -version
node -v
npm -v
git --version
```

## Como Baixar o Projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd <PASTA_DO_PROJETO>
```

Se você baixou o `.zip` pelo GitHub, extraia o arquivo e abra o terminal dentro da pasta raiz do projeto.

## Como Rodar o Backend

Abra um terminal na raiz do projeto e execute:

```bash
cd backend
mvn spring-boot:run
```

O backend ficará disponível em:

```text
http://localhost:8080
```

## Como Rodar o Frontend

Abra outro terminal na raiz do projeto e execute:

```bash
cd frontend
npm install
npm run dev
```

O frontend ficará disponível em:

```text
http://localhost:5173
```

Mantenha o backend rodando enquanto usa o frontend.

## Acesso ao Sistema

Ao abrir o frontend, faça login com:

```text
Usuário: admin
Senha: admin123
```

Após o login, o backend retorna um Bearer Token. O frontend guarda esse token em `sessionStorage` e envia nas chamadas protegidas:

```http
Authorization: Bearer <token>
```

Observação: o token protege o acesso aos endpoints. Em produção, o tráfego também deve usar HTTPS.

## Banco de Dados H2

O projeto usa H2 em memória. Os dados são apagados quando o backend é reiniciado.

Console H2:

```text
http://localhost:8080/h2-console
```

Configuração:

```text
JDBC URL: jdbc:h2:mem:membersdb
User Name: sa
Password: deixe em branco
```

## Endpoints Principais

Autenticação:

- `POST /api/auth/login`: autentica e retorna o token de acesso.

Membros:

- `POST /api/members`: cadastra um membro.
- `GET /api/members`: lista todos os membros.
- `GET /api/members/active`: lista apenas membros ativos.
- `PATCH /api/members/{id}/status`: altera o status ativo/inativo.

Exemplo de login:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Exemplo de cadastro:

```json
{
  "fullName": "Ana Beatriz Souza",
  "birthDate": "1995-04-22",
  "cpf": "529.982.247-25",
  "active": true
}
```

## Regras Implementadas

- Pessoas menores de 18 anos não podem ser cadastradas.
- A idade é calculada a partir da data de nascimento.
- O membro pode ser ativo ou inativo.
- O status pode ser alterado pela tela de listagem, com confirmação em popup.
- O CPF é validado pelo cálculo dos dígitos verificadores.
- CPFs duplicados são bloqueados.
- O CPF é salvo no banco apenas com números.
- A lista possui filtros por coluna e ordenação por clique.
- Quando não há membros cadastrados, a tela mostra um estado vazio com acesso ao cadastro.
- Os endpoints de membros exigem Bearer Token.

## Testes e Build

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm run build
```

## Solução de Problemas

Se `mvn` não for reconhecido:

```powershell
choco install maven -y
```

Feche e abra o terminal novamente, depois rode:

```powershell
mvn -version
```

Se `java` não for reconhecido:

```powershell
choco install temurin17 -y
```

Se `npm` não for reconhecido:

```powershell
choco install nodejs-lts -y
```

Se a porta `8080` ou `5173` estiver ocupada, encerre o processo que está usando a porta ou altere a porta da aplicação.
