document.addEventListener("DOMContentLoaded", async function () {
    const dadosNuvem = await carregarDadosDaNuvem();
    let produtos = [];

    if (dadosNuvem) {
        produtos = dadosNuvem.produtos || [];
        if (dadosNuvem.clientes) {
            try {
                localStorage.setItem('clientes_cadastrados', JSON.stringify(JSON.parse(descriptografar(dadosNuvem.clientes))));
            } catch (e) {}
        }
        if (dadosNuvem.config) {
            if (dadosNuvem.config.nome) localStorage.setItem('nome_loja_vittoriana', dadosNuvem.config.nome);
            if (dadosNuvem.config.whatsapp) localStorage.setItem('whatsapp_loja_vittoriana', dadosNuvem.config.whatsapp);
        }
    }

    const nomeLojaSalvo = localStorage.getItem('nome_loja_vittoriana');
    if (nomeLojaSalvo) {
        const tituloMarca = document.getElementById('produto-titulo-loja');
        if (tituloMarca) tituloMarca.innerText = nomeLojaSalvo;
    }

    verificarValidadeAssinaturaAtivaProduto();

    const containerDetalhe = document.getElementById("detalhe-produto");
    const parametrosUrl = new URLSearchParams(window.location.search);
    const produtoId = parametrosUrl.get("id");

    produtos.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const produto = produtos.find(p => p.id == produtoId);

    if (!produto) {
        containerDetalhe.innerHTML = `<div class="erro-produto">Produto não encontrado ou indisponível na coleção.</div>`;
        renderizarVitrineRelacionada(produtos);
        return;
    }

    if (produto.exclusivoAssinante) {
        const usuarioLogado = localStorage.getItem('usuario_assinante_logado') === 'true';
        if (!usuarioLogado) {
            alert("🔒 Conteúdo Exclusivo!\n\nEste produto é exclusivo para assinantes do clube.");
            window.location.href = '../vitrine/vitrine.html';
            return;
        }
    }

    let imagens = produto.imagens && produto.imagens.length > 0 ? produto.imagens : ["https://via.placeholder.com/500x600?text=Sem+Imagem"];
    let htmlImagensPrincipal = '';
    imagens.forEach((imgSrc, idx) => {
        htmlImagensPrincipal += `<img src="${imgSrc}" class="${idx === 0 ? "ativa" : ""}" alt="${produto.nome}">`;
    });

    if (imagens.length > 1) {
        htmlImagensPrincipal += `<button class="btn-carrossel btn-prev" onclick="mudarFotoDetalhe(-1)">&#10094;</button><button class="btn-carrossel btn-next" onclick="mudarFotoDetalhe(1)">&#10095;</button>`;
    }

    let htmlMiniaturas = "";
    if (imagens.length > 1) {
        imagens.forEach((imgSrc, idx) => {
            htmlMiniaturas += `<img src="${imgSrc}" class="miniatura-item ${idx === 0 ? "ativa" : ""}" onclick="selecionarFotoPorIndice(${idx})">`;
        });
    }

    let htmlPrecos = `<div class="preco-container-atual"><span class="preco-atual-detalhe">R$ ${produto.valor.toFixed(2).replace('.', ',')}</span></div>`;
    if (produto.emPromocao && produto.valorPromo) {
        htmlPrecos = `<span class="preco-original-detalhe">R$ ${produto.valor.toFixed(2).replace('.', ',')}</span><div class="preco-container-atual"><span class="preco-promo-detalhe">R$ ${produto.valorPromo.toFixed(2).replace('.', ',')}</span></div><span class="badge-exclusivo">Preço Exclusivo de Atacado</span>`;
    }

    // Pega o WhatsApp salvo pela lojista no painel (ou usa um padrão caso esteja vazio)
    let whatsappLoja = localStorage.getItem('whatsapp_loja_vittoriana') || '62999999999';
    whatsappLoja = whatsappLoja.replace(/\D/g, '');
    let textoMensagem = encodeURIComponent('Olá! Gostaria de consultar a disponibilidade do produto: ' + produto.nome);
    let linkWhatsapp = `https://wa.me/55${whatsappLoja}?text=${textoMensagem}`;

    containerDetalhe.innerHTML = `
        <div class="detalhe-galeria">
            <div class="foto-principal-container" id="container-foto-principal">${htmlImagensPrincipal}</div>
            ${htmlMiniaturas ? `<div class="miniatura-lista" id="lista-miniaturas">${htmlMiniaturas}</div>` : ''}
        </div>
        <div class="detalhe-info">
            <span class="tag-colecao">Alta Costura</span>
            <h1 class="detalhe-titulo">${produto.nome}</h1>
            <div class="divisor-luxo"></div>
            <div class="detalhe-precos">${htmlPrecos}</div>
            <div class="detalhe-descricao-bloco">
                <h3 class="titulo-secao-info">Detalhes do Produto</h3>
                <p class="detalhe-descricao">${produto.descricao || 'Peça confeccionada com acabamento impecável.'}</p>
            </div>
            <div class="acoes-produto">
                <a href="${linkWhatsapp}" target="_blank" class="btn-comprar-atacado">Solicitar via WhatsApp</a>
                <span class="garantia-atacado">✦ Atendimento Exclusivo para Lojistas e Revenda</span>
            </div>
        </div>
    `;

    renderizarVitrineRelacionada(produtos);
});

