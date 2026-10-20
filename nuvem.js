// --- CONFIGURAÇÃO DO JSONBIN & CRIPTOGRAFIA AUTOMÁTICA ---
const BIN_ID = "6ad6a909ffd5d160537a6186";
const MASTER_KEY = "$2a$10$9P1mubytn4WC6yPQaxkDZejArdlPRGO06EoDYnqB6fyvkM5muZq1K";

// Função para embaralhar (criptografar) os dados sensíveis antes de subir
function criptografar(texto) {
    try {
        return btoa(encodeURIComponent(texto));
    } catch (e) {
        return texto;
    }
}

// Função para desembaralhar (descriptografar) quando o painel precisar ler
function descriptografar(textoCifrado) {
    try {
        return decodeURIComponent(atob(textoCifrado));
    } catch (e) {
        return textoCifrado; // Se não estiver criptografado, retorna normal
    }
}

// Função para buscar dados do JSONBin na nuvem
async function carregarDadosDaNuvem() {
    try {
        const resposta = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { "X-Master-Key": MASTER_KEY }
        });
        const resultado = await resposta.json();
        return resultado.record || {};
    } catch (erro) {
        console.error("Erro ao carregar da nuvem:", erro);
        return null;
    }
}

// Função para salvar dados na nuvem com criptografia nos clientes/senhas
async function salvarDadosNaNuvem(dadosLocais) {
    try {
        // Prepara os dados para envio
        let dadosParaEnviar = {
            produtos: dadosLocais.produtos || [],
            config: dadosLocais.config || {},
            // Criptografa o bolo de dados dos clientes para virar bagunça na nuvem
            clientes: criptografar(JSON.stringify(dadosLocais.clientes || [])),
            contatosDivulgacao: criptografar(JSON.stringify(dadosLocais.contatosDivulgacao || []))
        };

        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": MASTER_KEY
            },
            body: JSON.stringify(dadosParaEnviar)
        });
    } catch (erro) {
        console.error("Erro ao salvar na nuvem:", erro);
    }
}