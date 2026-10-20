// --- MÓDULO DE GESTÃO DA LOJA, PRODUTOS, ASSINANTES E DIVULGAÇÃO ---

let produtos = JSON.parse(localStorage.getItem('produtos_cadastrados')) || [];
let filtrosSalvos = JSON.parse(localStorage.getItem('filtros_cadastrados')) || ['Camisa', 'Blusa', 'Vestido', 'Calça'];
let clientes = JSON.parse(localStorage.getItem('clientes_cadastrados')) || []; 
let contatosDivulgacao = JSON.parse(localStorage.getItem('contatos_divulgacao_cadastrados')) || []; 

// FUNÇÃO DE SINCRONIZAÇÃO AUTOMÁTICA COM O BACKUP DO SERVIDOR (GITHUB)
async function sincronizarBackupComServidor() {
    try {
        const resposta = await fetch('backup_vittoriana_2026-10-20.json');
        if (!resposta.ok) return;

        const backup = await resposta.json();

        if (backup.config) {
            if (backup.config.nomeLoja) localStorage.setItem('nome_loja_vittoriana', backup.config.nomeLoja);
            if (backup.config.diasAssinatura) localStorage.setItem('dias_validade_assinatura', backup.config.diasAssinatura);
            if (backup.config.whatsappLoja) localStorage.setItem('whatsapp_loja_vittoriana', backup.config.whatsappLoja);
            if (backup.config.faixaTopo) localStorage.setItem('faixa_topo_vittoriana', backup.config.faixaTopo);
        }
        if (backup.senhaAdmin) {
            localStorage.setItem('senha_admin_vittoriana', backup.senhaAdmin);
        }
        if (backup.filtros) {
            localStorage.setItem('filtros_cadastrados', JSON.stringify(backup.filtros));
            filtrosSalvos = backup.filtros;
        }
        if (backup.produtos) {
            localStorage.setItem('produtos_cadastrados', JSON.stringify(backup.produtos));
            produtos = backup.produtos;
        }
        if (backup.clientes) {
            localStorage.setItem('clientes_cadastrados', JSON.stringify(backup.clientes));
            clientes = backup.clientes;
        }
        if (backup.contatosDivulgacao) {
            localStorage.setItem('contatos_divulgacao_cadastrados', JSON.stringify(backup.contatosDivulgacao));
            contatosDivulgacao = backup.contatosDivulgacao;
        }
    } catch (erro) {
        console.log("Arquivo de backup local não encontrado ou modo offline.");
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

    // Altera o título da aba do navegador dinamicamente
    document.title = `${nomeLoja} - Painel de Gestão`;
}

window.salvarConfiguracoesLoja = function(e) {
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
    alert("✦ Configurações, WhatsApp e Faixa salvas com sucesso!");
};

// --- SISTEMA DE BACKUP INTELIGENTE EM JSON (ANTI-CONFLITO) ---
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
        produtos: JSON.parse(localStorage.getItem('produtos_cadastrados')) || [],
        filtros: JSON.parse(localStorage.getItem('filtros_cadastrados')) || [],
        clientes: JSON.parse(localStorage.getItem('clientes_cadastrados')) || [],
        contatosDivulgacao: JSON.parse(localStorage.getItem('contatos_divulgacao_cadastrados')) || []
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dadosBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_vittoriana_2026-10-20.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};

