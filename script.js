
// Variáveis para os gráficos
let buildingChart = null;
let statusChart = null;
let modelChart = null;

// Função para formatar data e hora
function formatDateTime(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Função para atualizar data e hora
function updateDateTime() {
    const now = new Date();
    const dateTimeElement = document.getElementById('current-datetime');
    
    if (dateTimeElement) {
        dateTimeElement.textContent = formatDateTime(now);
    }
}

// Função para renderizar cards de impressoras novas
function renderNewPrintersCards(filter = {}) {
    const container = document.getElementById('new-printers-cards');
    if (!container) return;
    
    container.innerHTML = '';
    
    const filteredPrinters = database.newPrinters.filter(printer => {
        return (!filter.serial || printer.serial.toLowerCase().includes(filter.serial.toLowerCase())) &&
               (!filter.model || printer.model.toLowerCase().includes(filter.model.toLowerCase())) &&
               (!filter.bloco || printer.bloco === filter.bloco) &&
               (!filter.department || printer.department.toLowerCase().includes(filter.department.toLowerCase())) &&
               (!filter.status || (filter.status === 'Online' && printer.online) || (filter.status === 'Offline' && !printer.online));
    });
    
    if (filteredPrinters.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhuma impressora encontrada</p>';
        return;
    }
    
    filteredPrinters.forEach(printer => {
        const card = document.createElement('div');
        card.className = 'printer-card';
        card.innerHTML = `
            <div class="printer-card-header">
                <div class="printer-card-title">${printer.model}</div>
                <div class="printer-card-status ${printer.online ? '' : 'printer-card-offline'}">
                    ${printer.online ? 'Online' : 'Offline'}
                </div>
            </div>
            <div class="printer-card-body">
                <div class="printer-card-row">
                    <div class="printer-card-label">Nº Série:</div>
                    <div class="printer-card-value">${printer.serial}</div>
                </div>
                <div class="printer-card-row">
                    <div class="printer-card-label">Bloco:</div>
                    <div class="printer-card-value">${printer.bloco}</div>
                </div>
                <div class="printer-card-row">
                    <div class="printer-card-label">Sala:</div>
                    <div class="printer-card-value">${printer.sala}</div>
                </div>
                <div class="printer-card-row">
                    <div class="printer-card-label">Departamento:</div>
                    <div class="printer-card-value">${printer.department}</div>
                </div>
                <div class="printer-card-row">
                    <div class="printer-card-label">IP:</div>
                    <div class="printer-card-value">${printer.ip}</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Função para renderizar a tabela de substituições
function renderReplacementsTable() {
    const tbody = document.querySelector('#replacements-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    database.replacements.forEach(replacement => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${replacement.date}</td>
            <td>${replacement.oldSerial}</td>
            <td>${replacement.newSerial}</td>
            <td>${replacement.newModel}</td>
            <td>${replacement.newBloco}</td>
            <td>${replacement.status === 'completed' ? 'Concluída' : 'Pendente'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Função para atualizar os gráficos
function updateCharts() {
    console.log("Atualizando gráficos...");
    
    try {
        // Obter elementos canvas
        const buildingCanvas = document.getElementById('building-chart');
        const statusCanvas = document.getElementById('status-chart');
        const modelCanvas = document.getElementById('model-chart');
        
        // Verificar se os elementos existem
        if (!buildingCanvas || !statusCanvas || !modelCanvas) {
            console.error("Elementos canvas não encontrados");
            return;
        }
        
        // Destruir gráficos existentes se houver
        if (buildingChart) buildingChart.destroy();
        if (statusChart) statusChart.destroy();
        if (modelChart) modelChart.destroy();
        
        // Criar novos gráficos
        buildingChart = new Chart(buildingCanvas, {
            type: 'bar',
            data: {
                labels: database.buildings,
                datasets: [
                    {
                        label: 'Impressoras Antigas',
                        data: database.buildings.map(b => 
                            database.oldPrinters.filter(p => p.bloco === b).length),
                        backgroundColor: 'rgba(239, 68, 68, 0.7)'
                    },
                    {
                        label: 'Impressoras Novas',
                        data: database.buildings.map(b => 
                            database.newPrinters.filter(p => p.bloco === b).length),
                        backgroundColor: 'rgba(16, 185, 129, 0.7)'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Impressoras por Bloco'
                    }
                }
            }
        });
        
        statusChart = new Chart(statusCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Online', 'Offline'],
                datasets: [{
                    data: [
                        database.newPrinters.filter(p => p.online).length,
                        database.newPrinters.filter(p => !p.online).length
                    ],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(239, 68, 68, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Status das Impressoras Novas'
                    }
                }
            }
        });
        
        modelChart = new Chart(modelCanvas, {
            type: 'bar',
            data: {
                labels: [...new Set([...database.oldPrinters, ...database.newPrinters].map(p => p.model))],
                datasets: [{
                    label: 'Total por Modelo',
                    data: [...new Set([...database.oldPrinters, ...database.newPrinters].map(p => p.model))].map(model => 
                        [...database.oldPrinters, ...database.newPrinters].filter(p => p.model === model).length),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: 'Distribuição por Modelo'
                    }
                }
            }
        });
        
        console.log("Gráficos atualizados com sucesso!");
    } catch (error) {
        console.error("Erro ao atualizar gráficos:", error);
    }
}

// Função para atualizar o dashboard
function updateDashboard() {
    try {
        // Atualizar contadores
        document.getElementById('old-printers-count').textContent = database.oldPrinters.length;
        document.getElementById('new-printers-count').textContent = database.newPrinters.length;
        
        const onlineCount = database.newPrinters.filter(p => p.online).length;
        const offlineCount = database.newPrinters.filter(p => !p.online).length;
        
        document.getElementById('online-printers-count').textContent = onlineCount;
        document.getElementById('offline-printers-count').textContent = offlineCount;
        
        // Atualizar gráficos
        updateCharts();
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
    }
}

// Função para configurar a navegação
function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove a classe active de todos os itens
            menuItems.forEach(menuItem => {
                menuItem.classList.remove('active');
            });
            
            // Adiciona ao item clicado
            this.classList.add('active');
            
            // Obtém qual página mostrar
            const pageId = this.getAttribute('data-page');
            
            // Esconde todas as páginas
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active-page');
            });
            
            // Mostra a página selecionada
            const pageToShow = document.getElementById(`${pageId}-page`);
            if (pageToShow) {
                pageToShow.classList.add('active-page');
                updatePageContent(pageId);
            }
        });
    });
}

// Função para atualizar conteúdo da página
function updatePageContent(pageId) {
    switch(pageId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'old-inventory':
            renderOldPrintersCards();
            break;
        case 'new-inventory':
            renderNewPrintersCards();
            break;
        case 'replacements':
            renderReplacementsTable();
            break;
    }
}

// Função para renderizar cards de impressoras antigas
function renderOldPrintersCards(filter = {}) {
    const container = document.getElementById('old-printers-cards');
    if (!container) return;
    
    container.innerHTML = '';
    
    const filteredPrinters = database.oldPrinters.filter(printer => {
        return (!filter.serial || printer.serial.toLowerCase().includes(filter.serial.toLowerCase())) &&
               (!filter.model || printer.model.toLowerCase().includes(filter.model.toLowerCase())) &&
               (!filter.bloco || printer.bloco === filter.bloco) &&
               (!filter.department || printer.department.toLowerCase().includes(filter.department.toLowerCase())) &&
               (!filter.status || printer.status.toLowerCase().includes(filter.status.toLowerCase()));
    });
    
    if (filteredPrinters.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhuma impressora encontrada</p>';
        return;
    }
    
    filteredPrinters.forEach(printer => {
        const card = document.createElement('div');
        card.className = 'printer-card';
        card.innerHTML = `
            <div class="printer-card-header">
                <div class="printer-card-title">${printer.model}</div>
                <div class="printer-card-status">${printer.status}</div>
            </div>
            <div class="printer-card-body">
                <div class="printer-card-row">
                    <div class="printer-card-label">Nº Série:</div>
                    <div class="printer-card-value">${printer.serial}</div>
                </div>
                <div class="printer-card-row">
                    <div class="printer-card-label">Bloco:</div>
                    <div class="printer-card-value">${printer.bloco}</div>
                </div>
                <div class="printer-card-row">
                    <div class="printer-card-label">Sala:</div>
                    <div class="printer-card-value">${printer.sala}</div>
                </div>
                <div class="printer-card-row">
                    <div class="printer-card-label">Departamento:</div>
                    <div class="printer-card-value">${printer.department}</div>
                </div>
                <div class="printer-card-row">
                    <div class="printer-card-label">IP:</div>
                    <div class="printer-card-value">${printer.ip}</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Funções para o sistema de sugestões
function updatePrinterSuggestions() {
    const datalist = document.getElementById('old-printers-list');
    if (!datalist) return;
    
    datalist.innerHTML = '';
    
    database.oldPrinters.forEach(printer => {
        const option = document.createElement('option');
        option.value = printer.serial;
        option.textContent = `${printer.serial} - ${printer.model}`;
        datalist.appendChild(option);
    });
}

function showPrinterDetails(serial) {
    const printer = database.oldPrinters.find(p => p.serial === serial);
    const detailsDiv = document.getElementById('old-printer-details');
    
    if (printer && detailsDiv) {
        detailsDiv.innerHTML = `
            <h4>Detalhes da Impressora</h4>
            <p><strong>Modelo:</strong> ${printer.model}</p>
            <p><strong>Número de Série:</strong> ${printer.serial}</p>
            <p><strong>Local:</strong> ${printer.bloco}, ${printer.andar}º andar, Sala ${printer.sala}</p>
            <p><strong>Departamento:</strong> ${printer.department}</p>
            <p><strong>Status:</strong> ${printer.status}</p>
            <p><strong>Endereço IP:</strong> ${printer.ip}</p>
        `;
        detailsDiv.style.display = 'block';
    } else if (detailsDiv) {
        detailsDiv.style.display = 'none';
    }
}

// Função para configurar o formulário de substituições
function setupReplacementForm() {
    const form = document.getElementById('replacement-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const oldSerial = document.getElementById('old-printer-serial').value;
        const newSerial = document.getElementById('new-printer-serial').value;
        const newModel = document.getElementById('new-printer-model').value;
        const newBloco = document.getElementById('new-printer-bloco').value;
        
        if (!oldSerial || !newSerial || !newModel || !newBloco) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Adiciona a substituição ao banco de dados
        const newReplacement = {
            id: database.replacements.length + 1,
            date: formatDateTime(new Date()).split(' ')[0], // Pega apenas a data
            oldSerial: oldSerial,
            newSerial: newSerial,
            newModel: newModel,
            newBloco: newBloco,
            status: 'completed'
        };
        
        database.replacements.push(newReplacement);
        
        // Atualiza a interface
        renderReplacementsTable();
        updateDashboard();
        
        // Limpa o formulário
        form.reset();
        document.getElementById('old-printer-details').style.display = 'none';
        
        alert('Substituição registrada com sucesso!');
    });
}

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa arrays se necessário
    if (!database.oldPrinters) database.oldPrinters = [];
    if (!database.newPrinters) database.newPrinters = [];
    if (!database.replacements) database.replacements = [];

     // Inicializar datepickers
     flatpickr(".datepicker", {
        dateFormat: "d/m/Y",
        locale: "pt"
    });

    // Garantir que a data/hora seja atualizada imediatamente
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Corrigir o seletor do elemento de data/hora
    const dateTimeElement = document.getElementById('currentDateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = formatDateTime(new Date());
    }

// Atualize a função updateDateTime para usar o ID correto
function updateDateTime() {
    const now = new Date();
    const dateTimeElement = document.getElementById('currentDateTime');
    
    if (dateTimeElement) {
        dateTimeElement.textContent = formatDateTime(now);
    }
}

    // Carrega dados e configura a aplicação
    loadSampleData();
    setupNavigation();
    updateDashboard();
    setupReplacementForm();

    // Configura o formulário de substituições
    const serialInput = document.getElementById('old-printer-serial');
    if (serialInput) {
        serialInput.addEventListener('input', function() {
            if (this.value.length > 1) {
                showPrinterDetails(this.value);
            } else {
                const detailsDiv = document.getElementById('old-printer-details');
                if (detailsDiv) detailsDiv.style.display = 'none';
            }
        });
        updatePrinterSuggestions();
    }
    
    // Atualiza sugestões quando o inventário muda
    document.getElementById('printer-form')?.addEventListener('submit', updatePrinterSuggestions);
    
    // Configura e inicia a atualização de data/hora
    updateDateTime(); // Chama imediatamente para exibir a hora
    setInterval(updateDateTime, 1000); // Atualiza a cada segundo (1000ms)
});
// Função para gerar PDF
function generatePDF() {
    try {
        const reportType = document.getElementById('report-type').value;
        const startDate = document.getElementById('report-start-date').value;
        const endDate = document.getElementById('report-end-date').value;
        
        // Filtrar dados conforme seleção
        let data = [];
        let title = "Relatório de Impressoras";
        
        switch(reportType) {
            case 'replacements':
                data = database.replacements;
                title = "Relatório de Substituições";
                break;
            case 'inventory':
                data = [...database.oldPrinters, ...database.newPrinters];
                title = "Relatório de Inventário";
                break;
            case 'status':
                data = database.newPrinters;
                title = "Relatório de Status";
                break;
            case 'location':
                data = database.newPrinters;
                title = "Relatório por Localização";
                break;
        }

        // Filtrar por período se datas estiverem preenchidas
        if (startDate && endDate) {
            data = data.filter(item => {
                const itemDate = item.date ? new Date(item.date.split('/').reverse().join('-')) : new Date();
                const start = new Date(startDate.split('/').reverse().join('-'));
                const end = new Date(endDate.split('/').reverse().join('-'));
                return itemDate >= start && itemDate <= end;
            });
        }

        // Criar conteúdo do PDF
        const docDefinition = {
            content: [
                { text: title, style: 'header' },
                { text: `Período: ${startDate || 'Início'} à ${endDate || 'Fim'}`, style: 'subheader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*', '*'],
                        body: buildReportBody(data, reportType)
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 12,
                    margin: [0, 0, 0, 10]
                }
            }
        };

        pdfMake.createPdf(docDefinition).download(`${title}_${new Date().toISOString().slice(0,10)}.pdf`);
        
        showResult('Relatório PDF gerado com sucesso!', 'success');
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        showResult('Erro ao gerar PDF', 'error');
    }
}

