// --- MÓDULO DE GESTÃO COM JSONBIN.IO INTEGRADO (FIXO) ---

const JSONBIN_ID = '6ad6a909ffd5d160537a6186';
const JSONBIN_KEY = '$2a$10$9P1mubytn4WC6yPQaxkDZejArdlPRGO06EoDYnqB6fyvkM5muZq1K';

let produtos = [];
let filtrosSalvos = ['Camisa', 'Blusa', 'Vestido', 'Calça'];
let clientes = []; 
let contatosDivulgacao = []; 

async function carregarDadosDaNuvem() {
    try {
        const resposta = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_KEY
            }
        });

        if (resposta.ok) {
            const resultado = await resposta.json();
            const dados = resultado.record || {};

            produtos = Array.isArray(dados.produtos) ? dados.produtos : [];
            filtrosSalvos = Array.isArray(dados.filtros) && dados.filtros.length > 0 ? dados.filtros : ['Camisa', 'Blusa', 'Vestido', 'Calça'];
            clientes = Array.isArray(dados.clientes) ? dados.clientes : [];
            contatosDivulgacao = Array.isArray(dados.contatosDivulgacao) ? dados.contatosDivulgacao : [];

            if (dados.config) {
                if (dados.config.nomeLoja) localStorage.setItem('nome_loja_vittoriana', dados.config.nomeLoja);
                if (dados.config.diasAssinatura) localStorage.setItem('dias_validade_assinatura', dados.config.diasAssinatura);
                if (dados.config.whatsappLoja) localStorage.setItem('whatsapp_loja_vittoriana', dados.config.whatsappLoja);
                if (dados.config.faixaTopo) localStorage.setItem('faixa_topo_vittoriana', dados.config.faixaTopo);
            }
            if (dados.senhaAdmin) localStorage.setItem('senha_admin_vittoriana', dados.senhaAdmin);
        } else {
            carregarLocalFallback();
        }
    } catch (e) {
        carregarLocalFallback();
    }

    inicializarInterface();
}

function carregarLocalFallback() {
    produtos = JSON.parse(localStorage.getItem('produtos_cadastrados')) || [];
    filtrosSalvos = JSON.parse(localStorage.getItem('filtros_cadastrados')) || ['Camisa', 'Blusa', 'Vestido', 'Calça'];
    clientes = JSON.parse(localStorage.getItem('clientes_cadastrados')) || [];
    contatosDivulgacao = JSON.parse(localStorage.getItem('contatos_divulgacao_cadastrados')) || [];
}

async function sincronizarComNuvem() {
    localStorage.setItem('produtos_cadastrados', JSON.stringify(produtos));
    localStorage.setItem('filtros_cadastrados', JSON.stringify(filtrosSalvos));
    localStorage.setItem('clientes_cadastrados', JSON.stringify(clientes));
    localStorage.setItem('contatos_divulgacao_cadastrados', JSON.stringify(contatosDivulgacao));

    const payload = {
        config: {
            nomeLoja: localStorage.getItem('nome_loja_vittoriana') || 'Vittoriana',
            diasAssinatura: localStorage.getItem('dias_validade_assinatura') || '30',
            whatsappLoja: localStorage.getItem('whatsapp_loja_vittoriana') || '',
            faixaTopo: localStorage.getItem('faixa_topo_vittoriana') || ''
        },
        senhaAdmin: localStorage.getItem('senha_admin_vittoriana') || 'admin123',
        produtos: produtos,
        filtros: filtrosSalvos,
        clientes: clientes,
        contatosDivulgacao: contatosDivulgacao
    };

    try {
        await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_KEY
            },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Erro ao sincronizar com o JSONBin:", e);
    }
}

