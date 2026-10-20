let todosProdutos = [];
let filtroAtivo = "todos";

document.addEventListener("DOMContentLoaded", async function () {
    // Carrega dados direto da nuvem
    await carregarDadosDaNuvemParaVitrine();

    const nomeLojaSalvo = localStorage.getItem('nome_loja_vittoriana');
    if (nomeLojaSalvo) {
        const tituloMarca = document.getElementById('vitrine-titulo-loja');
        if (tituloMarca) tituloMarca.innerText = nomeLojaSalvo;
    }

    verificarValidadeAssinaturaAtiva();
    renderizarPilulasFiltros();
    aplicarFiltrosEBusca();
});

async function carregarDadosDaNuvemParaVitrine() {
    const dadosNuvem = await carregarDadosDaNuvem();
    if (dadosNuvem) {
        todosProdutos = dadosNuvem.produtos || [];
        todosProdutos.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

        if (dadosNuvem.clientes) {
            try {
                localStorage.setItem('clientes_cadastrados', JSON.stringify(JSON.parse(descriptografar(dadosNuvem.clientes))));
            } catch (e) {}
        }
        if (dadosNuvem.config) {
            if (dadosNuvem.config.nome) localStorage.setItem('nome_loja_vittoriana', dadosNuvem.config.nome);
            if (dadosNuvem.config.dias) localStorage.setItem('dias_validade_assinatura', dadosNuvem.config.dias);
        }
    }
}

function verificarValidadeAssinaturaAtiva() {
    const logado = localStorage.getItem('usuario_assinante_logado') === 'true';
    if (!logado) return;

    const whatsappLogado = localStorage.getItem('cliente_logado_whatsapp');
    const clientes = JSON.parse(localStorage.getItem('clientes_cadastrados')) || [];
    const cliente = clientes.find(c => c.whatsapp === whatsappLogado);

    if (cliente && cliente.vencimento) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const partesVenc = cliente.vencimento.split('-');
        const dataVenc = new Date(partesVenc[0], partesVenc[1] - 1, partesVenc[2]);

        if (dataVenc < hoje) {
            localStorage.removeItem('usuario_assinante_logado');
            localStorage.removeItem('cliente_logado_nome');
            localStorage.removeItem('cliente_logado_whatsapp');
            alert("⚠️ Sua assinatura expirou! Por favor, entre em contato para renovar o acesso ao clube.");
        }
    }
}

function renderizarPilulasFiltros() {
    const containerPilulas = document.getElementById("container-pilulas-filtros");
    if (!containerPilulas) return;

    const filtrosSalvos = ['Camisa', 'Blusa', 'Vestido', 'Calça']; // Filtros padrão ou busca do array

    let htmlPilulas = `<button class="pilula-filtro ativa" onclick="selecionarFiltro('todos', this)">Todos</button>`;

    filtrosSalvos.forEach(filtro => {
        htmlPilulas += `<button class="pilula-filtro" onclick="selecionarFiltro('${filtro}', this)">${filtro}</button>`;
    });

    containerPilulas.innerHTML = htmlPilulas;
}

window.selecionarFiltro = function (nomeFiltro, elemento) {
    filtroAtivo = nomeFiltro;
    document.querySelectorAll('.pilula-filtro').forEach(p => p.classList.remove('ativa'));
    elemento.classList.add('ativa');
    aplicarFiltrosEBusca();
};

