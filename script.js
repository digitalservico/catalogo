// --- MÓDULO DE GESTÃO DA LOJA, PRODUTOS, ASSINANTES E DIVULGAÇÃO (COM NUVEM) ---

let produtos = [];
let filtrosSalvos = ['Camisa', 'Blusa', 'Vestido', 'Calça'];
let clientes = []; 
let contatosDivulgacao = [];

// Carrega os dados da nuvem ao abrir a página
async function inicializarSistemaDaNuvem() {
    const dadosNuvem = await carregarDadosDaNuvem();
    if (dadosNuvem) {
        produtos = dadosNuvem.produtos || [];
        
        if (dadosNuvem.clientes) {
            try {
                clientes = JSON.parse(descriptografar(dadosNuvem.clientes));
            } catch (e) {
                clientes = [];
            }
        }
        
        if (dadosNuvem.contatosDivulgacao) {
            try {
                contatosDivulgacao = JSON.parse(descriptografar(dadosNuvem.contatosDivulgacao));
            } catch (e) {
                contatosDivulgacao = [];
            }
        }

        // Configurações da Loja
        if (dadosNuvem.config) {
            if (dadosNuvem.config.nome) localStorage.setItem('nome_loja_vittoriana', dadosNuvem.config.nome);
            if (dadosNuvem.config.dias) localStorage.setItem('dias_validade_assinatura', dadosNuvem.config.dias);
            if (dadosNuvem.config.whatsapp) localStorage.setItem('whatsapp_loja_vittoriana', dadosNuvem.config.whatsapp);
        }
    }

    carregarConfiguracoesLoja();
    renderizarProdutos();
    renderizarFiltrosFormulario();
    renderizarClientesAssinantes();
    renderizarContatosDivulgacao();
    renderizarCheckboxDivulgacaoClientes();
    renderizarCheckboxDivulgacaoProdutos();
}

// Função centralizada para salvar tudo na nuvem automaticamente
async function persistirTudoNaNuvem() {
    let nomeLoja = localStorage.getItem('nome_loja_vittoriana') || 'Vittoriana';
    let diasAssinatura = localStorage.getItem('dias_validade_assinatura') || '30';
    let whatsappLoja = localStorage.getItem('whatsapp_loja_vittoriana') || '';

    const pacoteDados = {
        produtos: produtos,
        clientes: clientes,
        contatosDivulgacao: contatosDivulgacao,
        config: {
            nome: nomeLoja,
            dias: diasAssinatura,
            whatsapp: whatsappLoja
        }
    };

    await salvarDadosNaNuvem(pacoteDados);
}

function carregarConfiguracoesLoja() {
    let nomeLoja = localStorage.getItem('nome_loja_vittoriana') || 'Vittoriana';
    let diasAssinatura = localStorage.getItem('dias_validade_assinatura') || '30';
    let whatsappLoja = localStorage.getItem('whatsapp_loja_vittoriana') || '';

    const elementoTitulo = document.getElementById('painel-titulo-loja');
    const inputLoja = document.getElementById('input-nome-loja');
    const inputDias = document.getElementById('input-dias-assinatura');
    const inputWhatsapp = document.getElementById('input-whatsapp-loja');
    
    if (elementoTitulo) elementoTitulo.innerText = nomeLoja;
    if (inputLoja) inputLoja.value = nomeLoja;
    if (inputDias) inputDias.value = diasAssinatura;
    if (inputWhatsapp) inputWhatsapp.value = whatsappLoja;
}

window.salvarConfiguracoesLoja = async function(e) {
    e.preventDefault();
    const novoNome = document.getElementById('input-nome-loja').value.trim();
    const novosDias = document.getElementById('input-dias-assinatura').value.trim();
    const novoWhatsapp = document.getElementById('input-whatsapp-loja').value.trim().replace(/\D/g, '');

    if (!novoNome) return;

    localStorage.setItem('nome_loja_vittoriana', novoNome);
    localStorage.setItem('dias_validade_assinatura', novosDias || '30');
    localStorage.setItem('whatsapp_loja_vittoriana', novoWhatsapp);
    
    carregarConfiguracoesLoja();
    await persistirTudoNaNuvem();
    alert("✦ Configurações e WhatsApp da loja salvos com sucesso!");
};