window.importarBackupJSON = function(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);

            if (!backup.config || !backup.produtos) {
                alert("❌ O arquivo selecionado não é um backup válido do Vittoriana.");
                return;
            }

            if (confirm("Deseja restaurar este backup? Os novos cadastros e produtos serão mesclados inteligentemente sem conflito.")) {
                localStorage.setItem('nome_loja_vittoriana', backup.config.nomeLoja);
                localStorage.setItem('dias_validade_assinatura', backup.config.diasAssinatura);
                localStorage.setItem('whatsapp_loja_vittoriana', backup.config.whatsappLoja);
                localStorage.setItem('faixa_topo_vittoriana', backup.config.faixaTopo);
                if (backup.senhaAdmin) localStorage.setItem('senha_admin_vittoriana', backup.senhaAdmin);

                let filtrosAtuais = JSON.parse(localStorage.getItem('filtros_cadastrados')) || [];
                let filtrosUnidos = Array.from(new Set([...filtrosAtuais, ...(backup.filtros || [])]));
                localStorage.setItem('filtros_cadastrados', JSON.stringify(filtrosUnidos));

                let produtosAtuais = JSON.parse(localStorage.getItem('produtos_cadastrados')) || [];
                let mapaProdutos = new Map(produtosAtuais.map(p => [p.id, p]));
                (backup.produtos || []).forEach(p => mapaProdutos.set(p.id, p));
                localStorage.setItem('produtos_cadastrados', JSON.stringify(Array.from(mapaProdutos.values())));

                let clientesAtuais = JSON.parse(localStorage.getItem('clientes_cadastrados')) || [];
                let mapaClientes = new Map(clientesAtuais.map(c => [c.whatsapp, c]));
                (backup.clientes || []).forEach(c => {
                    if (!mapaClientes.has(c.whatsapp)) {
                        mapaClientes.set(c.whatsapp, c);
                    }
                });
                localStorage.setItem('clientes_cadastrados', JSON.stringify(Array.from(mapaClientes.values())));

                let contatosAtuais = JSON.parse(localStorage.getItem('contatos_divulgacao_cadastrados')) || [];
                let mapaContatos = new Map(contatosAtuais.map(c => [c.whatsapp, c]));
                (backup.contatosDivulgacao || []).forEach(c => {
                    if (!mapaContatos.has(c.whatsapp)) {
                        mapaContatos.set(c.whatsapp, c);
                    }
                });
                localStorage.setItem('contatos_divulgacao_cadastrados', JSON.stringify(Array.from(mapaContatos.values())));

                alert("✦ Backup restaurado com sucesso e mesclado sem conflitos!");
                location.reload();
            }
        } catch (err) {
            alert("❌ Erro ao ler o arquivo JSON de backup.");
        }
    };
    reader.readAsText(arquivo);
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
window.alternarStatusCliente = function(id) {
    clientes = clientes.map(c => {
        if (c.id === id) {
            c.status = c.status === 'Ativo' ? 'Pendente' : 'Ativo';
        }
        return c;
    });
    localStorage.setItem('clientes_cadastrados', JSON.stringify(clientes));
    renderizarClientesAssinantes();
    renderizarCheckboxDivulgacaoClientes();
};

