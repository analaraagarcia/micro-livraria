const express = require('express');
const shipping = require('./shipping');
const inventory = require('./inventory');
const cors = require('cors');

const app = express();
app.use(cors());

/**
 * Retorna a lista de produtos da loja via InventoryService
 */
app.get('/products', (req, res, next) => {
    // A API gRPC em Node.js costuma expor os métodos com a primeira letra em minúsculo.
    inventory.searchAllProducts(null, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json(data.products);
        }
    });
});

/**
 * Consulta o frete de envio no ShippingService
 */
app.get('/shipping/:cep', (req, res, next) => {
    const shippingFn = shipping.getShippingRate || shipping.GetShippingRate;
    if (!shippingFn) {
        console.error('gRPC method getShippingRate/GetShippingRate não encontrado');
        return res.status(500).send({ error: 'internal error' });
    }

    shippingFn.call(shipping, { cep: req.params.cep }, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else {
            res.json({
                cep: req.params.cep,
                value: data.value,
            });
        }
    });
});
app.get('/product/:id', (req, res, next) => {
    // Chama o método do microsserviço, usando o nome que estiver disponível.
    const searchFn = inventory.searchProductByID || inventory.searchProductById;

    if (!searchFn) {
        console.error('gRPC method searchProductByID/searchProductById não encontrado');
        return res.status(500).send({ error: 'internal error' });
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).send({ error: 'id inválido' });
    }

    searchFn.call(inventory, { id }, (err, product) => {
        // Se ocorrer algum erro de comunicação
        // com o microsserviço, retorna para o navegador.
        if (err) {
            console.error(err);
            res.status(500).send({ error: 'something failed :(' });
        } else if (!product || !product.id) {
            // Caso o produto não exista, retornamos 404.
            res.status(404).send({ error: 'produto não encontrado' });
        } else {
            // Caso contrário, retorna resultado do
            // microsserviço (um arquivo JSON) com os dados
            // do produto pesquisado
            res.json(product);
        }
    });
});

/**
 * Inicia o router
 */
app.listen(3000, () => {
    console.log('Controller Service running on http://127.0.0.1:3000');
});