function carregarConfiguracoesLoja() {
    let nomeLoja = localStorage.getItem('nome_loja_vittoriana') || 'Vittoriana';
    let diasAssinatura = localStorage.getItem('dias_validade_assinatura') || '30';
    let whatsappLoja = localStorage.getItem('whatsapp_loja_vittoriana') || '';
    let faixaTopo = localStorage.getItem('faixa_topo_vittoriana') || '5% NA PRIMEIRA COMPRA COM O CUPOM: VITTORIANA5 • NOVIDADES EXCLUSIVAS ATACADO • ENVIO SEGURO PARA TODO O BRASIL';

    const elementoTitulo = document.getElementById('painel-titulo-loja');
    const inputLoja = document.getElementById('input-nome-loja');
    const inputDias = document.getElementById('input-dias-assinatura');
    const inputWhatsapp = document.getElementById('input-whatsapp-loja');
    const inputFaixa = document.getElementById('input-faixa-topo');
    
    if (elementoTitulo) elementoTitulo.innerText = nomeLoja;
    if (inputLoja) inputLoja.value = nomeLoja;
    if (inputDias) inputDias.value = diasAssinatura;
    if (inputWhatsapp) inputWhatsapp.value = whatsappLoja;
    if (inputFaixa) inputFaixa.value = faixaTopo;

    document.title = `${nomeLoja} - Painel de Gestão`;
}

window.salvarConfiguracoesLoja = async function(e) {
    e.preventDefault();
    const novoNome = document.getElementById('input-nome-loja').value.trim();
    const novosDias = document.getElementById('input-dias-assinatura').value.trim();
    const novoWhatsapp = document.getElementById('input-whatsapp-loja').value.trim().replace(/\D/g, '');
    const novaFaixa = document.getElementById('input-faixa-topo').value.trim();

    if (!novoNome) return;

    localStorage.setItem('nome_loja_vittoriana', novoNome);
    localStorage.setItem('dias_validade_assinatura', novosDias || '30');
    localStorage.setItem('whatsapp_loja_vittoriana', novoWhatsapp);
    localStorage.setItem('faixa_topo_vittoriana', novaFaixa);
    
    carregarConfiguracoesLoja();
    await sincronizarComNuvem();
    alert("✦ Configurações salvas e sincronizadas na nuvem com sucesso!");
};

window.baixarBackupJSON = function() {
    const dadosBackup = {
        versao: "1.0",
        dataBackup: new Date().toISOString(),
        config: {
            nomeLoja: localStorage.getItem('nome_loja_vittoriana') || 'Vittoriana',
            diasAssinatura: localStorage.getItem('dias_validade_assinatura') || '30',
            whatsappLoja: localStorage.getItem('whatsapp_loja_vittoriana') || '',
            faixaTopo: localStorage.getItem('faixa_topo_vittoriana') || ''
        },
        senhaAdmin: localStorage.getItem('senha_admin_vittoriana') || 'admin123',
        produtos: produtos,
        filtros: filtrosSalvos,
        clientes: clientes,
        contatosDivulgacao: contatosDivulgacao
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dadosBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_vittoriana_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};

window.importarBackupJSON = async function(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const backup = JSON.parse(e.target.result);

            if (!backup.config || !backup.produtos) {
                alert("❌ O arquivo selecionado não é um backup válido.");
                return;
            }

            if (confirm("Deseja restaurar este backup? Os dados serão mesclados na nuvem.")) {
                localStorage.setItem('nome_loja_vittoriana', backup.config.nomeLoja);
                localStorage.setItem('dias_validade_assinatura', backup.config.diasAssinatura);
                localStorage.setItem('whatsapp_loja_vittoriana', backup.config.whatsappLoja);
                localStorage.setItem('faixa_topo_vittoriana', backup.config.faixaTopo);
                if (backup.senhaAdmin) localStorage.setItem('senha_admin_vittoriana', backup.senhaAdmin);

                filtrosSalvos = Array.from(new Set([...filtrosSalvos, ...(backup.filtros || [])]));
                
                let mapaProdutos = new Map(produtos.map(p => [p.id, p]));
                (backup.produtos || []).forEach(p => mapaProdutos.set(p.id, p));
                produtos = Array.from(mapaProdutos.values());

                let mapaClientes = new Map(clientes.map(c => [c.whatsapp, c]));
                (backup.clientes || []).forEach(c => {
                    if (!mapaClientes.has(c.whatsapp)) mapaClientes.set(c.whatsapp, c);
                });
                clientes = Array.from(mapaClientes.values());

                let mapaContatos = new Map(contatosDivulgacao.map(c => [c.whatsapp, c]));
                (backup.contatosDivulgacao || []).forEach(c => {
                    if (!mapaContatos.has(c.whatsapp)) mapaContatos.set(c.whatsapp, c);
                });
                contatosDivulgacao = Array.from(mapaContatos.values());

                await sincronizarComNuvem();
                alert("✦ Backup restaurado e sincronizado com a nuvem!");
                location.reload();
            }
        } catch (err) {
            alert("❌ Erro ao ler o arquivo JSON.");
        }
    };
    reader.readAsText(arquivo);
};

