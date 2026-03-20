const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const products = require('./products.json');

const packageDefinition = protoLoader.loadSync('proto/inventory.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
});

const inventoryProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// implementa os métodos do InventoryService
server.addService(inventoryProto.InventoryService.service, {
    // No servidor gRPC em Node.js os nomes de método são convertidos para camelCase.
    // Alguns nomes (como identidades ID) podem virar "Id" ou "ID" no cliente.
    // Para garantir que o controller funcione, definimos ambos.
    searchAllProducts: (_, callback) => {
        callback(null, {
            products: products,
        });
    },
    searchProductByID: (payload, callback) => {
        const id = payload.request.id;
        const book = products.find((product) => product.id == id);
        console.log(`Inventory: SearchProductByID called with id=${id} ->`, book ? 'found' : 'not found');
        callback(null, book);
    },
    searchProductById: (payload, callback) => {
        const id = payload.request.id;
        const book = products.find((product) => product.id == id);
        console.log(`Inventory: SearchProductById called with id=${id} ->`, book ? 'found' : 'not found');
        callback(null, book);
    },
});

server.bindAsync('127.0.0.1:3002', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Inventory Service running at http://127.0.0.1:3002');
    server.start();
});
