// Função para extrair as informações do texto da compra e calcular a data de vencimento
function parsePurchaseInfo(purchaseText) {
    // Expressões regulares ajustadas para lidar com diferentes modelos
    const screenNameRegex = /🛍 (.*?) 🛍/;  // Captura o nome da tela entre os símbolos "🛍"
    const emailRegex = /📧 EMAIL: (.*?)\s/; // Captura o e-mail da compra
    const passwordRegex = /🔑 SENHA: (.*?)\s/; // Captura a senha
    const additionalInfoRegex = /ℹ️ Informações Adicional:(.*)/; // Captura as informações adicionais, se existirem

    const screenNameMatch = purchaseText.match(screenNameRegex);
    const emailMatch = purchaseText.match(emailRegex);
    const passwordMatch = purchaseText.match(passwordRegex);
    const additionalInfoMatch = purchaseText.match(additionalInfoRegex);

    if (screenNameMatch && emailMatch && passwordMatch) {
        // Calcular a data de vencimento (1 mês após a data atual)
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 1);  // Adiciona 1 mês à data atual
        const formattedExpirationDate = expirationDate.toLocaleDateString(); // Formato: dd/mm/aaaa

        return {
            screenName: screenNameMatch[1],   // Nome da tela, ex: "GLOBO SEM CANAIS +TELECINE"
            email: emailMatch[1],             // E-mail da compra
            password: passwordMatch[1],       // Senha
            expiration: formattedExpirationDate, // Data de vencimento (1 mês após a data de adição)
            additionalInfo: additionalInfoMatch ? additionalInfoMatch[1].trim() : "" // Informações adicionais, se existirem
        };
    } else {
        return null;  // Caso não encontre os dados no formato esperado
    }
}

// Função para salvar a compra no LocalStorage
function savePurchaseInfo() {
    const purchaseText = document.getElementById('purchaseText').value;
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;

    if (purchaseText && customerName && customerPhone) {
        const purchaseInfo = parsePurchaseInfo(purchaseText);
        purchaseInfo.customerName = customerName;
        purchaseInfo.customerPhone = customerPhone;

        if (purchaseInfo) {
            const storedPurchases = JSON.parse(localStorage.getItem('purchases')) || [];
            storedPurchases.push(purchaseInfo);
            localStorage.setItem('purchases', JSON.stringify(storedPurchases));

            updatePurchaseTable();
            updateAccountCount();

            document.getElementById('purchaseText').value = '';
            document.getElementById('customerName').value = '';
            document.getElementById('customerPhone').value = '';
        } else {
            alert('Não foi possível extrair as informações da compra.');
        }
    } else {
        alert('Por favor, preencha todos os campos.');
    }
}

// Função para atualizar a tabela de compras
function updatePurchaseTable() {
    const storedPurchases = JSON.parse(localStorage.getItem('purchases')) || [];
    const tableBody = document.getElementById('infoTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Limpa a tabela antes de atualizá-la

    if (storedPurchases.length === 0) {
        const noDataRow = tableBody.insertRow();
        const noDataCell = noDataRow.insertCell(0);
        noDataCell.colSpan = 7; // Ocupa todas as colunas
        noDataCell.textContent = 'Nenhuma compra registrada.';
    }

    storedPurchases.forEach((purchaseInfo, index) => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = purchaseInfo.customerName;
        row.insertCell(1).textContent = purchaseInfo.customerPhone;
        row.insertCell(2).textContent = purchaseInfo.email;
        row.insertCell(3).textContent = purchaseInfo.password;
        row.insertCell(4).textContent = purchaseInfo.screenName;
        row.insertCell(5).textContent = purchaseInfo.expiration;

        const actionCell = row.insertCell(6);
        const actionButtons = document.createElement('div');
        actionButtons.classList.add('action-buttons');

        // Botão de Remover
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remover';
        deleteButton.onclick = function () {
            removePurchase(index);
        };

        // Botão de Copiar Login
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copiar Login';
        copyButton.onclick = function () {
            copyMessage(purchaseInfo);
        };

        // Botão de Alterar Data de Expiração
        const editDateButton = document.createElement('button');
        editDateButton.textContent = 'Alterar Data de Expiração';
        editDateButton.onclick = function () {
            changeExpirationDate(index);
        };

        actionButtons.appendChild(deleteButton);
        actionButtons.appendChild(copyButton);
        actionButtons.appendChild(editDateButton);
        actionCell.appendChild(actionButtons);
    });
}

// Função para atualizar a contagem de contas vendidas
function updateAccountCount() {
    const storedPurchases = JSON.parse(localStorage.getItem('purchases')) || [];
    document.getElementById('accountCount').textContent = storedPurchases.length;
}

// Função para remover uma compra
function removePurchase(index) {
    const storedPurchases = JSON.parse(localStorage.getItem('purchases')) || [];
    storedPurchases.splice(index, 1); // Remove a compra no índice especificado
    localStorage.setItem('purchases', JSON.stringify(storedPurchases)); // Atualiza o LocalStorage
    updatePurchaseTable(); // Atualiza a tabela
    updateAccountCount(); // Atualiza a contagem de contas
}

// Função para copiar a informação de login
function copyMessage(purchaseInfo) {
    const message = `Olá ${purchaseInfo.customerName},\n\nSua compra foi realizada com sucesso\n\nEmail: ${purchaseInfo.email}\nSenha: ${purchaseInfo.password}\n\nTela de acesso único, não use em dois aparelhos, sujeito a perder o acesso.\n\nData de expiração: ${purchaseInfo.expiration}\n\nAgradecemos a preferência.`;
    navigator.clipboard.writeText(message).then(() => {
        alert('Informações de login copiadas!');
    });
}

// Função para alterar a data de expiração
function changeExpirationDate(index) {
    const newExpiration = prompt("Digite a nova data de expiração (formato: dd/mm/aaaa):");
    if (newExpiration) {
        const storedPurchases = JSON.parse(localStorage.getItem('purchases')) || [];
        storedPurchases[index].expiration = newExpiration;
        localStorage.setItem('purchases', JSON.stringify(storedPurchases));
        updatePurchaseTable();
    } else {
        alert('Data inválida!');
    }
}

window.onload = function () {
    updatePurchaseTable();
    updateAccountCount();
};
