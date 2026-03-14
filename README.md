# 💳 API de pagamentos multi-gateway - Teste backend BeTalent

## 🔧 Tecnologias usadas:
- **Framework:** AdonisJS 6.18.0 ( Node.js )
- **Linguagem de Programação:** Typescript
- **Banco de dados:** MySQL
- **ORM:** Prisma
- **Validação:** Zod
---

## ⚙️ Rodando o projeto localmente:
### Requisitos:
- Node.js v22.15.0 ou superior ( Recomendado )
- Docker
- Docker-compose

### Como rodar:
```bash
# Clone esse repositório para sua máquina e entre no diretório
$ git clone https://github.com/speedlightzx/teste-pratico-backend

# Instale as dependências do projeto ( para poder seedar o banco )
$ npm install

# Suba todos os containeres
$ docker-compose up -d

# Após subir os containeres, gere o schema Prisma, e atualize o banco de dados
$ npx prisma generate
$ npx prisma db push

# Por fim, seede o banco de dados
$ node ace seed:database
```
Depois de subir os containeres, os serviços ficarão disponíveis nas seguintes URIs:
- API: `http://localhost:3333`
- Mocks: `http://localhost:3001` e `http://localhost:3002`
- MySQL: `mysql://localhost:3306`
---

## 🗃️ Rotas da aplicação:
### 🔓 Rotas públicas:

**Realizando login na aplicação**
```http 
POST /login
```
```json
{
  "email": "insira_email_aqui@gmail.com",
  "password": "insira_senha_aqui"
}
```
- email: email cadastrado de um usuário no banco de dados
- senha: senha cadastrada de um usuário no banco de dados

_Tente fazer login com essas credenciais depois de seedar o banco:_
- **User:** user@gmail.com, user
- **Finance:** finance@gmail.com, 456
- **Manager:** manager@gmail.com, abc
- **Admin:** admin@gmail.com, 123

Para acessar as rotas privadas, envie um header **Authorization** com o token!
```bash
  Authorization: Bearer {token}
```

**Realizando uma compra**
```http 
POST /purchases
```

```json
{
  "products": [{ "productId": 1, "quantity": 1 }, { "productId": 3, "quantity": 5 }],
  "name": "insira_nome_aqui",
  "email": "insira_email_aqui",
  "cardNumber": "insira_numeroDoCartao_aqui",
  "cvv": "insira_cvv_aqui"
}
```
- products: array de objetos que contém um id de um produto cadastrado e a quantidade.
- name: nome do cliente que está comprando
- email: email do cliente que será atribuido a uma transação no banco de dados
- cardNumber: número do cartão do cliente( 16 digitos )
- cvv: cvv do número do cartão do cliente( ao enviar 200 e 300 é simulado erros nos gateways )

### 🔐 Rotas privadas:
**Listar todos os produtos cadastrados ( Finance ou superior )**
```http 
GET /products
```

**Recebe os detalhes de um produto em especifico ( Finance ou superior )**
```http 
GET /products/:id
```

**Adicionar novo produto ( Finance ou superior )**
```http 
POST /products
```

```json
{
  "name": "Produto teste",
  "amount": 8.99
}
```
- name: nome do produto
- amount: preço do produto

**Atualizar um produto existente ( Finance ou superior )**
```http 
PUT /products/:id
```

```json
{
  "name": "Produto atualizado",
  "amount": 5.99
}
```
_Ambos os campos são opcionais._

**Remover um produto existente ( Finance ou superior )**
```http 
DELETE /products/:id
```

**Listar todos os clientes ( Finance ou superior )**
```http 
GET /clients
```

**Listar um cliente específico ( Finance ou superior )**
```http 
GET /clients/:id
```

**Listar todas as transações ( Finance ou superior )**
```http 
GET /purchases
```

**Listar uma transação específica ( Finance ou superior )**
```http 
GET /purchases/:id
```

**Reembolsar uma transação ( Finance ou superior )**
```http 
POST /purchases/refund
```

```json
{
  "id": "3d15e8ed-6131-446e-a7e3-456728b1211f"
}
```
- id: id da transação para reembolsar

**Listar todos os usuários ( Manager ou superior )**
```http 
GET /users
```

**Listar um usuário específico ( Manager ou superior )**
```http 
GET /users/:id
```

**Adicionar um novo usuário ( Manager ou superior )**
```http 
POST /users
```

```json
{
  "email": "email@gmail.com",
  "password": "senha123",
  "role": "User"
}
```
- email: email do usuário a ser cadastrado
- password: senha do usuário a ser cadastrado
- role: role do usuário a ser cadastrado ( User, Finance, Manager, Admin )

**Atualizar um usuário existente ( Manager ou superior )**
```http 
PUT /users/:id
```

```json
{
  "email": "email@gmail.com",
  "password": "senha123",
  "role": "User"
}
```
_Todos os campos são opcionais._

**Deletar um usuário existente ( Manager ou superior )**
```http 
DELETE /users/:id
```

**Alterar status de gateway ( Admin ou superior )**
```http 
POST /gateways/:id/status
```

```json
{
  "status": true
}
```
- status: altera o status do gateway. `true` ativa o gateway, e `false` desativa o gateway.

**Alterar prioridade de gateway ( Admin ou superior )**
```http 
POST /gateways/:id/priority
```

```json
{
  "priority": "High"
}
```
- priority: altera a prioridade do gateway. ( High, Medium, Low )

**Listar todos os gateways ( Admin ou superior )**
```http 
GET /gateways
```