window.salvarNovaSenhaAdmin = async function(e) {
    e.preventDefault();
    const novaSenha = document.getElementById('input-nova-senha').value.trim();
    const confirmaSenha = document.getElementById('input-confirma-senha').value.trim();

    if (!novaSenha || novaSenha !== confirmaSenha || novaSenha.length < 4) {
        alert("❌ As senhas não coincidem ou são muito curtas.");
        return;
    }

    localStorage.setItem('senha_admin_vittoriana', novaSenha);
    document.getElementById('form-alterar-senha-admin').reset();
    await sincronizarComNuvem();
    alert("✦ Palavra-passe administrativa alterada com sucesso!");
};

window.alternarStatusCliente = async function(id) {
    clientes = clientes.map(c => {
        if (c.id === id) {
            c.status = c.status === 'Ativo' ? 'Pendente' : 'Ativo';
        }
        return c;
    });
    await sincronizarComNuvem();
    renderizarClientesAssinantes();
    renderizarCheckboxDivulgacaoClientes();
};

window.excluirClienteAssinante = async function(id) {
    if (confirm('Tem certeza que deseja remover este assinante?')) {
        clientes = clientes.filter(c => c.id !== id);
        await sincronizarComNuvem();
        renderizarClientesAssinantes();
        renderizarCheckboxDivulgacaoClientes();
    }
};

window.enviarAprovacaoWhatsApp = function(whatsapp, nome) {
    const mensagem = `Olá *${nome}*! Seu cadastro e acesso ao Clube Exclusivo Vittoriana foram **APROVADOS**! 🎉✨ Já pode acessar a nossa vitrine restrita. Seja muito bem-vindo(a)! 🛍️👑`;
    window.open(`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`, '_blank');
};

