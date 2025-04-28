app.get('/confidential-data', (req, res) => {
    // autenticação
    const authHeader = req.headers.autorization;

    if (!authHeader || authHeader !== 'Bearer meu-token-seguro') {
        // Retorna 401 se não autorizado
        return res.status(401).json({ message: 'Acesso não autorizado.' });
    }

    //executa um serviço fictício para obter os dados a serem retornados
    jsonData = service.call(req)

    //retorna os dados
    if (req != null) {
        res.json(jsonData)
    }
});