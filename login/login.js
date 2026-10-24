// FUNÇÃO DE SINCRONIZAÇÃO AUTOMÁTICA COM O BACKUP DO SERVIDOR (GITHUB) NO LOGIN
async function sincronizarBackupLogin() {
    try {
        const resposta = await fetch('../backup_vittoriana_2026-10-20.json');
        if (!resposta.ok) return;

        const backup = await resposta.json();

        if (backup.config) {
            if (backup.config.nomeLoja) localStorage.setItem('nome_loja_vittoriana', backup.config.nomeLoja);
            if (backup.config.faixaTopo) localStorage.setItem('faixa_topo_vittoriana', backup.config.faixaTopo);
            if (backup.config.whatsappLoja) localStorage.setItem('whatsapp_loja_vittoriana', backup.config.whatsappLoja);
        }
        if (backup.clientes) {
            localStorage.setItem('clientes_cadastrados', JSON.stringify(backup.clientes));
        }
        if (backup.senhaAdmin) {
            localStorage.setItem('senha_admin_vittoriana', backup.senhaAdmin);
        }
    } catch (erro) {
        console.log("Arquivo de backup local não encontrado ou modo offline no login.");
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    // Sincroniza o backup antes de carregar o login
    await sincronizarBackupLogin();

    const nomeLojaSalvo = localStorage.getItem('nome_loja_vittoriana');
    if (nomeLojaSalvo) {
        document.title = `${nomeLojaSalvo} - Acesso Restrito`;
        const tituloMarca = document.getElementById('login-titulo-loja');
        if (tituloMarca) tituloMarca.innerText = nomeLojaSalvo;
    }
    const faixaSalva = localStorage.getItem('faixa_topo_vittoriana');
    if (faixaSalva) {
        const faixaElemento = document.querySelector('.faixa-topo-omega');
        if (faixaElemento) {
            faixaElemento.innerHTML = faixaSalva.split('•').map(t => `<span>${t.trim()}</span>`).join('<span class="separador">•</span>');
        }
    }
});

window.alternarModoLoginCadastro = function() {
    const formLogin = document.getElementById('form-login-assinante');
    const formCadastro = document.getElementById('form-cadastro-assinante');
    const titulo = document.getElementById('titulo-form-auth');
    const subtitulo = document.getElementById('subtitulo-form-auth');
    const badge = document.getElementById('badge-modo-titulo');

    if (formLogin.style.display === 'none') {
        formLogin.style.display = 'block';
        formCadastro.style.display = 'none';
        titulo.innerText = "👑 Entrar";
        subtitulo.innerText = "Aceda às coleções privadas e preços exclusivos do clube.";
        badge.innerText = "OPÇÃO 1 • CLUBE EXCLUSIVO";
    } else {
        formLogin.style.display = 'none';
        formCadastro.style.display = 'block';
        titulo.innerText = "✨ Criar Conta Clube Exclusivo";
        subtitulo.innerText = "Preencha seus dados para solicitar acesso exclusivo ao clube.";
        badge.innerText = "OPÇÃO 1 • NOVO CADASTRO";
    }
};

window.cadastrarNovoAssinante = function(event) {
    event.preventDefault();
    const nome = document.getElementById('cad-nome').value.trim();
    const sobrenome = document.getElementById('cad-sobrenome').value.trim();
    const whatsapp = document.getElementById('cad-whatsapp').value.trim().replace(/\D/g, '');
    const senha = document.getElementById('cad-senha').value.trim();

    let clientes = JSON.parse(localStorage.getItem('clientes_cadastrados')) || [];

    const existe = clientes.find(c => c.whatsapp === whatsapp);
    if (existe) {
        alert("❌ Este número de WhatsApp já está cadastrado. Tente entrar na sua conta.");
        return;
    }

    const diasValidadeConfig = parseInt(localStorage.getItem('dias_validade_assinatura')) || 30;

    let dataVenc = new Date();
    dataVenc.setDate(dataVenc.getDate() + diasValidadeConfig);
    const dataVencimentoStr = dataVenc.toISOString().split('T')[0];

    const nomeCompleto = `${nome} ${sobrenome}`;

    const novoCliente = {
        id: Date.now(),
        nome: nomeCompleto,
        whatsapp,
        senha,
        tipo: 'Assinante Site',
        status: 'Pendente',
        vencimento: dataVencimentoStr
    };

    clientes.push(novoCliente);
    localStorage.setItem('clientes_cadastrados', JSON.stringify(clientes));

    // Pega o WhatsApp configurado pela proprietária na loja
    const whatsappLoja = localStorage.getItem('whatsapp_loja_vittoriana') || '62999999999';
    
    // Mensagem formatada enviando os dados exatamente como você pediu
    const textoMensagem = encodeURIComponent(
        `Olá! Gostaria de solicitar meu cadastro no clube exclusivo.\n\n` +
        `*Dados do Cadastro:*\n` +
        `• Nome: ${nome}\n` +
        `• Sobrenome: ${sobrenome}\n` +
        `• Telefone/WhatsApp: ${whatsapp}\n` +
        `• Senha: ${senha}\n\n` +
        `Por favor, realize meu cadastro no painel!`
    );

    const urlWhatsapp = `https://wa.me/55${whatsappLoja.replace(/\D/g, '')}?text=${textoMensagem}`;

    alert("✨ Dados salvos como pendentes!\n\nVocê será redirecionado para o WhatsApp da loja para enviar seus dados de cadastro para a proprietária.");
    
    document.getElementById('form-cadastro-assinante').reset();
    
    // Abre a conversa do WhatsApp
    window.open(urlWhatsapp, '_blank');
    
    alternarModoLoginCadastro();
};

function autenticarAssinante(event) {
    event.preventDefault();
    const whatsapp = document.getElementById('login-whatsapp').value.trim().replace(/\D/g, '');
    const senha = document.getElementById('senha-assinante').value.trim();

    let clientes = JSON.parse(localStorage.getItem('clientes_cadastrados')) || [];
    const clienteEncontrado = clientes.find(c => c.whatsapp === whatsapp && c.senha === senha);

    if (clienteEncontrado) {
        if (clienteEncontrado.status !== 'Ativo') {
            alert("⏳ Sua conta ainda está com status PENDENTE de aprovação pela administração.");
            return;
        }

        localStorage.setItem('usuario_assinante_logado', 'true');
        localStorage.setItem('cliente_logado_nome', clienteEncontrado.nome);
        localStorage.setItem('cliente_logado_whatsapp', clienteEncontrado.whatsapp);

        alert(`👑 Bem-vindo(a) de volta, ${clienteEncontrado.nome}!\nAcesso liberado ao clube exclusivo.`);
        window.location.href = '../vitrine/index.html';
    } else {
        alert("❌ WhatsApp ou palavra-passe incorretos, ou cadastro pendente/não encontrado.");
    }
}

function autenticarProprietaria(event) {
    event.preventDefault();
    const senhaInformada = document.getElementById('senha-gestao').value;
    
    const senhaAdminSalva = localStorage.getItem('senha_admin_vittoriana') || 'admin123';

    if (senhaInformada === senhaAdminSalva) {
        alert('✦ Autenticação bem-sucedida!\nRedirecionando para o Painel de Controle e Gestão...');
        window.location.href = '../painel.html';
    } else {
        alert('❌ Palavra-passe incorreta!');
    }
}