window.enviarAvisoVencimento = function(whatsapp, nome, diasRestantes) {
    let mensagem = diasRestantes < 0 ? 
        `Olá *${nome}*! Sua assinatura venceu há ${Math.abs(diasRestantes)} dias. Renove agora! 👑🛍️` : 
        `Olá *${nome}*! Sua assinatura vence em *${diasRestantes} dias*. Garanta sua renovação! 👑🛍️`;
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
            infoVencimento = diasRestantes < 0 ? 
                `<br><span style="color: #d9534f; font-weight: 600; font-size: 10px;">⚠️ Vencido há ${Math.abs(diasRestantes)} dias</span>` : 
                `<br><span style="color: #8c7355; font-size: 10px;">Vence em ${diasRestantes} dias</span>`;
        }

        tr.innerHTML = `
            <td>
                <strong style="font-size: 13px; color: #2b2b2b;">${c.nome}</strong><br>
                <small style="color: #666;">📱 ${c.whatsapp}</small>${infoSenha}
            </td>
            <td style="text-align: center;">
                <span onclick="alternarStatusCliente(${c.id})" style="cursor: pointer; padding: 3px 8px; border-radius: 2px; font-weight: 600; font-size: 10px; ${badgeStatusCor}" title="Clique para alternar">${c.status}</span>
                ${infoVencimento}
            </td>
            <td>
                <div class="btn-acao-container" style="flex-wrap: wrap;">
                    <button class="btn-acao btn-editar" onclick="enviarAprovacaoWhatsApp('${c.whatsapp}', '${c.nome}')">Aprovar Zap</button>
                    ${c.vencimento ? `<button class="btn-acao btn-editar" onclick="enviarAvisoVencimento('${c.whatsapp}', '${c.nome}',${diasRestantes})">Cobrar</button>` : ''}
                    <button class="btn-acao btn-excluir" onclick="excluirClienteAssinante(${c.id})">Excluir</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.cadastrarContatoDivulgacao = async function(e) {
    e.preventDefault();
    const nome = document.getElementById('div-nome').value.trim();
    const whatsapp = document.getElementById('div-whatsapp').value.trim().replace(/\D/g, '');

    if (!nome || !whatsapp) return;

    contatosDivulgacao.push({ id: Date.now(), nome, whatsapp });
    await sincronizarComNuvem();
    
    document.getElementById('form-divulgacao').reset();
    renderizarContatosDivulgacao();
    renderizarCheckboxDivulgacaoClientes();
    alert(`✦ Contato ${nome} cadastrado com sucesso!`);
};

window.excluirContatoDivulgacao = async function(id) {
    if (confirm('Tem certeza que deseja remover este contato?')) {
        contatosDivulgacao = contatosDivulgacao.filter(c => c.id !== id);
        await sincronizarComNuvem();
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
            <td><strong style="font-size: 12px; color: #2b2b2b;">${c.nome}</strong><br><small style="color: #666;">📱 ${c.whatsapp}</small></td>
            <td style="text-align: center;"><button class="btn-acao btn-excluir" onclick="excluirContatoDivulgacao(${c.id})">Excluir</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarCheckboxDivulgacaoClientes() {
    const container = document.getElementById('div-selecao-clientes');
    if (!container) return;
    container.innerHTML = '';

    if (clientes.length === 0 && contatosDivulgacao.length === 0) {
        container.innerHTML = `<small style="color: #888;">Nenhum cliente ou contato cadastrado.</small>`;
        return;
    }

    if (clientes.length > 0) {
        const t1 = document.createElement('div');
        t1.style.cssText = "font-size: 10px; font-weight: 600; color: #8c7355; text-transform: uppercase; margin: 4px 0;";
        t1.innerText = "👑 Assinantes do Clube";
        container.appendChild(t1);

        clientes.forEach(c => {
            const div = document.createElement('div');
            div.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 12px; padding-left: 6px;";
            div.innerHTML = `<label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="checkbox" value="${c.whatsapp}" data-nome="${c.nome}" class="check-cliente-div"><strong>${c.nome}</strong> (Assinante)</label>`;
            container.appendChild(div);
        });
    }

    if (contatosDivulgacao.length > 0) {
        const t2 = document.createElement('div');
        t2.style.cssText = "font-size: 10px; font-weight: 600; color: #8c7355; text-transform: uppercase; margin: 8px 0 4px 0;";
        t2.innerText = "📢 Contatos de Divulgação";
        container.appendChild(t2);

        contatosDivulgacao.forEach(c => {
            const div = document.createElement('div');
            div.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 12px; padding-left: 6px;";
            div.innerHTML = `<label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="checkbox" value="${c.whatsapp}" data-nome="${c.nome}" class="check-cliente-div"><strong>${c.nome}</strong> (Divulgação)</label>`;
            container.appendChild(div);
        });
    }
}

function renderizarCheckboxDivulgacaoProdutos() {
    const container = document.getElementById('div-selecao-produtos');
    if (!container) return;
    container.innerHTML = '';

    if (produtos.length === 0) {
        container.innerHTML = `<small style="color: #888;">Nenhum produto cadastrado.</small>`;
        return;
    }

    produtos.forEach(p => {
        let precoTexto = `R$ ${p.valor.toFixed(2)}`;
        if (p.emPromocao && p.valorPromo) precoTexto = `R$ ${p.valorPromo.toFixed(2)} (Promo)`;

        const div = document.createElement('div');
        div.style.cssText = "display: flex; align-items: center; gap: 8px; margin-bottom: 5px; font-size: 12px;";
        div.innerHTML = `<label style="display: flex; align-items: center; gap: 6px; cursor: pointer;"><input type="checkbox" value="${p.id}" class="check-produto-div"><strong>${p.nome}</strong> - <span style="color: #8c7355; font-weight: 600;">${precoTexto}</span></label>`;
        container.appendChild(div);
    });
}

window.selecionarTodosClientes = (m) => document.querySelectorAll('.check-cliente-div').forEach(c => c.checked = m);
window.selecionarTodosProdutos = (m) => document.querySelectorAll('.check-produto-div').forEach(c => c.checked = m);

window.dispararDivulganaoWhatsApp = function() {
    const clSel = Array.from(document.querySelectorAll('.check-cliente-div:checked'));
    const prSel = Array.from(document.querySelectorAll('.check-produto-div:checked'));

    if (clSel.length === 0 || prSel.length === 0) {
        alert('Selecione pelo menos um destinatário e um produto.');
        return;
    }

    let textosPr = [];
    prSel.forEach(chk => {
        const p = produtos.find(item => item.id == chk.value);
        if (p) {
            let prStr = `R$ ${p.valor.toFixed(2).replace('.', ',')}`;
            if (p.emPromocao && p.valorPromo) prStr = `R$ ${p.valorPromo.toFixed(2).replace('.', ',')} (Preço Exclusivo)`;
            textosPr.push(`✨ *${p.nome}*\n📝 ${p.descricao || 'Peça exclusiva.'}\n💰 *${prStr}*\n`);
        }
    });

    let mensagem = `Olá *${clSel[0].getAttribute('data-nome')}*! Selecionamos novidades para você:\n\n${textosPr.join('\n-------------------\n\n')}\nGostaria de garantir as suas peças? Responda aqui! 🛍️👑`;
    window.open(`https://wa.me/55${clSel[0].value.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`, '_blank');
};