// Função para gerar Excel
function generateExcel() {
    try {
        const reportType = document.getElementById('report-type').value;
        const startDate = document.getElementById('report-start-date').value;
        const endDate = document.getElementById('report-end-date').value;
        
        let data = [];
        let title = "Relatório de Impressoras";
        
        switch(reportType) {
            case 'replacements':
                data = database.replacements;
                title = "Substituições";
                break;
            case 'inventory':
                data = [...database.oldPrinters, ...database.newPrinters];
                title = "Inventário";
                break;
            case 'status':
                data = database.newPrinters;
                title = "Status";
                break;
            case 'location':
                data = database.newPrinters;
                title = "Localização";
                break;
        }

        if (startDate && endDate) {
            data = data.filter(item => {
                const itemDate = item.date ? new Date(item.date.split('/').reverse().join('-')) : new Date();
                const start = new Date(startDate.split('/').reverse().join('-'));
                const end = new Date(endDate.split('/').reverse().join('-'));
                return itemDate >= start && itemDate <= end;
            });
        }

        // Criar planilha Excel
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, title);
        XLSX.writeFile(wb, `${title}_${new Date().toISOString().slice(0,10)}.xlsx`);
        
        showResult('Relatório Excel gerado com sucesso!', 'success');
    } catch (error) {
        console.error("Erro ao gerar Excel:", error);
        showResult('Erro ao gerar Excel', 'error');
    }
}

