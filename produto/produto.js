document.addEventListener("DOMContentLoaded", function () {
    // Atualiza título da aba, nome da loja e faixa superior dinamicamente
    const nomeLoja = localStorage.getItem('nome_loja_vittoriana');
    if (nomeLoja) {
        document.title = `${nomeLoja} - Detalhes do Produto`;
        const tituloMarca = document.getElementById('produto-titulo-loja');
        if (tituloMarca) tituloMarca.innerText = nomeLoja;
    }
    const faixaSalva = localStorage.getItem('faixa_topo_vittoriana');
    if (faixaSalva) {
        const faixaElemento = document.querySelector('.faixa-topo-omega');
        if (faixaElemento) {
            faixaElemento.innerHTML = faixaSalva.split('•').map(t => `<span>${t.trim()}</span>`).join('<span class="separador">•</span>');
        }
    }

    // Revalida a assinatura ao abrir a página direta
    verificarValidadeAssinaturaAtivaProduto();

    const containerDetalhe = document.getElementById("detalhe-produto");
    const parametrosUrl = new URLSearchParams(window.location.search);
    const produtoId = parametrosUrl.get("id");

    const produtos = JSON.parse(localStorage.getItem('produtos_cadastrados')) || [];
    produtos.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

    const produto = produtos.find(p => p.id == produtoId);

    if (!produto) {
        containerDetalhe.innerHTML = `<div class="erro-produto">Produto não encontrado ou indisponível na coleção.</div>`;
        renderizarVitrineRelacionada(produtos);
        return;
    }

    // BLOQUEIO DE ACESSO DIRETO POR LINK
    if (produto.exclusivoAssinante) {
        const usuarioLogado = localStorage.getItem('usuario_assinante_logado') === 'true';
        if (!usuarioLogado) {
            alert("🔒 Conteúdo Exclusivo!\n\nEste produto é exclusivo para assinantes do clube.");
            window.location.href = '../index.html';
            return;
        }
    }

    let imagens = produto.imagens && produto.imagens.length > 0 ? produto.imagens : ["https://via.placeholder.com/500x600?text=Sem+Imagem"];
    
    let htmlImagensPrincipal = '';
    imagens.forEach((imgSrc, idx) => {
        const classeAtiva = idx === 0 ? "ativa" : "";
        htmlImagensPrincipal += `<img src="${imgSrc}" class="${classeAtiva}" alt="${produto.nome}">`;
    });

    if (imagens.length > 1) {
        htmlImagensPrincipal += `
            <button class="btn-carrossel btn-prev" onclick="mudarFotoDetalhe(-1)">&#10094;</button>
            <button class="btn-carrossel btn-next" onclick="mudarFotoDetalhe(1)">&#10095;</button>
        `;
    }

    let htmlMiniaturas = "";
    if (imagens.length > 1) {
        imagens.forEach((imgSrc, idx) => {
            const classeAtiva = idx === 0 ? "ativa" : "";
            htmlMiniaturas += `<img src="${imgSrc}" class="miniatura-item ${classeAtiva}" onclick="selecionarFotoPorIndice(${idx})">`;
        });
    }

    let htmlPrecos = `
        <div class="preco-container-atual">
            <span class="preco-atual-detalhe">R$ ${produto.valor.toFixed(2).replace('.', ',')}</span>
        </div>
    `;

    if (produto.emPromocao && produto.valorPromo) {
        htmlPrecos = `
            <span class="preco-original-detalhe">R$ ${produto.valor.toFixed(2).replace('.', ',')}</span>
            <div class="preco-container-atual">
                <span class="preco-promo-detalhe">R$ ${produto.valorPromo.toFixed(2).replace('.', ',')}</span>
            </div>
            <span class="badge-exclusivo">Preço Exclusivo de Atacado</span>
        `;
    }

    // Puxa o WhatsApp configurado pela dona no painel de gestão
    const whatsappLoja = localStorage.getItem('whatsapp_loja_vittoriana') || '62999999999';
    const textoZap = encodeURIComponent(`Olá! Gostaria de consultar a disponibilidade do produto: ${produto.nome}`);
    const urlWhatsappFinal = `https://wa.me/55${whatsappLoja.replace(/\D/g, '')}?text=${textoZap}`;

    containerDetalhe.innerHTML = `
        <div class="detalhe-galeria">
            <div class="foto-principal-container" id="container-foto-principal">
                ${htmlImagensPrincipal}
            </div>
            ${htmlMiniaturas ? `<div class="miniatura-lista" id="lista-miniaturas">${htmlMiniaturas}</div>` : ''}
        </div>

        <div class="detalhe-info">
            <span class="tag-colecao">Alta Costura</span>
            <h1 class="detalhe-titulo">${produto.nome}</h1>
            <div class="divisor-luxo"></div>

            <div class="detalhe-precos">
                ${htmlPrecos}
            </div>

            <div class="detalhe-descricao-bloco">
                <h3 class="titulo-secao-info">Detalhes do Produto</h3>
                <p class="detalhe-descricao">${produto.descricao || 'Peça confeccionada com acabamento impecável, design exclusivo e tecidos de alta qualidade para o segmento de atacado.'}</p>
            </div>

            <div class="acoes-produto">
                <a href="${urlWhatsappFinal}" target="_blank" class="btn-comprar-atacado">
                    Solicitar via WhatsApp
                </a>
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

    if (produtos.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; font-size: 13px; padding: 20px;">Nenhum produto cadastrado na coleção.</div>`;
        return;
    }

    produtos.forEach((prod, indexProd) => {
        const card = document.createElement("div");
        card.classList.add("card-produto");

        card.addEventListener('click', function (e) {
            if (e.target.classList.contains('btn-carrossel') || e.target.closest('.btn-carrossel')) return;
            
            verificarValidadeAssinaturaAtivaProduto();

            if (prod.exclusivoAssinante) {
                const usuarioLogado = localStorage.getItem('usuario_assinante_logado') === 'true';

                if (!usuarioLogado) {
                    alert("🔒 Conteúdo Exclusivo!\n\nEste produto é exclusivo para assinantes do clube.");
                    return;
                }
            }

            window.location.href = `produto.html?id=${prod.id}`;
        });

        let htmlImagens = `<div class="produto-imagens" id="galeria-rel-${indexProd}">`;
        
        if (prod.exclusivoAssinante) {
            htmlImagens += `<div style="position: absolute; top: 10px; left: 10px; background: rgba(184, 147, 83, 0.9); color: #fff; font-size: 9px; font-weight: 600; padding: 4px 8px; letter-spacing: 1px; text-transform: uppercase; z-index: 4; border-radius: 2px;">Exclusivo Assinantes</div>`;
        }

        if (prod.imagens && prod.imagens.length > 0) {
            prod.imagens.forEach((imgSrc, imgIndex) => {
                const classeAtiva = imgIndex === 0 ? "ativa" : "";
                htmlImagens += `<img src="${imgSrc}" class="${classeAtiva}" alt="${prod.nome}">`;
            });

            if (prod.imagens.length > 1) {
                htmlImagens += `
                    <button class="btn-carrossel btn-prev" onclick="mudarImagemRelacionada(event, ${indexProd}, -1)">&#10094;</button>
                    <button class="btn-carrossel btn-next" onclick="mudarImagemRelacionada(event, ${indexProd}, 1)">&#10095;</button>
                `;
            }
        } else {
            htmlImagens += `<img src="https://via.placeholder.com/250x260?text=Sem+Imagem" class="ativa" alt="Sem imagem">`;
        }
        htmlImagens += `</div>`;

        let htmlPrecos = `<span class="preco-atual-vitrine">R$ ${prod.valor.toFixed(2).replace('.', ',')}</span>`;
        if (prod.emPromocao && prod.valorPromo) {
            htmlPrecos = `
                <span class="preco-original-vitrine">R$ ${prod.valor.toFixed(2).replace('.', ',')}</span>
                <div class="preco-container-atual">
                    <span class="preco-promo-vitrine">R$ ${prod.valorPromo.toFixed(2).replace('.', ',')}</span>
                </div>
                <span class="tag-desconto">Preço Exclusivo Clube</span>
            `;
        }

        card.innerHTML = `
            ${htmlImagens}
            <div class="produto-info">
                <div class="produto-nome">${prod.nome}</div>
                <div class="produto-precos">${htmlPrecos}</div>
            </div>
        `;

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
    if (indexAtual >= imagens.length) {
        indexAtual = 0;
    } else if (indexAtual < 0) {
        indexAtual = imagens.length - 1;
    }

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
    if (indexAtual >= imagens.length) {
        indexAtual = 0;
    } else if (indexAtual < 0) {
        indexAtual = imagens.length - 1;
    }

    imagens[indexAtual].classList.add("ativa");
};