function renderizarFiltrosFormulario(filtrosSel = []) {
    const container = document.getElementById('lista-checkbox-filtros');
    if (!container) return;
    container.innerHTML = '';

    filtrosSalvos.forEach(filtro => {
        const isChecked = filtrosSel.includes(filtro) ? 'checked' : '';
        const div = document.createElement('div');
        div.className = 'filtro-item-checkbox';
        div.innerHTML = `<label><input type="checkbox" value="${filtro}" ${isChecked} class="checkbox-filtro-prod">${filtro}</label><span class="btn-excluir-filtro" onclick="excluirFiltroGlobal('${filtro}')">&times;</span>`;
        container.appendChild(div);
    });
}

window.criarNovoFiltro = async function() {
    const input = document.getElementById('novo-filtro-input');
    const nomeFiltro = input.value.trim();
    if (!nomeFiltro || filtrosSalvos.includes(nomeFiltro)) return;

    filtrosSalvos.push(nomeFiltro);
    input.value = '';
    await sincronizarComNuvem();
    renderizarFiltrosFormulario();
};

window.excluirFiltroGlobal = async function(nomeFiltro) {
    if (confirm(`Excluir filtro "${nomeFiltro}"?`)) {
        filtrosSalvos = filtrosSalvos.filter(f => f !== nomeFiltro);
        produtos.forEach(p => { if (p.filtros) p.filtros = p.filtros.filter(f => f !== nomeFiltro); });
        await sincronizarEAtualizarProdutos();
        renderizarFiltrosFormulario();
    }
};

window.toggleSanfona = (el) => el.parentElement.classList.toggle('recolhido');
window.toggleValorPromo = () => document.getElementById('grupo-valor-promo').style.display = document.getElementById('promocao-check').value === 'sim' ? 'block' : 'none';

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
    const filtrosSel = Array.from(document.querySelectorAll('.checkbox-filtro-prod:checked')).map(el => el.value);

    const arquivos = Array.from(inputImagens.files);
    if (arquivos.length > 0) {
        processarImagensEmBase64(arquivos, function(imgs64) {
            salvarOuAtualizarNoArray(id, nome, descricao, valor, emPromocao, valorPromo, imgs64, filtrosSel, exclusivoAssinante);
        });
    } else {
        let imgsAntigas = id ? (produtos.find(p => p.id == id)?.imagens || []) : [];
        salvarOuAtualizarNoArray(id, nome, descricao, valor, emPromocao, valorPromo, imgsAntigas, filtrosSel, exclusivoAssinante);
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
    const idxAntigo = produtos.findIndex(p => p.id === idProduto);
    if (idxAntigo === -1) return;
    const [movido] = produtos.splice(idxAntigo, 1);
    produtos.splice(Math.min(novaOrdem - 1, produtos.length), 0, movido);
    produtos.forEach((p, idx) => p.ordem = idx + 1);
    await sincronizarEAtualizarProdutos();
};

async function sincronizarEAtualizarProdutos() {
    produtos.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    await sincronizarComNuvem();
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

function inicializarInterface() {
    carregarConfiguracoesLoja();
    renderizarProdutos();
    renderizarFiltrosFormulario();
    renderizarClientesAssinantes();
    renderizarContatosDivulgacao();
    renderizarCheckboxDivulgacaoClientes();
    renderizarCheckboxDivulgacaoProdutos();
}

carregarDadosDaNuvem();