// Função auxiliar para construir corpo do relatório
function buildReportBody(data, reportType) {
    let body = [];
    
    // Cabeçalhos
    switch(reportType) {
        case 'replacements':
            body.push(['Data', 'Série Antiga', 'Série Nova', 'Modelo', 'Bloco']);
            data.forEach(item => {
                body.push([item.date, item.oldSerial, item.newSerial, item.newModel, item.newBloco]);
            });
            break;
        case 'inventory':
            body.push(['Modelo', 'Número Série', 'Bloco', 'Departamento', 'Status']);
            data.forEach(item => {
                body.push([item.model, item.serial, item.bloco, item.department, item.status || (item.online ? 'Online' : 'Offline')]);
            });
            break;
        case 'status':
            body.push(['Modelo', 'Série', 'Status', 'IP', 'Hostname']);
            data.forEach(item => {
                body.push([item.model, item.serial, item.online ? 'Online' : 'Offline', item.ip, item.hostname]);
            });
            break;
        case 'location':
            body.push(['Modelo', 'Série', 'Bloco', 'Andar', 'Sala']);
            data.forEach(item => {
                body.push([item.model, item.serial, item.bloco, item.andar, item.sala]);
            });
            break;
    }
    
    return body;
}

// Função para mostrar resultado
function showResult(message, type) {
    const resultElement = document.getElementById('replacement-result');
    resultElement.textContent = message;
    resultElement.className = 'result-message ' + type;
    setTimeout(() => {
        resultElement.className = 'result-message';
    }, 5000);
}

// Adicione no final do DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // ... código existente ...

    // Adicionar event listeners para os botões de relatório
    document.getElementById('generate-report-btn')?.addEventListener('click', generatePDF);
    document.getElementById('generate-excel-btn')?.addEventListener('click', generateExcel);
});
