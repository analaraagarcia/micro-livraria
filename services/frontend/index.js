// Função que cria o "card" do livro no HTML
function createBookCard(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';
    
    // Ajuste do caminho da imagem: removemos a barra inicial se existir
    // para garantir que ele procure na pasta relativa 'img/'
    const photoPath = (book.photo || '').startsWith('/') ? (book.photo || '').substring(1) : (book.photo || '');
    
    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img src="${photoPath}" alt="${book.name}" />
                </figure>
            </div>
            <div class="card-content">
                <div class="content book" data-id="${book.id}">
                    <div class="book-meta">
                        <p class="is-size-4">R$${book.price.toFixed(2)}</p>
                        <p class="is-size-7">Estoque: ${book.quantity}</p>
                        <h4 class="is-size-3 title">${book.name}</h4>
                        <p class="subtitle">${book.author}</p>
                    </div>
                    <button class="button button-buy is-success is-fullwidth">Comprar</button>
                </div>
            </div>
        </div>`;

    // Mantém o comportamento de compra: mostra uma mensagem ao usuário
    const buyBtn = div.querySelector('.button-buy');
    buyBtn.addEventListener('click', () => {
        swal('Compra simulada', `Você comprou: ${book.name}`, 'success');

        // Se o usuário já tiver informado um CEP, calcula o frete automaticamente
        const cepInput = document.getElementById('shipping-cep');
        if (cepInput && cepInput.value.trim().length > 0) {
            fetchShipping(cepInput.value.trim());
        }
    });

    return div;
}

// Função para buscar dados da API
function fetchBooks(url) {
    const resultContainer = document.getElementById('book-result');
    
    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`Status ${res.status} ${res.statusText}`);
            return res.json();
        })
        .then(data => {
            resultContainer.innerHTML = '';
            
            // Tratamento: Se vier um array (lista) ou um objeto único (busca por ID)
            const list = Array.isArray(data) ? data : [data];

            if (list.length === 0 || !list[0]) {
                swal("Aviso", "Nenhum livro encontrado.", "info");
                return;
            }

            list.forEach(book => {
                resultContainer.appendChild(createBookCard(book));
            });
        })
        .catch(err => {
            resultContainer.innerHTML = '';
            swal("Erro", `Livro não encontrado ou erro na API.\n(${err.message})`, "error");
            console.error('fetchBooks error:', err);
        });
}

// Função para calcular frete
function fetchShipping(cep) {
    if (!cep) {
        swal('Aviso', 'Informe o CEP para calcular o frete.', 'info');
        return;
    }

    fetch(`http://localhost:3000/shipping/${encodeURIComponent(cep)}`)
        .then(res => {
            if (!res.ok) throw new Error(`Status ${res.status} ${res.statusText}`);
            return res.json();
        })
        .then(data => {
            swal('Frete calculado', `CEP: ${cep}\nValor do frete: R$ ${Number(data.value).toFixed(2)}`, 'success');
        })
        .catch(err => {
            swal('Erro', `Não foi possível calcular o frete.\n(${err.message})`, 'error');
            console.error('fetchShipping error:', err);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    // 1. Carrega todos os livros ao abrir a página
    fetchBooks('http://localhost:3000/products');

    const btnSearch = document.getElementById('btn-search');
    const inputSearch = document.getElementById('search-id');
    const btnShipping = document.getElementById('btn-shipping');
    const inputCep = document.getElementById('shipping-cep');

    // 2. Lógica do botão de busca por ID
    btnSearch.addEventListener('click', function () {
        const id = inputSearch.value;
        if (!id) {
            fetchBooks('http://localhost:3000/products'); // Se vazio, mostra todos
            return;
        }
        // Chamada ao endpoint que você testou no Item 1
        fetchBooks(`http://localhost:3000/product/${id}`);
    });

    // 3. Cálculo de frete via CEP
    btnShipping.addEventListener('click', function () {
        fetchShipping(inputCep.value);
    });
});