function verificarValidadeAssinaturaAtivaProduto() {
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
        }
    }
}

function renderizarVitrineRelacionada(produtos) {
    const container = document.getElementById("vitrine-produtos-relacionados");
    if (!container) return;
    container.innerHTML = "";
    produtos.forEach((prod, indexProd) => {
        const card = document.createElement("div");
        card.classList.add("card-produto");
        card.addEventListener('click', function (e) {
            if (e.target.classList.contains('btn-carrossel') || e.target.closest('.btn-carrossel')) return;
            if (prod.exclusivoAssinante && localStorage.getItem('usuario_assinante_logado') !== 'true') {
                alert("🔒 Conteúdo Exclusivo!\n\nEste produto é exclusivo para assinantes do clube.");
                return;
            }
            window.location.href = `produto.html?id=${prod.id}`;
        });
        let htmlImagens = `<div class="produto-imagens" id="galeria-rel-${indexProd}">`;
        if (prod.exclusivoAssinante) htmlImagens += `<div style="position: absolute; top: 10px; left: 10px; background: rgba(184, 147, 83, 0.9); color: #fff; font-size: 9px; padding: 4px 8px; z-index: 4;">Exclusivo Assinantes</div>`;
        if (prod.imagens && prod.imagens.length > 0) {
            prod.imagens.forEach((imgSrc, imgIndex) => {
                htmlImagens += `<img src="${imgSrc}" class="${imgIndex === 0 ? "ativa" : ""}" alt="${prod.nome}">`;
            });
            if (prod.imagens.length > 1) {
                htmlImagens += `<button class="btn-carrossel btn-prev" onclick="mudarImagemRelacionada(event, ${indexProd}, -1)">&#10094;</button><button class="btn-carrossel btn-next" onclick="mudarImagemRelacionada(event, ${indexProd}, 1)">&#10095;</button>`;
            }
        } else {
            htmlImagens += `<img src="https://via.placeholder.com/250x260?text=Sem+Imagem" class="ativa" alt="Sem imagem">`;
        }
        htmlImagens += `</div>`;
        card.innerHTML = `${htmlImagens}<div class="produto-info"><div class="produto-nome">${prod.nome}</div><div class="produto-precos"><span class="preco-atual-vitrine">R$ ${prod.valor.toFixed(2).replace('.', ',')}</span></div></div>`;
        container.appendChild(card);
    });
}

window.mudarFotoDetalhe = function (direcao) {
    const container = document.getElementById("container-foto-principal");
    const imagens = container.querySelectorAll("img");
    const miniaturas = document.querySelectorAll(".miniatura-item");
    let indexAtual = Array.from(imagens).findIndex(img => img.classList.contains("ativa"));
    imagens[indexAtual].classList.remove("ativa");
    if (miniaturas.length > 0) miniaturas[indexAtual].classList.remove("ativa");
    indexAtual += direcao;
    if (indexAtual >= imagens.length) indexAtual = 0;
    else if (indexAtual < 0) indexAtual = imagens.length - 1;
    imagens[indexAtual].classList.add("ativa");
    if (miniaturas.length > 0) miniaturas[indexAtual].classList.add("ativa");
};

window.selecionarFotoPorIndice = function (indexAlvo) {
    const container = document.getElementById("container-foto-principal");
    const imagens = container.querySelectorAll("img");
    const miniaturas = document.querySelectorAll(".miniatura-item");
    imagens.forEach(img => img.classList.remove("ativa"));
    miniaturas.forEach(min => min.classList.remove("ativa"));
    imagens[indexAlvo].classList.add("ativa");
    miniaturas[indexAlvo].classList.add("ativa");
};

window.mudarImagemRelacionada = function (event, indexProd, direcao) {
    event.stopPropagation();
    const galeria = document.getElementById(`galeria-rel-${indexProd}`);
    const imagens = galeria.querySelectorAll("img");
    let indexAtual = Array.from(imagens).findIndex(img => img.classList.contains("ativa"));
    imagens[indexAtual].classList.remove("ativa");
    indexAtual += direcao;
    if (indexAtual >= imagens.length) indexAtual = 0;
    else if (indexAtual < 0) indexAtual = imagens.length - 1;
    imagens[indexAtual].classList.add("ativa");
};