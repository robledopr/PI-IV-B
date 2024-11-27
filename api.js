const express = require('express'); // Framework para construção de APIs
const fs = require('fs'); // Manipulação de arquivos

const app = express();

app.use(express.json()); // Middleware para permitir o uso de JSON no corpo das requisições

const getClientesData = () => { // Função para carregar os dados do arquivo clientes.json
    const jsonData = fs.readFileSync('clientes.json');
    return JSON.parse(jsonData);
};

const saveClientData = data => { // Função para salvar os dados no arquivo clientes.json
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('clientes.json', stringifyData)
};

app.get('/clientes', (req, res) => {    // Retorna todos os clientes
    const clientes = getClientesData();
    res.json(clientes);
});

app.get('/clientes/:id', (req, res) => { // Retorna um cliente específico pelo ID
    const clientes = getClientesData();
    const cliente = clientes.find(c => c.cliente_id === parseInt(req.params.id));

    if (cliente) {
        res.json(cliente);
    } else {
        res.status(404).json({ mensagem: "Cliente não encontrado" });
    }
});

app.post("/clientes", (req, res) => { // Adiciona um novo cliente
    const clientes = getClientesData();
    const { nome, endereço, cep, data_de_nascimento, telefone } = req.body;

    if (!nome || !endereço || !cep || !data_de_nascimento || !telefone) {
        return res.status(400).json({
            mensagem: "Erro: Todos os campos (nome, endereço, cep, data_de_nascimento, telefone) são obrigatórios."
        });
    }

    const novoCliente = {
        cliente_id: clientes.length > 0 ? clientes[clientes.length - 1].cliente_id + 1 : 1,
        nome,
        endereço,
        cep,
        data_de_nascimento,
        telefone
    };

    clientes.push(novoCliente);
    saveClientData(clientes);

    res.status(201).json({ mensagem: "Cliente adicionado com sucesso", cliente: novoCliente });
});

app.put('/clientes/:id', (req, res) => { // Atualiza os dados de um cliente existente
    const clientes = getClientesData();
    const clienteId = parseInt(req.params.id);
    const index = clientes.findIndex(c => c.cliente_id === clienteId);

    if (index !== -1) {
        clientes[index] = { ...clientes[index], ...req.body };
        saveClientData(clientes);
        res.json({ mensagem: "Cliente atualizado com sucesso", cliente: clientes[index] });
    } else {
        res.status(404).json({ mensagem: "Cliente não encontrado" });
    }
});

app.delete('/clientes/:id', (req, res) => { // Remove um cliente existente
    const clientes = getClientesData();
    const clienteId = parseInt(req.params.id);
    const novosClientes = clientes.filter(c => c.cliente_id !== clienteId);

    if (clientes.length !== novosClientes.length) {
        saveClientData(novosClientes);
        res.json({ mensagem: "Cliente removido com sucesso" });
    } else {
        res.status(404).json({ mensagem: "Cliente não encontrado" });
    }
});

app.listen(3000, () => { // Inicia o servidor
    console.log('API rodando na porta 3000');
});
