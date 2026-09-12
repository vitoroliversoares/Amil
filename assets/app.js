/**
 * Validador de Documentos Médicos & Assinatura Digital
 *
 * Configurações:
 * - Nome do documento exibido: nome real do arquivo selecionado pelo usuário no Windows
 * - Registro Profissional: CRM 217697 (sempre)
 * - UF: SP (sempre)
 * - Token oficial: yBwpLR (sempre)
 * - Botão "Escolher Arquivo" abre a seleção nativa de arquivos do Windows
 */

const VALID_TOKEN = "yBwpLR";
const DEFAULT_CRM = "CRM 217697";
const DEFAULT_UF = "SP";
const FALLBACK_FILENAME = "Atestado_Medico.pdf";

document.addEventListener("DOMContentLoaded", function () {
  
  // =======================================================
  // 1. TELA INICIAL (index.html) -> Apenas o botão Avançar é interativo
  // =======================================================

  // =======================================================
  // 2. TELA DOS PASSOS (validar.html)
  // Sempre inicia limpa, sem nenhum arquivo ou dados preenchidos
  // =======================================================
  const validarFileInput = document.getElementById("validar-file-input");
  const btnValidarChoose = document.getElementById("btn-validar-choose");
  const validarFileStatus = document.getElementById("validar-file-status");
  const btnValidarAction = document.getElementById("btn-validar-action");
  const validarCrmBadge = document.getElementById("validar-crm-badge");
  const validarUfBadge = document.getElementById("validar-uf-badge");

  // Limpa qualquer arquivo residual de sessões anteriores ao carregar a tela
  if (validarFileInput) {
    sessionStorage.removeItem("atestado_filename");
    sessionStorage.removeItem("atestado_crm");
    sessionStorage.removeItem("atestado_uf");
    sessionStorage.removeItem("token_autenticado");
  }

  function aplicarArquivo(nomeArquivo) {
    sessionStorage.setItem("atestado_filename", nomeArquivo);
    sessionStorage.setItem("atestado_crm", DEFAULT_CRM);
    sessionStorage.setItem("atestado_uf", DEFAULT_UF);

    if (validarFileStatus) {
      validarFileStatus.innerHTML = `
        <div class="file-status-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>${nomeArquivo} (Anexado)</span>
        </div>
      `;
    }

    if (btnValidarChoose) {
      btnValidarChoose.innerHTML = `
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        Trocar Arquivo
      `;
    }

    // Preenche automaticamente o registro profissional e a UF
    if (validarCrmBadge) {
      validarCrmBadge.textContent = DEFAULT_CRM;
      validarCrmBadge.classList.add("filled");
    }
    if (validarUfBadge) {
      validarUfBadge.textContent = DEFAULT_UF;
      validarUfBadge.classList.add("filled");
    }

    // Aplica destaque visual no botão Validar para guiar o usuário
    if (btnValidarAction) {
      btnValidarAction.classList.add("ready-to-validate");
    }
  }

  // Clicar em "Escolher Arquivo" abre a seleção do Windows
  if (btnValidarChoose && validarFileInput) {
    btnValidarChoose.addEventListener("click", function () {
      validarFileInput.click();
    });

    validarFileInput.addEventListener("change", function () {
      if (validarFileInput.files && validarFileInput.files.length > 0) {
        const nomeReal = validarFileInput.files[0].name;
        aplicarArquivo(nomeReal);
      }
    });
  }

  // Clicar em "Validar" (Passo 3)
  if (btnValidarAction && validarFileInput) {
    btnValidarAction.addEventListener("click", function (e) {
      e.preventDefault();

      const arquivoSelecionado = sessionStorage.getItem("atestado_filename");

      if (!arquivoSelecionado && (!validarFileInput.files || validarFileInput.files.length === 0)) {
        // Abre o seletor nativo do Windows para o usuário escolher
        validarFileInput.click();
      } else {
        irParaToken();
      }
    });
  }

  function irParaToken() {
    if (btnValidarAction) {
      btnValidarAction.disabled = true;
      btnValidarAction.innerHTML = '<span class="spinner"></span> Validando documento...';
    }
    setTimeout(function () {
      window.location.href = "token.html";
    }, 500);
  }

  // =======================================================
  // 3. TELA DE TOKEN (token.html)
  // =======================================================
  const tokenForm = document.getElementById("token-form");
  const tokenInput = document.getElementById("token-input");
  const btnValidateToken = document.getElementById("btn-validate-token");
  const alertError = document.getElementById("alert-error");
  const alertSuccess = document.getElementById("alert-success");
  const tokenPageFilename = document.getElementById("token-page-filename");

  const nomeSalvo = sessionStorage.getItem("atestado_filename") || FALLBACK_FILENAME;
  if (tokenPageFilename) {
    tokenPageFilename.textContent = nomeSalvo;
  }

  if (tokenForm && tokenInput) {
    tokenInput.focus();

    tokenInput.addEventListener("input", function () {
      if (alertError) alertError.classList.remove("show");
    });

    tokenForm.addEventListener("submit", function (e) {
      e.preventDefault();
      verificarToken();
    });

    if (btnValidateToken) {
      btnValidateToken.addEventListener("click", function (e) {
        e.preventDefault();
        verificarToken();
      });
    }
  }

  function verificarToken() {
    const digitado = tokenInput.value.trim();

    if (!digitado) {
      exibirAlerta(alertError, "Por favor, digite o token de validação.");
      tokenInput.focus();
      return;
    }

    const htmlOriginal = btnValidateToken.innerHTML;
    btnValidateToken.disabled = true;
    btnValidateToken.innerHTML = '<span class="spinner"></span> Validando token...';

    setTimeout(function () {
      if (digitado.toLowerCase() === VALID_TOKEN.toLowerCase()) {
        if (alertError) alertError.classList.remove("show");
        if (alertSuccess) {
          alertSuccess.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Token autenticado com sucesso! Redirecionando...</span>
          `;
          alertSuccess.classList.add("show");
        }

        setTimeout(function () {
          window.location.href = "paciente.html";
        }, 550);
      } else {
        btnValidateToken.disabled = false;
        btnValidateToken.innerHTML = htmlOriginal;
        exibirAlerta(alertError, "Token inválido. Verifique o código e tente novamente.");
        tokenInput.select();
      }
    }, 450);
  }

  function exibirAlerta(elem, msg) {
    if (elem) {
      elem.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${msg}</span>
      `;
      elem.classList.add("show");
    }
  }

  // =======================================================
  // 4. TELA DO PACIENTE (paciente.html)
  // =======================================================
  const patientDocFilename = document.getElementById("patient-doc-filename");
  if (patientDocFilename) {
    patientDocFilename.textContent = nomeSalvo;
  }

  const valTimestamp = document.getElementById("val-timestamp");
  if (valTimestamp) {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, "0");
    const min = String(agora.getMinutes()).padStart(2, "0");
    const seg = String(agora.getSeconds()).padStart(2, "0");
    valTimestamp.textContent = `${dia}/${mes}/${ano} às ${hora}:${min}:${seg} (GMT-3)`;
  }
});