// --- ALTERAÇÃO DE SENHA DA ADMINISTRAÇÃO ---
window.salvarNovaSenhaAdmin = function(e) {
    e.preventDefault();
    const novaSenha = document.getElementById('input-nova-senha').value.trim();
    const confirmaSenha = document.getElementById('input-confirma-senha').value.trim();

    if (!novaSenha || !confirmaSenha) {
        alert("❌ Preencha ambos os campos de senha.");
        return;
    }

    if (novaSenha !== confirmaSenha) {
        alert("❌ As senhas não coincidem. Verifique e tente novamente.");
        return;
    }

    if (novaSenha.length < 4) {
        alert("⚠️ Por segurança, a senha deve ter pelo menos 4 caracteres.");
        return;
    }

    localStorage.setItem('senha_admin_vittoriana', novaSenha);
    document.getElementById('form-alterar-senha-admin').reset();
    alert("✦ Palavra-passe administrativa alterada com sucesso!");
};

// --- GESTÃO DE CLIENTES ASSINANTES ---
window.alternarStatusCliente = async function(id) {
    clientes = clientes.map(c => {
        if (c.id === id) {
            c.status = c.status === 'Ativo' ? 'Pendente' : 'Ativo';
        }
        return c;
    });
    await persistirTudoNaNuvem();
    renderizarClientesAssinantes();
    renderizarCheckboxDivulgacaoClientes();
};

window.excluirClienteAssinante = async function(id) {
    if (confirm('Tem certeza que deseja remover este assinante?')) {
        clientes = clientes.filter(c => c.id !== id);
        await persistirTudoNaNuvem();
        renderizarClientesAssinantes();
        renderizarCheckboxDivulgacaoClientes();
    }
};

window.enviarAprovacaoWhatsApp = function(whatsapp, nome) {
    const mensagem = `Olá *${nome}*! Seu cadastro e acesso ao Clube Exclusivo Vittoriana foram **APROVADOS**! 🎉✨ Já pode acessar a nossa vitrine restrita e aproveitar os preços de atacado. Seja muito bem-vindo(a)! 🛍️👑`;
    window.open(`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`, '_blank');
};

window.enviarAvisoVencimento = function(whatsapp, nome, diasRestantes) {
    let mensagem = "";
    if (diasRestantes < 0) {
        mensagem = `Olá *${nome}*! Notamos que sua assinatura do Clube Exclusivo Vittoriana venceu há ${Math.abs(diasRestantes)} dias. Renove agora para continuar aproveitando os preços de atacado! 👑🛍️`;
    } else {
        mensagem = `Olá *${nome}*! Passando para lembrar que sua assinatura do Clube Exclusivo Vittoriana vence em *${diasRestantes} dias*. Garanta sua renovação! 👑🛍️`;
    }
    window.open(`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`, '_blank');
};

