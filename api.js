// Importação de módulos necessários
const express = require('express'); // Framework para construção de APIs
const fs = require('fs'); // Manipulação de arquivos
const path = require('path'); // Trabalhar com caminhos de arquivos

const app = express();
const PORT = 3000;

// Caminho para o arquivo JSON
const filePath = path.join(__dirname, 'clientes.json');

// Middleware para permitir o uso de JSON no corpo das requisições
app.use(express.json());

/**
 * Função para carregar os dados do arquivo clientes.json
 */
const loadData = () => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Erro ao carregar o arquivo:", error);
        return [];
    }
};

/**
 * Função para salvar os dados no arquivo clientes.json
 */
const saveData = (data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
    } catch (error) {
        console.error("Erro ao salvar o arquivo:", error);
    }
};

/**
 * Rota GET /clientes
 * Retorna todos os clientes
 */
app.get('/clientes', (req, res) => {
    const clientes = loadData();
    res.json(clientes);
});

/**
 * Rota GET /clientes/:id
 * Retorna um cliente específico pelo ID
 */
app.get('/clientes/:id', (req, res) => {
    const clientes = loadData();
    const cliente = clientes.find(c => c.cliente_id === parseInt(req.params.id));

    if (cliente) {
        res.json(cliente);
    } else {
        res.status(404).json({ mensagem: "Cliente não encontrado" });
    }
});

/**
 * Rota POST /clientes
 * Adiciona um novo cliente
 */
app.post("/clientes", (req, res) => {
    const clientes = loadData();
    const { nome, endereço, cep, data_de_nascimento, telefone } = req.body;

    // Validação dos campos obrigatórios
    if (!nome || !endereço || !cep || !data_de_nascimento || !telefone) {
        return res.status(400).json({
            mensagem: "Erro: Todos os campos (nome, endereço, cep, data_de_nascimento, telefone) são obrigatórios."
        });
    }

    // Criação do novo cliente
    const novoCliente = {
        cliente_id: clientes.length > 0 ? clientes[clientes.length - 1].cliente_id + 1 : 1,
        nome,
        endereço,
        cep,
        data_de_nascimento,
        telefone
    };

    clientes.push(novoCliente);
    saveData(clientes);

    res.status(201).json({ mensagem: "Cliente adicionado com sucesso", cliente: novoCliente });
});

/**
 * Rota PUT /clientes/:id
 * Atualiza os dados de um cliente existente
 */
app.put('/clientes/:id', (req, res) => {
    const clientes = loadData();
    const clienteId = parseInt(req.params.id);
    const index = clientes.findIndex(c => c.cliente_id === clienteId);

    if (index !== -1) {
        clientes[index] = { ...clientes[index], ...req.body };
        saveData(clientes);
        res.json({ mensagem: "Cliente atualizado com sucesso", cliente: clientes[index] });
    } else {
        res.status(404).json({ mensagem: "Cliente não encontrado" });
    }
});

/**
 * Rota DELETE /clientes/:id
 * Remove um cliente existente
 */
app.delete('/clientes/:id', (req, res) => {
    const clientes = loadData();
    const clienteId = parseInt(req.params.id);
    const novosClientes = clientes.filter(c => c.cliente_id !== clienteId);

    if (clientes.length !== novosClientes.length) {
        saveData(novosClientes);
        res.json({ mensagem: "Cliente removido com sucesso" });
    } else {
        res.status(404).json({ mensagem: "Cliente não encontrado" });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});