window.excluirClienteAssinante = function(id) {
    if (confirm('Tem certeza que deseja remover este assinante?')) {
        clientes = clientes.filter(c => c.id !== id);
        localStorage.setItem('clientes_cadastrados', JSON.stringify(clientes));
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

// Funções de Edição Direta no Painel de Assinantes
window.habilitarEdicaoCliente = function(id) {
    const spanInfo = document.getElementById(`info-cliente-${id}`);
    const spanBotoes = document.getElementById(`acoes-cliente-${id}`);
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;

    // Divide o nome caso tenha sobrenome salvo junto
    let partesNome = cliente.nome ? cliente.nome.split(' ') : ['', ''];
    let nomeP = partesNome[0] || '';
    let sobrenomeP = partesNome.slice(1).join(' ') || '';

    spanInfo.innerHTML = `
        <div style="display: flex; gap: 5px; margin-bottom: 4px;">
            <input type="text" id="edit-nome-${id}" value="${nomeP}" placeholder="Nome" style="padding: 4px; font-size: 11px; width: 50%;">
            <input type="text" id="edit-sobrenome-${id}" value="${sobrenomeP}" placeholder="Sobrenome" style="padding: 4px; font-size: 11px; width: 50%;">
        </div>
        <div style="display: flex; gap: 5px;">
            <input type="text" id="edit-whatsapp-${id}" value="${cliente.whatsapp}" placeholder="WhatsApp" style="padding: 4px; font-size: 11px; width: 50%;">
            <input type="text" id="edit-senha-${id}" value="${cliente.senha || ''}" placeholder="Senha" style="padding: 4px; font-size: 11px; width: 50%;">
        </div>
    `;

    spanBotoes.innerHTML = `
        <button class="btn-acao btn-editar" onclick="salvarEdicaoCliente(${id})" style="background: #2e7d32; color: #fff; border: none;">Salvar</button>
        <button class="btn-acao btn-excluir" onclick="renderizarClientesAssinantes()">Cancelar</button>
    `;
};

window.salvarEdicaoCliente = function(id) {
    const novoNome = document.getElementById(`edit-nome-${id}`).value.trim();
    const novoSobrenome = document.getElementById(`edit-sobrenome-${id}`).value.trim();
    const novoWhatsapp = document.getElementById(`edit-whatsapp-${id}`).value.trim().replace(/\D/g, '');
    const novaSenha = document.getElementById(`edit-senha-${id}`).value.trim();

    if (!novoNome || !novoWhatsapp) {
        alert("❌ Nome e WhatsApp são obrigatórios.");
        return;
    }

    clientes = clientes.map(c => {
        if (c.id === id) {
            c.nome = `${novoNome} ${novoSobrenome}`.trim();
            c.whatsapp = novoWhatsapp;
            c.senha = novaSenha;
        }
        return c;
    });

    localStorage.setItem('clientes_cadastrados', JSON.stringify(clientes));
    renderizarClientesAssinantes();
    renderizarCheckboxDivulgacaoClientes();
    alert("✦ Dados do assinante atualizados com sucesso!");
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
                <div id="info-cliente-${c.id}">
                    <strong style="font-size: 13px; color: #2b2b2b;">${c.nome}</strong><br>
                    <small style="color: #666;">📱 ${c.whatsapp}</small>
                    ${infoSenha}
                </div>
            </td>
            <td style="text-align: center;">
                <span onclick="alternarStatusCliente(${c.id})" style="cursor: pointer; padding: 3px 8px; border-radius: 2px; font-weight: 600; font-size: 10px; ${badgeStatusCor}" title="Clique para alternar status (Ativo/Pendente)">
                    ${c.status}
                </span>
                ${infoVencimento}
            </td>
            <td>
                <div class="btn-acao-container" id="acoes-cliente-${c.id}" style="flex-wrap: wrap;">
                    <button class="btn-acao btn-editar" onclick="habilitarEdicaoCliente(${c.id})" title="Editar dados do cliente">Editar</button>
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
window.cadastrarContatoDivulgacao = function(e) {
    e.preventDefault();
    const nome = document.getElementById('div-nome').value.trim();
    const whatsapp = document.getElementById('div-whatsapp').value.trim().replace(/\D/g, '');

    if (!nome || !whatsapp) return;

    const novoContato = { id: Date.now(), nome, whatsapp };
    contatosDivulgacao.push(novoContato);
    localStorage.setItem('contatos_divulgacao_cadastrados', JSON.stringify(contatosDivulgacao));
    
    document.getElementById('form-divulgacao').reset();
    renderizarContatosDivulgacao();
    renderizarCheckboxDivulgacaoClientes();
    alert(`✦ Contato de divulgação ${nome} cadastrado com sucesso!`);
};

window.excluirContatoDivulgacao = function(id) {
    if (confirm('Tem certeza que deseja remover este contato de divulgação?')) {
        contatosDivulgacao = contatosDivulgacao.filter(c => c.id !== id);
        localStorage.setItem('contatos_divulgacao_cadastrados', JSON.stringify(contatosDivulgacao));
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

produtos.forEach((prod, index) => {
    if (prod.ordem === undefined || prod.ordem === null) prod.ordem = index + 1;
    if (!prod.filtros) prod.filtros = [];
    if (prod.exclusivoAssinante === undefined) prod.exclusivoAssinante = false;
});

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
    localStorage.setItem('filtros_cadastrados', JSON.stringify(filtrosSalvos));
    input.value = '';
    renderizarFiltrosFormulario();
};

window.excluirFiltroGlobal = function(nomeFiltro) {
    if (confirm(`Excluir filtro "${nomeFiltro}"?`)) {
        filtrosSalvos = filtrosSalvos.filter(f => f !== nomeFiltro);
        localStorage.setItem('filtros_cadastrados', JSON.stringify(filtrosSalvos));
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

function salvarOuAtualizarNoArray(id, nome, descricao, valor, emPromocao, valorPromo, imagens, filtros, exclusivoAssinante) {
    if (id) {
        produtos = produtos.map(prod => prod.id == id ? { ...prod, nome, descricao, valor, emPromocao, valorPromo, imagens, filtros, exclusivoAssinante } : prod);
    } else {
        const maiorOrdem = produtos.length > 0 ? Math.max(...produtos.map(p => p.ordem || 0)) + 1 : 1;
        produtos.push({ id: Date.now(), nome, descricao, valor, emPromocao, valorPromo, imagens, filtros, ordem: maiorOrdem, exclusivoAssinante });
    }
    sincronizarEAtualizarProdutos();
    cancelarEdicao();
}

window.alterarOrdemProduto = function(idProduto, novaOrdemInput) {
    let novaOrdem = parseInt(novaOrdemInput);
    if (isNaN(novaOrdem) || novaOrdem < 1) return;
    produtos.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const indexAntigo = produtos.findIndex(p => p.id === idProduto);
    if (indexAntigo === -1) return;
    const [produtoMovido] = produtos.splice(indexAntigo, 1);
    produtos.splice(Math.min(novaOrdem - 1, produtos.length), 0, produtoMovido);
    produtos.forEach((p, idx) => p.ordem = idx + 1);
    sincronizarEAtualizarProdutos();
};

function sincronizarEAtualizarProdutos() {
    produtos.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    localStorage.setItem('produtos_cadastrados', JSON.stringify(produtos));
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

window.excluirProduto = function(id) {
    if (confirm('Excluir este produto?')) {
        produtos = produtos.filter(p => p.id !== id);
        sincronizarEAtualizarProdutos();
        cancelarEdicao();
    }
};

// Executa a sincronização com o backup e atualiza a interface
sincronizarBackupComServidor().then(() => {
    carregarConfiguracoesLoja();
    renderizarProdutos();
    renderizarFiltrosFormulario();
    renderizarClientesAssinantes();
    renderizarContatosDivulgacao();
    renderizarCheckboxDivulgacaoClientes();
    renderizarCheckboxDivulgacaoProdutos();
});