function renderizarClientesAssinantes() {
    const tbody = document.getElementById('lista-clientes-assinantes-tabela');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (clientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="vazio">Nenhum cliente assinante cadastrado pelo site.</td></tr>`;
        return;
    }

    const hoje = new Date();

    clientes.forEach(c => {
        const tr = document.createElement('tr');
        const badgeStatusCor = c.status === 'Ativo' ? 'background: rgba(46, 125, 50, 0.1); color: #2e7d32;' : 'background: rgba(239, 108, 0, 0.1); color: #ef6c00;';
        
        let infoSenha = c.senha ? `<br><small style="color: #b89353; font-weight: 600;">🔑 Senha: ${c.senha}</small>` : '';

        let infoVencimento = "";
        let diasRestantes = null;
        if (c.vencimento) {
            const dataVenc = new Date(c.vencimento + 'T00:00:00');
            const diffTime = dataVenc - hoje;
            diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diasRestantes < 0) {
                infoVencimento = `<br><span style="color: #d9534f; font-weight: 600; font-size: 10px;">⚠️ Vencido há ${Math.abs(diasRestantes)} dias (${c.vencimento})</span>`;
            } else if (diasRestantes === 0) {
                infoVencimento = `<br><span style="color: #f0ad4e; font-weight: 600; font-size: 10px;">⚠️ Vence HOJE!</span>`;
            } else {
                infoVencimento = `<br><span style="color: #8c7355; font-size: 10px;">Vence em ${diasRestantes} dias (${c.vencimento})</span>`;
            }
        } else {
            infoVencimento = `<br><span style="color: #999; font-size: 10px;">Sem vencimento definido</span>`;
        }

        tr.innerHTML = `
            <td>
                <strong style="font-size: 13px; color: #2b2b2b;">${c.nome}</strong><br>
                <small style="color: #666;">📱 ${c.whatsapp}</small>
                ${infoSenha}
            </td>
            <td style="text-align: center;">
                <span onclick="alternarStatusCliente(${c.id})" style="cursor: pointer; padding: 3px 8px; border-radius: 2px; font-weight: 600; font-size: 10px; ${badgeStatusCor}" title="Clique para alternar status">
                    ${c.status}
                </span>
                ${infoVencimento}
            </td>
            <td>
                <div class="btn-acao-container" style="flex-wrap: wrap;">
                    <button class="btn-acao btn-editar" onclick="enviarAprovacaoWhatsApp('${c.whatsapp}', '${c.nome}')" title="Aprovar no WhatsApp">Aprovar Zap</button>
                    ${c.vencimento ? `<button class="btn-acao btn-editar" onclick="enviarAvisoVencimento('${c.whatsapp}', '${c.nome}',${diasRestantes})" title="Avisar vencimento">Cobrar</button>` : ''}
                    <button class="btn-acao btn-excluir" onclick="excluirClienteAssinante(${c.id})">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- GESTÃO DE CONTATOS DE DIVULGAÇÃO ---
window.cadastrarContatoDivulgacao = async function(e) {
    e.preventDefault();
    const nome = document.getElementById('div-nome').value.trim();
    const whatsapp = document.getElementById('div-whatsapp').value.trim().replace(/\D/g, '');

    if (!nome || !whatsapp) return;

    const novoContato = { id: Date.now(), nome, whatsapp };
    contatosDivulgacao.push(novoContato);
    
    await persistirTudoNaNuvem();
    document.getElementById('form-divulgacao').reset();
    renderizarContatosDivulgacao();
    renderizarCheckboxDivulgacaoClientes();
    alert(`✦ Contato de divulgação ${nome} cadastrado com sucesso!`);
};

window.excluirContatoDivulgacao = async function(id) {
    if (confirm('Tem certeza que deseja remover este contato de divulgação?')) {
        contatosDivulgacao = contatosDivulgacao.filter(c => c.id !== id);
        await persistirTudoNaNuvem();
        renderizarContatosDivulgacao();
        renderizarCheckboxDivulgacaoClientes();
    }
};

function renderizarContatosDivulgacao() {
    const tbody = document.getElementById('lista-contatos-divulgacao-tabela');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (contatosDivulgacao.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" class="vazio">Nenhum contato avulso cadastrado.</td></tr>`;
        return;
    }

    contatosDivulgacao.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong style="font-size: 12px; color: #2b2b2b;">${c.nome}</strong><br>
                <small style="color: #666;">📱 ${c.whatsapp}</small>
            </td>
            <td style="text-align: center;">
                <button class="btn-acao btn-excluir" onclick="excluirContatoDivulgacao(${c.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarCheckboxDivulgacaoClientes() {
    const container = document.getElementById('div-selecao-clientes');
    if (!container) return;

    if (clientes.length === 0 && contatosDivulgacao.length === 0) {
        container.innerHTML = `<small style="color: #888;">Nenhum cliente ou contato cadastrado.</small>`;
        return;
    }

    container.innerHTML = '';

    if (clientes.length > 0) {
        const tituloAssinantes = document.createElement('div');
        tituloAssinantes.style.cssText = "font-size: 10px; font-weight: 600; color: #8c7355; text-transform: uppercase; margin: 4px 0;";
        tituloAssinantes.innerText = "👑 Assinantes do Clube";
        container.appendChild(tituloAssinantes);

        clientes.forEach(c => {
            const div = document.createElement('div');
            div.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 12px; padding-left: 6px;";
            div.innerHTML = `
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; text-transform: none; font-weight: 400; color: #333;">
                    <input type="checkbox" value="${c.whatsapp}" data-nome="${c.nome}" class="check-cliente-div">
                    <strong>${c.nome}</strong> (Assinante) - <span style="font-size: 10px; color: ${c.status === 'Ativo' ? '#2e7d32' : '#ef6c00'};">${c.status}</span>
                </label>
            `;
            container.appendChild(div);
        });
    }

    if (contatosDivulgacao.length > 0) {
        const tituloDivulgacao = document.createElement('div');
        tituloDivulgacao.style.cssText = "font-size: 10px; font-weight: 600; color: #8c7355; text-transform: uppercase; margin: 8px 0 4px 0;";
        tituloDivulgacao.innerText = "📢 Contatos de Divulgação (Avulsos)";
        container.appendChild(tituloDivulgacao);

        contatosDivulgacao.forEach(c => {
            const div = document.createElement('div');
            div.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 12px; padding-left: 6px;";
            div.innerHTML = `
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; text-transform: none; font-weight: 400; color: #333;">
                    <input type="checkbox" value="${c.whatsapp}" data-nome="${c.nome}" class="check-cliente-div">
                    <strong>${c.nome}</strong> (Divulgação)
                </label>
            `;
            container.appendChild(div);
        });
    }
}

function renderizarCheckboxDivulgacaoProdutos() {
    const container = document.getElementById('div-selecao-produtos');
    if (!container) return;

    if (produtos.length === 0) {
        container.innerHTML = `<small style="color: #888;">Nenhum produto cadastrado.</small>`;
        return;
    }

    container.innerHTML = '';
    produtos.forEach(p => {
        let precoTexto = `R$ ${p.valor.toFixed(2)}`;
        if (p.emPromocao && p.valorPromo) {
            precoTexto = `R$ ${p.valorPromo.toFixed(2)} (Promo)`;
        }

        const div = document.createElement('div');
        div.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 5px; font-size: 12px;";
        div.innerHTML = `
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; text-transform: none; font-weight: 400; color: #333;">
                <input type="checkbox" value="${p.id}" class="check-produto-div">
                <strong>${p.nome}</strong> - <span style="color: #8c7355; font-weight: 600;">${precoTexto}</span>
            </label>
        `;
        container.appendChild(div);
    });
}

window.selecionarTodosClientes = function(marcar) {
    document.querySelectorAll('.check-cliente-div').forEach(chk => chk.checked = marcar);
};

window.selecionarTodosProdutos = function(marcar) {
    document.querySelectorAll('.check-produto-div').forEach(chk => chk.checked = marcar);
};

window.dispararDivulganaoWhatsApp = function() {
    const clientesSelecionados = Array.from(document.querySelectorAll('.check-cliente-div:checked'));
    const produtosSelecionados = Array.from(document.querySelectorAll('.check-produto-div:checked'));

    if (clientesSelecionados.length === 0 || produtosSelecionados.length === 0) {
        alert('Selecione pelo menos um destinatário e um produto para divulgar.');
        return;
    }

    let listaTextosProdutos = [];
    produtosSelecionados.forEach(chkProd => {
        const prodObj = produtos.find(p => p.id == chkProd.value);
        if (prodObj) {
            let precoStr = `R$ ${prodObj.valor.toFixed(2).replace('.', ',')}`;
            if (prodObj.emPromocao && prodObj.valorPromo) {
                precoStr = `R$ ${prodObj.valorPromo.toFixed(2).replace('.', ',')} (Preço Clube Exclusivo)`;
            }
            listaTextosProdutos.push(`✨ *${prodObj.nome}*\n📝 ${prodObj.descricao || 'Peça exclusiva.'}\n💰 *${precoStr}*\n`);
        }
    });

    const primeiroCliente = clientesSelecionados[0];
    const nomeCliente = primeiroCliente.getAttribute('data-nome');
    let numeroZap = primeiroCliente.value.replace(/\D/g, '');

    let mensagem = `Olá *${nomeCliente}*! Selecionamos novidades exclusivas para você:\n\n`;
    mensagem += listaTextosProdutos.join('\n-------------------\n\n');
    mensagem += `\nGostaria de garantir as suas peças? Responda esta mensagem! 🛍️👑`;

    window.open(`https://wa.me/55${numeroZap}?text=${encodeURIComponent(mensagem)}`, '_blank');
};

function renderizarFiltrosFormulario(filtrosSelecionados = []) {
    const container = document.getElementById('lista-checkbox-filtros');
    if (!container) return;
    container.innerHTML = '';

    filtrosSalvos.forEach(filtro => {
        const isChecked = filtrosSelecionados.includes(filtro) ? 'checked' : '';
        const div = document.createElement('div');
        div.className = 'filtro-item-checkbox';
        div.innerHTML = `
            <label>
                <input type="checkbox" value="${filtro}" ${isChecked} class="checkbox-filtro-prod">
                ${filtro}
            </label>
            <span class="btn-excluir-filtro" onclick="excluirFiltroGlobal('${filtro}')" title="Excluir">&times;</span>
        `;
        container.appendChild(div);
    });
}

window.criarNovoFiltro = function() {
    const input = document.getElementById('novo-filtro-input');
    const nomeFiltro = input.value.trim();
    if (!nomeFiltro || filtrosSalvos.includes(nomeFiltro)) return;

    filtrosSalvos.push(nomeFiltro);
    input.value = '';
    renderizarFiltrosFormulario();
};

window.excluirFiltroGlobal = function(nomeFiltro) {
    if (confirm(`Excluir filtro "${nomeFiltro}"?`)) {
        filtrosSalvos = filtrosSalvos.filter(f => f !== nomeFiltro);
        produtos.forEach(p => { if (p.filtros) p.filtros = p.filtros.filter(f => f !== nomeFiltro); });
        sincronizarEAtualizarProdutos();
        renderizarFiltrosFormulario();
    }
};

window.toggleSanfona = function(element) {
    element.parentElement.classList.toggle('recolhido');
};

window.toggleValorPromo = function() {
    const selecao = document.getElementById('promocao-check').value;
    document.getElementById('grupo-valor-promo').style.display = selecao === 'sim' ? 'block' : 'none';
};

document.getElementById('form-produto').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('produto-id').value;
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const emPromocao = document.getElementById('promocao-check').value === 'sim';
    const valorPromo = emPromocao ? parseFloat(document.getElementById('valor-promo').value) : null;
    const exclusivoAssinante = document.getElementById('exclusivo-assinante').checked;
    const inputImagens = document.getElementById('imagens-produto');
    const filtrosSelecionados = Array.from(document.querySelectorAll('.checkbox-filtro-prod:checked')).map(el => el.value);

    const arquivos = Array.from(inputImagens.files);
    if (arquivos.length > 0) {
        processarImagensEmBase64(arquivos, function(imagensBase64) {
            salvarOuAtualizarNoArray(id, nome, descricao, valor, emPromocao, valorPromo, imagensBase64, filtrosSelecionados, exclusivoAssinante);
        });
    } else {
        let imagensAntigas = id ? (produtos.find(p => p.id == id)?.imagens || []) : [];
        salvarOuAtualizarNoArray(id, nome, descricao, valor, emPromocao, valorPromo, imagensAntigas, filtrosSelecionados, exclusivoAssinante);
    }
});

