document.addEventListener("DOMContentLoaded", async function () {
    // Sincroniza os clientes da nuvem ao abrir a tela de login
    const dadosNuvem = await carregarDadosDaNuvem();
    if (dadosNuvem) {
        if (dadosNuvem.clientes) {
            try {
                localStorage.setItem('clientes_cadastrados', JSON.stringify(JSON.parse(descriptografar(dadosNuvem.clientes))));
            } catch (e) {}
        }
        if (dadosNuvem.config && dadosNuvem.config.nome) {
            localStorage.setItem('nome_loja_vittoriana', dadosNuvem.config.nome);
        }
    }

    const nomeLojaSalvo = localStorage.getItem('nome_loja_vittoriana');
    if (nomeLojaSalvo) {
        const tituloMarca = document.getElementById('login-titulo-loja');
        if (tituloMarca) tituloMarca.innerText = nomeLojaSalvo;
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
        titulo.innerText = "👑 Entrar como Assinante";
        subtitulo.innerText = "Aceda às coleções privadas e preços de atacado do clube.";
        badge.innerText = "OPÇÃO 1 • CLUBE EXCLUSIVO";
    } else {
        formLogin.style.display = 'none';
        formCadastro.style.display = 'block';
        titulo.innerText = "✨ Criar Conta de Assinante";
        subtitulo.innerText = "Preencha seus dados para solicitar acesso exclusivo ao clube de atacado.";
        badge.innerText = "OPÇÃO 1 • NOVO CADASTRO";
    }
};

window.cadastrarNovoAssinante = async function(event) {
    event.preventDefault();
    const nome = document.getElementById('cad-nome').value.trim();
    const sobrenome = document.getElementById('cad-sobrenome').value.trim();
    const whatsapp = document.getElementById('cad-whatsapp').value.trim().replace(/\D/g, '');
    const senha = document.getElementById('cad-senha').value.trim();

    // Puxa dados atuais da nuvem antes de cadastrar para evitar conflito
    let dadosNuvem = await carregarDadosDaNuvem();
    let clientes = [];
    let produtosAtuais = [];
    let contatosAtuais = [];

    if (dadosNuvem) {
        produtosAtuais = dadosNuvem.produtos || [];
        contatosAtuais = dadosNuvem.contatosDivulgacao || [];
        if (dadosNuvem.clientes) {
            try { clientes = JSON.parse(descriptografar(dadosNuvem.clientes)); } catch (e) { clientes = []; }
        }
    }

    const existe = clientes.find(c => c.whatsapp === whatsapp);
    if (existe) {
        alert("❌ Este número de WhatsApp já está cadastrado. Tente entrar na sua conta.");
        return;
    }

    const diasValidadeConfig = parseInt(localStorage.getItem('dias_validade_assinatura')) || 30;
    let dataVenc = new Date();
    dataVenc.setDate(dataVenc.getDate() + diasValidadeConfig);
    const dataVencimentoStr = dataVenc.toISOString().split('T')[0];

    const novoCliente = {
        id: Date.now(),
        nome: `${nome} ${sobrenome}`,
        whatsapp,
        senha,
        tipo: 'Assinante Site',
        status: 'Pendente',
        vencimento: dataVencimentoStr
    };

    clientes.push(novoCliente);

    // Salva tudo na nuvem com criptografia automática nos clientes
    let nomeLoja = localStorage.getItem('nome_loja_vittoriana') || 'Vittoriana';
    let diasAssinatura = localStorage.getItem('dias_validade_assinatura') || '30';

    await salvarDadosNaNuvem({
        produtos: produtosAtuais,
        clientes: clientes,
        contatosDivulgacao: contatosAtuais,
        config: { nome: nomeLoja, dias: diasAssinatura }
    });

    localStorage.setItem('clientes_cadastrados', JSON.stringify(clientes));

    alert("✨ Solicitação enviada com sucesso!\n\nSeu cadastro foi encaminhado para a administração. Assim que aprovado, você poderá acessar o clube.");
    document.getElementById('form-cadastro-assinante').reset();
    alternarModoLoginCadastro();
};

window.autenticarAssinante = async function(event) {
    event.preventDefault();
    const whatsapp = document.getElementById('login-whatsapp').value.trim().replace(/\D/g, '');
    const senha = document.getElementById('senha-assinante').value.trim();

    // Garante que puxa a lista mais atual da nuvem
    let dadosNuvem = await carregarDadosDaNuvem();
    let clientes = [];
    if (dadosNuvem && dadosNuvem.clientes) {
        try { clientes = JSON.parse(descriptografar(dadosNuvem.clientes)); } catch (e) { clientes = []; }
    } else {
        clientes = JSON.parse(localStorage.getItem('clientes_cadastrados')) || [];
    }

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
        window.location.href = '../vitrine/vitrine.html';
    } else {
        alert("❌ WhatsApp ou palavra-passe incorretos, ou cadastro pendente/não encontrado.");
    }
};

window.autenticarProprietaria = function(event) {
    event.preventDefault();
    const senhaInformada = document.getElementById('senha-gestao').value;
    const senhaAdminSalva = localStorage.getItem('senha_admin_vittoriana') || 'admin123';

    if (senhaInformada === senhaAdminSalva) {
        alert('✦ Autenticação bem-sucedida!\nRedirecionando para o Painel de Controle e Gestão...');
        window.location.href = '../index.html';
    } else {
        alert('❌ Palavra-passe incorreta!');
    }
};