window.aplicarFiltrosEBusca = function () {
    const container = document.getElementById("vitrine-produtos");
    const termoBusca = document.getElementById("campo-busca-vitrine").value.toLowerCase().trim();

    if (!container) return;

    if (todosProdutos.length === 0) {
        container.innerHTML = `<div class="aviso-vazio">Nenhum produto cadastrado na vitrine no momento.</div>`;
        return;
    }

    const produtosFiltrados = todosProdutos.filter(prod => {
        const passaNoFiltro = (filtroAtivo === 'todos') || (prod.filtros && prod.filtros.includes(filtroAtivo));
        const textoNome = (prod.nome || '').toLowerCase();
        const textoDesc = (prod.descricao || '').toLowerCase();
        const textoFiltros = (prod.filtros || []).join(' ').toLowerCase();

        const passaNaBusca = !termoBusca || textoNome.includes(termoBusca) || textoDesc.includes(termoBusca) || textoFiltros.includes(termoBusca);

        return passaNoFiltro && passaNaBusca;
    });

    if (produtosFiltrados.length === 0) {
        container.innerHTML = `<div class="aviso-vazio">Nenhum produto encontrado para a sua busca.</div>`;
        return;
    }

    container.innerHTML = "";

    produtosFiltrados.forEach((prod, indexProd) => {
        const card = document.createElement("div");
        card.classList.add("card-produto");

        card.addEventListener('click', function (e) {
            if (e.target.classList.contains('btn-carrossel') || e.target.closest('.btn-carrossel')) return;
            verificarValidadeAssinaturaAtiva();

            if (prod.exclusivoAssinante) {
                const usuarioLogado = localStorage.getItem('usuario_assinante_logado') === 'true';
                if (!usuarioLogado) {
                    alert("🔒 Conteúdo Exclusivo!\n\nEste produto é restrito a assinantes do clube. Por favor, faça login ou renove sua conta.");
                    return;
                }
            }
            window.location.href = `../produto/produto.html?id=${prod.id}`;
        });

        let htmlImagens = `<div class="produto-imagens" id="galeria-${indexProd}">`;
        if (prod.exclusivoAssinante) {
            htmlImagens += `<div style="position: absolute; top: 10px; left: 10px; background: rgba(184, 147, 83, 0.9); color: #fff; font-size: 9px; font-weight: 600; padding: 4px 8px; z-index: 4; border-radius: 2px;">Exclusivo Assinantes</div>`;
        }

        if (prod.imagens && prod.imagens.length > 0) {
            prod.imagens.forEach((imgSrc, imgIndex) => {
                htmlImagens += `<img src="${imgSrc}" class="${imgIndex === 0 ? "ativa" : ""}" alt="${prod.nome}">`;
            });
            if (prod.imagens.length > 1) {
                htmlImagens += `<button class="btn-carrossel btn-prev" onclick="mudarImagem(event, ${indexProd}, -1)">&#10094;</button><button class="btn-carrossel btn-next" onclick="mudarImagem(event, ${indexProd}, 1)">&#10095;</button>`;
            }
        } else {
            htmlImagens += `<img src="https://via.placeholder.com/250x260?text=Sem+Imagem" class="ativa" alt="Sem imagem">`;
        }
        htmlImagens += `</div>`;

        let htmlPrecos = `<span class="preco-atual-vitrine">R$ ${prod.valor.toFixed(2).replace('.', ',')}</span>`;
        if (prod.emPromocao && prod.valorPromo) {
            htmlPrecos = `<span class="preco-original-vitrine">R$ ${prod.valor.toFixed(2).replace('.', ',')}</span><div class="preco-container-atual"><span class="preco-promo-vitrine">R$ ${prod.valorPromo.toFixed(2).replace('.', ',')}</span></div><span class="tag-desconto">Preço Exclusivo Clube</span>`;
        }

        card.innerHTML = `${htmlImagens}<div class="produto-info"><div class="produto-nome">${prod.nome}</div><div class="produto-precos">${htmlPrecos}</div></div>`;
        container.appendChild(card);
    });
};

window.mudarImagem = function (event, indexProd, direcao) {
    event.stopPropagation();
    const galeria = document.getElementById(`galeria-${indexProd}`);
    const imagens = galeria.querySelectorAll("img");
    let indexAtual = Array.from(imagens).findIndex(img => img.classList.contains("ativa"));
    imagens[indexAtual].classList.remove("ativa");
    indexAtual += direcao;
    if (indexAtual >= imagens.length) indexAtual = 0;
    else if (indexAtual < 0) indexAtual = imagens.length - 1;
    imagens[indexAtual].classList.add("ativa");
};