function processarImagensEmBase64(arquivos, callback) {
    let imagensBase64 = [];
    let concluidos = 0;
    arquivos.forEach((arquivo, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagensBase64[index] = e.target.result;
            concluidos++;
            if (concluidos === arquivos.length) callback(imagensBase64.filter(Boolean));
        };
        reader.readAsDataURL(arquivo);
    });
}

async function salvarOuAtualizarNoArray(id, nome, descricao, valor, emPromocao, valorPromo, imagens, filtros, exclusivoAssinante) {
    if (id) {
        produtos = produtos.map(prod => prod.id == id ? { ...prod, nome, descricao, valor, emPromocao, valorPromo, imagens, filtros, exclusivoAssinante } : prod);
    } else {
        const maiorOrdem = produtos.length > 0 ? Math.max(...produtos.map(p => p.ordem || 0)) + 1 : 1;
        produtos.push({ id: Date.now(), nome, descricao, valor, emPromocao, valorPromo, imagens, filtros, ordem: maiorOrdem, exclusivoAssinante });
    }
    await sincronizarEAtualizarProdutos();
    cancelarEdicao();
}

window.alterarOrdemProduto = async function(idProduto, novaOrdemInput) {
    let novaOrdem = parseInt(novaOrdemInput);
    if (isNaN(novaOrdem) || novaOrdem < 1) return;
    produtos.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const indexAntigo = produtos.findIndex(p => p.id === idProduto);
    if (indexAntigo === -1) return;
    const [produtoMovido] = produtos.splice(indexAntigo, 1);
    produtos.splice(Math.min(novaOrdem - 1, produtos.length), 0, produtoMovido);
    produtos.forEach((p, idx) => p.ordem = idx + 1);
    await sincronizarEAtualizarProdutos();
};

async function sincronizarEAtualizarProdutos() {
    produtos.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    await persistirTudoNaNuvem();
    renderizarProdutos();
    renderizarCheckboxDivulgacaoProdutos();
}

function renderizarProdutos() {
    produtos.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const tbody = document.getElementById('lista-produtos');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (produtos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="vazio">Nenhum produto cadastrado.</td></tr>`;
        return;
    }

    produtos.forEach((prod) => {
        const tr = document.createElement('tr');
        let htmlPreco = `R$ ${prod.valor.toFixed(2)}`;
        if (prod.emPromocao && prod.valorPromo) {
            htmlPreco = `<span class="preco-original">R$ ${prod.valor.toFixed(2)}</span><span class="preco-promo">R$ ${prod.valorPromo.toFixed(2)} (Promo)</span>`;
        }
        if (prod.exclusivoAssinante) {
            htmlPreco += `<br><span style="background: rgba(184, 147, 83, 0.15); color: #8c7355; font-size: 9px; padding: 3px 6px; border-radius: 2px; font-weight: 600; display: inline-block; margin-top: 5px;">🔒 Exclusivo Assinantes</span>`;
        }

        let htmlImagens = prod.imagens?.length ? '<div class="galeria-minaturas">' + prod.imagens.map(img => `<img src="${img}" class="miniatura-img" onclick="window.open('${img}')">`).join('') + '</div>' : '';
        let htmlFiltrosBadge = prod.filtros?.length ? '<div class="badges-filtros-tabela">' + prod.filtros.map(f => `<span class="badge-filtro">${f}</span>`).join('') + '</div>' : '';

        tr.innerHTML = `
            <td style="width: 80px; text-align: center;"><input type="number" class="input-ordem" value="${prod.ordem}" min="1" onchange="alterarOrdemProduto(${prod.id}, this.value)"></td>
            <td><strong style="font-size: 13px; color: #2b2b2b;">${prod.nome}</strong><br><small style="color: #666;">${prod.descricao || 'Sem descrição'}</small>${htmlFiltrosBadge}${htmlImagens}</td>
            <td>${htmlPreco}</td>
            <td>
                <div class="btn-acao-container">
                    <button class="btn-acao btn-editar" onclick="editarProduto(${prod.id})">Editar</button>
                    <button class="btn-acao btn-excluir" onclick="excluirProduto(${prod.id})">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.editarProduto = function(id) {
    const prod = produtos.find(p => p.id === id);
    if (!prod) return;
    document.getElementById('produto-id').value = prod.id;
    document.getElementById('nome').value = prod.nome;
    document.getElementById('descricao').value = prod.descricao;
    document.getElementById('valor').value = prod.valor;
    document.getElementById('exclusivo-assinante').checked = !!prod.exclusivoAssinante;
    
    const selectPromo = document.getElementById('promocao-check');
    selectPromo.value = prod.emPromocao ? 'sim' : 'nao';
    document.getElementById('grupo-valor-promo').style.display = prod.emPromocao ? 'block' : 'none';
    document.getElementById('valor-promo').value = prod.valorPromo || '';

    renderizarFiltrosFormulario(prod.filtros || []);
    document.getElementById('btn-salvar').innerText = 'Salvar Alterações';
    document.getElementById('btn-cancelar-edicao').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.cancelarEdicao = function() {
    document.getElementById('form-produto').reset();
    document.getElementById('produto-id').value = '';
    document.getElementById('grupo-valor-promo').style.display = 'none';
    document.getElementById('exclusivo-assinante').checked = false;
    document.getElementById('btn-salvar').innerText = '+ Cadastrar Produto';
    document.getElementById('btn-cancelar-edicao').style.display = 'none';
    renderizarFiltrosFormulario([]);
};

window.excluirProduto = async function(id) {
    if (confirm('Excluir este produto?')) {
        produtos = produtos.filter(p => p.id !== id);
        await sincronizarEAtualizarProdutos();
        cancelarEdicao();
    }
};

// Inicia o sistema conectando com a nuvem automaticamente
inicializarSistemaDaNuvem();