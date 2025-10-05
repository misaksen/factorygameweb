// User Interface Management
class UI {
    constructor(game) {
        this.game = game;
        this.currentView = 'warehouse';
        this.messageQueue = [];
    }
    
    init() {
        console.log('UI.init() called');
        this.setupNavigation();
        this.updateDisplay();
        
        // Show initial view
        this.showView('warehouse');
        
        // Override global switchView function with our method
        window.switchView = (viewName) => {
            this.showView(viewName);
        };
    }
    
    setupNavigation() {
        console.log('Setting up navigation...');
        const navButtons = document.querySelectorAll('.nav-btn');
        console.log('Found nav buttons:', navButtons.length);
        
        navButtons.forEach(button => {
            console.log('Adding click listener to:', button.id);
            button.addEventListener('click', (e) => {
                const viewName = e.target.id.replace('nav-', '');
                console.log('Switching to view:', viewName);
                this.showView(viewName);
            });
        });
        
        // Also set up global navigation function as backup
        window.switchView = (viewName) => {
            console.log('Global switchView called:', viewName);
            this.showView(viewName);
        };
    }
    
    showView(viewName) {
        console.log('UI.showView called with:', viewName);
        
        // Hide all views
        document.querySelectorAll('.game-view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected view
        const targetView = document.getElementById(`${viewName}-view`);
        const targetNavBtn = document.getElementById(`nav-${viewName}`);
        
        console.log('Target view:', targetView);
        console.log('Target nav button:', targetNavBtn);
        
        if (targetView && targetNavBtn) {
            targetView.classList.add('active');
            targetNavBtn.classList.add('active');
            this.currentView = viewName;
            
            // Update content for the selected view
            this.updateViewContent(viewName);
        }
    }
    
    updateDisplay() {
        this.updateGameStats();
        this.updateViewContent(this.currentView);
    }
    
    updateGameStats() {
        document.getElementById('money').textContent = `$${this.game.getMoney()}`;
        document.getElementById('game-time').textContent = `Day ${this.game.getCurrentDay()}`;
        
        // Update pause button state
        if (window.updatePauseButton) {
            window.updatePauseButton(!this.game.isRunning);
        }
    }
    
    updateViewContent(viewName) {
        switch (viewName) {
            case 'warehouse':
                this.updateWarehouseView();
                break;
            case 'marketplace':
                this.updateMarketplaceView();
                break;
            case 'machines':
                this.updateMachinesView();
                break;
            case 'production':
                this.updateProductionView();
                break;
            case 'expansion':
                this.updateExpansionView();
                break;
        }
    }
    
    updateWarehouseView() {
        const content = document.getElementById('warehouse-content');
        const status = this.game.warehouse.getStatusReport();
        
        const html = `
            <div class="grid grid-2">
                <div class="card">
                    <h3>Input Materials Warehouse</h3>
                    <div class="progress-bar">
                        <div class="progress-fill ${this.getCapacityClass(status.input.percentage)}" 
                             style="width: ${status.input.percentage}%"></div>
                    </div>
                    <p>Capacity: ${status.input.used}/${status.input.capacity} (${status.input.percentage.toFixed(1)}%)</p>
                    
                    <table class="data-table compact-table">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.from(status.input.items.entries())
                                .filter(([name, qty]) => qty > 0)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([name, qty]) => `
                                    <tr>
                                        <td>${name}</td>
                                        <td style="color: #3498db;">${qty}</td>
                                    </tr>
                                `).join('')}
                        </tbody>
                    </table>
                    ${Array.from(status.input.items.entries()).filter(([name, qty]) => qty > 0).length === 0 
                        ? '<p class="message-warning">No materials in storage</p>' : ''}
                </div>
                
                <div class="card">
                    <h3>Output Products Warehouse</h3>
                    <div class="progress-bar">
                        <div class="progress-fill ${this.getCapacityClass(status.output.percentage)}" 
                             style="width: ${status.output.percentage}%"></div>
                    </div>
                    <p>Capacity: ${status.output.used}/${status.output.capacity} (${status.output.percentage.toFixed(1)}%)</p>
                    
                    <table class="data-table compact-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Transfer</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.from(status.output.items.entries())
                                .filter(([name, qty]) => qty > 0)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([name, qty]) => `
                                    <tr>
                                        <td>${name}</td>
                                        <td style="color: #3498db;">${qty}</td>
                                        <td>
                                            <button class="btn btn-primary btn-sm" 
                                                    onclick="window.factoryGame.ui.transferProductToInput('${name}', 1)"
                                                    ${status.input.available === 0 ? 'disabled' : ''}
                                                    title="Transfer 1 to input warehouse">
                                                1
                                            </button>
                                            <button class="btn btn-primary btn-sm" 
                                                    onclick="window.factoryGame.ui.transferAllProductToInput('${name}')"
                                                    ${status.input.available === 0 ? 'disabled' : ''}
                                                    title="Transfer all to input warehouse">
                                                All
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                        </tbody>
                    </table>
                    ${Array.from(status.output.items.entries()).filter(([name, qty]) => qty > 0).length === 0 
                        ? '<p class="message-warning">No products in storage</p>' : ''}
                    
                    ${status.input.available > 0 && Array.from(status.output.items.entries()).filter(([name, qty]) => qty > 0).length > 0 ? 
                        '<p><small><strong>Tip:</strong> Transfer products to input warehouse to use them in advanced recipes!</small></p>' : ''}
                    ${status.input.available === 0 && Array.from(status.output.items.entries()).filter(([name, qty]) => qty > 0).length > 0 ? 
                        '<p class="message-warning"><small>Input warehouse is full - expand it to transfer products!</small></p>' : ''}
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    }
    
    updateMarketplaceView() {
        const content = document.getElementById('marketplace-content');
        const materialPrices = this.game.marketplace.getAllMaterialPrices();
        const productPrices = this.game.marketplace.getAllProductPrices();
        const warehouseStatus = this.game.warehouse.getStatusReport();
        
        // Debug: Log product prices to console
        console.log('Product prices in marketplace:', Array.from(productPrices.entries()));
        
        const html = `
            <div class="card" style="margin-bottom: 1rem;">
                <h3>Warehouse Status</h3>
                <div class="grid grid-2" style="gap: 1rem;">
                    <div>
                        <h5 style="margin: 0 0 0.5rem 0; color: #495057;">📦 Input Materials</h5>
                        <div class="progress-bar">
                            <div class="progress-fill ${this.getCapacityClass(warehouseStatus.input.percentage)}" 
                                 style="width: ${warehouseStatus.input.percentage}%"></div>
                        </div>
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem;">
                            ${warehouseStatus.input.used}/${warehouseStatus.input.capacity} 
                            (${warehouseStatus.input.percentage.toFixed(1)}%)
                        </p>
                    </div>
                    <div>
                        <h5 style="margin: 0 0 0.5rem 0; color: #495057;">📋 Output Products</h5>
                        <div class="progress-bar">
                            <div class="progress-fill ${this.getCapacityClass(warehouseStatus.output.percentage)}" 
                                 style="width: ${warehouseStatus.output.percentage}%"></div>
                        </div>
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem;">
                            ${warehouseStatus.output.used}/${warehouseStatus.output.capacity} 
                            (${warehouseStatus.output.percentage.toFixed(1)}%)
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-2">
                <div class="card">
                    <h3>Buy Materials</h3>
                    <table class="data-table compact-table">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>$</th>
                                <th>Stock</th>
                                <th>Buy</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.from(materialPrices.entries())
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([name, price]) => {
                                const inStock = this.game.warehouse.getInputMaterial(name);
                                return `
                                    <tr>
                                        <td>${name}</td>
                                        <td style="color: #e74c3c;">$${price}</td>
                                        <td style="color: #3498db;">${inStock}</td>
                                        <td>
                                            <button class="btn btn-primary btn-sm" onclick="window.factoryGame.ui.buyMaterial('${name}', 1)">
                                                1
                                            </button>
                                            <button class="btn btn-primary btn-sm" onclick="window.factoryGame.ui.buyMaterial('${name}', 10)">
                                                10
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="card">
                    <h3>Sell Products</h3>
                    <table class="data-table compact-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>$</th>
                                <th>Qty</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.from(productPrices.entries())
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([name, price]) => {
                                const available = this.game.warehouse.getOutputProduct(name);
                                return `
                                    <tr>
                                        <td style="font-size: 0.9rem;">${name}</td>
                                        <td style="font-weight: bold; color: #28a745;">$${price}</td>
                                        <td style="text-align: center; ${available === 0 ? 'color: #dc3545;' : 'color: #28a745; font-weight: bold;'}">${available}</td>
                                        <td>
                                            <button class="btn btn-success btn-sm" 
                                                    onclick="window.factoryGame.ui.sellProduct('${name}', 1)"
                                                    ${available === 0 ? 'disabled' : ''}
                                                    style="font-size: 0.7rem; padding: 0.2rem 0.4rem; margin: 0.1rem;">
                                                1
                                            </button>
                                            <button class="btn btn-success btn-sm" 
                                                    onclick="window.factoryGame.ui.sellProduct('${name}', 10)"
                                                    ${available < 10 ? 'disabled' : ''}
                                                    style="font-size: 0.7rem; padding: 0.2rem 0.4rem; margin: 0.1rem;">
                                                10
                                            </button>
                                            <button class="btn btn-success btn-sm" 
                                                    onclick="window.factoryGame.ui.sellAllProducts('${name}')"
                                                    ${available === 0 ? 'disabled' : ''}
                                                    style="font-size: 0.7rem; padding: 0.2rem 0.4rem; margin: 0.1rem;">
                                                All
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    }
    
    updateProductionView() {
        const content = document.getElementById('production-content');
        const status = this.game.productionHall.getProductionStatus();
        const machineTypes = this.game.productionHall.getMachineTypes();
        
        const html = `
            <div class="card">
                <h3>Production Hall Status</h3>
                <p>Capacity: ${status.used}/${status.capacity} machines</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(status.used / status.capacity) * 100}%"></div>
                </div>
                
                <div style="margin: 1rem 0;">
                    <span class="message-success">Idle: ${status.machines.idle}</span> |
                    <span class="message-warning">Working: ${status.machines.working}</span>
                </div>
                
                <div style="margin: 1rem 0; padding: 0.75rem; background: ${status.machines.working > 0 ? '#fff3cd' : '#f8f9fa'}; border-radius: 4px; border-left: 4px solid ${status.machines.working > 0 ? '#ffc107' : '#dee2e6'}; min-height: ${50 + (status.capacity * 35)}px;">
                    <h5 style="margin: 0 0 0.5rem 0; color: ${status.machines.working > 0 ? '#856404' : '#6c757d'};">🏭 Active Production: (${status.machines.working}/${status.capacity} machines)</h5>
                    <div style="font-size: 0.9rem; max-height: ${Math.max(80, status.capacity * 35)}px; overflow-y: auto;">
                        ${status.machines.working > 0 ? 
                            this.game.productionHall.getMachines()
                                .filter(machine => machine.status === 'working')
                                .sort((a, b) => a.type.localeCompare(b.type) || a.id - b.id)
                                .map(machine => {
                                    const progress = Math.min(100, Math.round((machine.progress / machine.progressMax) * 100));
                                    return `
                                        <div style="margin: 0.25rem 0; display: flex; justify-content: space-between; align-items: center; min-height: 30px;">
                                            <span><strong>${machine.type} #${machine.id}</strong>: ${machine.currentRecipe?.name || 'Unknown'}</span>
                                            <span style="color: #495057; font-weight: bold;">${progress}%</span>
                                        </div>
                                    `;
                                }).join('') :
                            '<p style="color: #6c757d; font-style: italic; margin: 1rem 0;">No machines currently working</p>'
                        }
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3>Your Machines</h3>
                ${status.details.length === 0 ? 
                    '<p>No machines purchased yet. <a href="#" onclick="switchView(\'machines\')">Go to Machine Shop</a> to buy your first machine!</p>' : ''}
                
                <div class="grid grid-2">
                    ${this.game.productionHall.getMachines()
                        .sort((a, b) => a.type.localeCompare(b.type) || a.id - b.id)
                        .map(machine => `
                        <div class="card" key="${machine.id}">
                            <h4>${machine.type} #${machine.id}</h4>
                            <p>Status: <span class="message-${this.getStatusClass(machine.status)}">${machine.status.toUpperCase()}</span></p>
                            <p>Current Recipe: ${machine.currentRecipe?.name || 'None'}</p>
                            
                            <div class="progress-bar" style="margin: 1rem 0;">
                                <div class="progress-fill" style="width: ${machine.status === 'working' ? Math.min(100, (machine.progress / machine.progressMax) * 100) : 0}%"></div>
                            </div>
                            <p><strong>Progress: ${machine.status === 'working' ? Math.min(100, Math.round((machine.progress / machine.progressMax) * 100)) : 0}%</strong></p>
                            
                            <!-- Auto-Start Controls -->
                            <div style="margin: 1rem 0; padding: 0.75rem; background: #f8f9fa; border-radius: 4px; border-left: 4px solid ${machine.autoStart ? '#28a745' : '#6c757d'};">
                                <h5>Automation Settings</h5>
                                <div style="margin: 0.5rem 0;">
                                    <label style="display: flex; align-items: center; cursor: pointer;">
                                        <input type="checkbox" ${machine.autoStart ? 'checked' : ''} 
                                               onchange="window.factoryGame.ui.toggleAutoStart(${machine.id})"
                                               style="margin-right: 0.5rem;">
                                        <strong>Auto-Start Production</strong>
                                    </label>
                                </div>
                                
                                <div style="margin: 0.5rem 0;">
                                    <label>Default Recipe:</label>
                                    <div style="margin-top: 0.25rem;">
                                        ${this.game.productionHall.getRecipesForMachine(machine.type)
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map(recipe => `
                                            <button class="btn ${machine.defaultRecipe === recipe.name ? 'btn-success' : 'btn-primary'}" 
                                                    onclick="window.factoryGame.ui.setDefaultRecipe(${machine.id}, '${recipe.name}')"
                                                    style="margin: 0.25rem; font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                                ${recipe.name}
                                            </button>
                                        `).join('')}
                                        <button class="btn btn-warning" 
                                                onclick="window.factoryGame.ui.setDefaultRecipe(${machine.id}, '')"
                                                style="margin: 0.25rem; font-size: 0.8rem; padding: 0.4rem 0.8rem;"
                                                ${!machine.defaultRecipe ? 'disabled' : ''}>
                                            Clear Default
                                        </button>
                                    </div>
                                </div>
                                
                                <p style="font-size: 0.8rem; margin-top: 0.5rem; ${machine.autoStart && machine.defaultRecipe ? 'color: #28a745;' : machine.autoStart ? 'color: #ffc107;' : 'color: #6c757d;'}">
                                    ${machine.autoStart && machine.defaultRecipe ? 
                                        (() => {
                                            const recipe = this.game.productionHall.getRecipesForMachine(machine.type)
                                                .find(r => r.name === machine.defaultRecipe);
                                            if (recipe) {
                                                const materials = Array.from(recipe.inputs.entries())
                                                    .map(([material, quantity]) => `${quantity}x ${material}`)
                                                    .join(', ');
                                                return `✓ Will auto-start ${machine.defaultRecipe} when available: ${materials}`;
                                            } else {
                                                return `✓ Will auto-start ${machine.defaultRecipe} when materials are available`;
                                            }
                                        })() :
                                        machine.autoStart ? 
                                            `⚠ Auto-start enabled but no default recipe set` :
                                            `Auto-start disabled`
                                    }
                                </p>
                            </div>
                            
                            ${!machine.autoStart ? `
                            <div style="margin-top: 1rem;">
                                <h5>Manual Start:</h5>
                                <div style="${machine.status !== 'idle' ? 'opacity: 0.5; pointer-events: none;' : ''}">
                                    ${this.generateRecipeButtons(machine.id, machine.type, machine.status !== 'idle')}
                                </div>
                            </div>
                            ` : ''}
                                
                            <div style="margin-top: 1rem;">
                                <button class="btn btn-danger" onclick="window.factoryGame.ui.sellMachine(${machine.id})"
                                        ${machine.status === 'working' ? 'disabled title="Cannot sell machine while working"' : ''}>
                                    Sell Machine ($${Math.floor(this.game.productionHall.getMachineTypes().get(machine.type).cost * 0.7)})
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    }
    
    updateMachinesView() {
        const content = document.getElementById('machines-content');
        const status = this.game.productionHall.getProductionStatus();
        const machineTypes = this.game.productionHall.getMachineTypes();
        
        const html = `
            <div class="card">
                <h3>Machine Shop</h3>
                <p>Production Hall Capacity: ${status.used}/${status.capacity} machines</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(status.used / status.capacity) * 100}%"></div>
                </div>
                ${status.available === 0 ? '<p class="message-warning">Production hall at maximum capacity! Expand in the Expansion tab.</p>' : 
                  `<p class="message-success">Available slots: ${status.available}</p>`}
            </div>
            
            <div class="grid grid-2">
                ${Array.from(machineTypes.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([type, info]) => `
                    <div class="card">
                        <h3>${type}</h3>
                        <p><strong>Cost: $${info.cost}</strong></p>
                        <div style="margin: 1rem 0;">
                            <h4>Available Recipes:</h4>
                            ${info.recipes.sort((a, b) => a.name.localeCompare(b.name)).map(recipe => {
                                const inputs = Array.from(recipe.inputs.entries())
                                    .map(([material, quantity]) => `${quantity}x ${material}`)
                                    .join(', ');
                                
                                // Calculate profit for machine shop display
                                const materialCost = Array.from(recipe.inputs.entries())
                                    .reduce((total, [material, quantity]) => {
                                        const price = this.game.marketplace.getMaterialPrice(material);
                                        return total + (price * quantity);
                                    }, 0);
                                
                                const outputValue = this.game.marketplace.getProductPrice(recipe.output) * recipe.quantity;
                                const estimatedProfit = outputValue - materialCost;
                                const profitPerSecond = estimatedProfit / recipe.time;
                                
                                const profitColor = estimatedProfit > 0 ? '#28a745' : estimatedProfit < 0 ? '#dc3545' : '#6c757d';
                                const profitIcon = estimatedProfit > 0 ? '📈' : estimatedProfit < 0 ? '📉' : '➖';
                                
                                return `
                                    <div style="margin: 0.5rem 0; padding: 0.75rem; background: #f8f9fa; border-radius: 4px; border-left: 4px solid ${profitColor};">
                                        <strong>${recipe.name}</strong><br>
                                        <small><strong>Inputs:</strong> ${inputs} (Cost: $${materialCost})</small><br>
                                        <small><strong>Output:</strong> ${recipe.quantity}x ${recipe.output} (Value: $${outputValue})</small><br>
                                        <small><strong>Time:</strong> ${recipe.time}s</small><br>
                                        <div style="margin-top: 0.5rem; padding: 0.25rem; background: white; border-radius: 3px;">
                                            <small style="color: ${profitColor};"><strong>
                                                ${profitIcon} Profit: $${estimatedProfit} (${profitPerSecond >= 0 ? '+' : ''}$${profitPerSecond.toFixed(2)}/sec)
                                            </strong></small>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <button class="btn btn-primary" 
                                onclick="window.factoryGame.ui.buyMachine('${type}')"
                                ${status.available === 0 ? 'disabled' : ''}
                                style="width: 100%; margin-top: 1rem;">
                            ${status.available === 0 ? 'Production Hall Full' : `Buy ${type}`}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        content.innerHTML = html;
    }
    
    updateExpansionView() {
        const content = document.getElementById('expansion-content');
        const warehouseStatus = this.game.warehouse.getStatusReport();
        const productionStatus = this.game.productionHall.getProductionStatus();
        
        const html = `
            <div class="grid grid-2">
                <div class="card">
                    <h3>Warehouse Expansion</h3>
                    <div style="margin-bottom: 1rem;">
                        <h4>Input Materials Warehouse</h4>
                        <p>Current Capacity: ${warehouseStatus.input.capacity}</p>
                        <p>Expansion Cost: $50 per slot</p>
                        <button class="btn btn-warning" onclick="window.factoryGame.ui.expandWarehouse('input', 10)">
                            Expand by 10 slots ($500)
                        </button>
                        <button class="btn btn-warning" onclick="window.factoryGame.ui.expandWarehouse('input', 25)">
                            Expand by 25 slots ($1,250)
                        </button>
                    </div>
                    
                    <div>
                        <h4>Output Products Warehouse</h4>
                        <p>Current Capacity: ${warehouseStatus.output.capacity}</p>
                        <p>Expansion Cost: $75 per slot</p>
                        <button class="btn btn-warning" onclick="window.factoryGame.ui.expandWarehouse('output', 10)">
                            Expand by 10 slots ($750)
                        </button>
                        <button class="btn btn-warning" onclick="window.factoryGame.ui.expandWarehouse('output', 25)">
                            Expand by 25 slots ($1,875)
                        </button>
                    </div>
                </div>
                
                <div class="card">
                    <h3>Production Hall Expansion</h3>
                    <p>Current Capacity: ${productionStatus.capacity} machines</p>
                    <p>Expansion Cost: $500 per slot</p>
                    <button class="btn btn-warning" onclick="window.factoryGame.ui.expandProduction(1)">
                        Add 1 machine slot ($500)
                    </button>
                    <button class="btn btn-warning" onclick="window.factoryGame.ui.expandProduction(3)">
                        Add 3 machine slots ($1,500)
                    </button>
                    <button class="btn btn-warning" onclick="window.factoryGame.ui.expandProduction(5)">
                        Add 5 machine slots ($2,500)
                    </button>
                </div>
            </div>
            
            <div class="card">
                <h3>Game Controls</h3>
                <button class="btn btn-primary" onclick="window.factoryGame.ui.saveGame()">
                    Save Game
                </button>
                <button class="btn btn-danger" onclick="window.factoryGame.ui.resetGame()">
                    Reset Game
                </button>
            </div>
        `;
        
        content.innerHTML = html;
    }
    
    // Helper methods for UI generation
    getCapacityClass(percentage) {
        if (percentage >= 90) return 'danger';
        if (percentage >= 70) return 'warning';
        return '';
    }
    
    getStatusClass(status) {
        switch (status) {
            case 'idle': return 'success';
            case 'working': return 'warning';
            case 'complete': return 'error';
            default: return 'info';
        }
    }
    
    generateRecipeButtons(machineId, machineType, forceDisabled = false) {
        const recipes = this.game.productionHall.getRecipesForMachine(machineType);
        return recipes.sort((a, b) => a.name.localeCompare(b.name)).map(recipe => {
            // Check material availability and format with color coding
            const inputsInfo = Array.from(recipe.inputs.entries())
                .map(([material, quantity]) => {
                    // Check both input materials and output products warehouses
                    const availableInInput = this.game.warehouse.getInputMaterial(material);
                    const availableInOutput = this.game.warehouse.getOutputProduct(material);
                    const available = availableInInput + availableInOutput;
                    const hasEnough = available >= quantity;
                    const color = hasEnough ? '#28a745' : '#dc3545'; // green if enough, red if missing
                    const status = hasEnough ? '✓' : '✗';
                    
                    // Show where materials are located for clarity
                    let locationInfo = '';
                    if (availableInInput > 0 && availableInOutput > 0) {
                        locationInfo = ` (${availableInInput} in materials + ${availableInOutput} in products)`;
                    } else if (availableInInput > 0) {
                        locationInfo = ` (in materials)`;
                    } else if (availableInOutput > 0) {
                        locationInfo = ` (in products)`;
                    }
                    
                    return {
                        material,
                        quantity,
                        available,
                        hasEnough,
                        color,
                        status,
                        formatted: `<span style="color: ${color};">${status} ${quantity}x ${material} (have ${available}${locationInfo})</span>`
                    };
                });
            
            // Check if we have enough materials overall
            const hasEnoughMaterials = inputsInfo.every(input => input.hasEnough);
            const isDisabled = forceDisabled || !hasEnoughMaterials;
            const buttonClass = isDisabled ? 'btn btn-primary disabled' : 'btn btn-primary';
            
            // Calculate estimated profit
            const materialCost = Array.from(recipe.inputs.entries())
                .reduce((total, [material, quantity]) => {
                    const price = this.game.marketplace.getMaterialPrice(material);
                    return total + (price * quantity);
                }, 0);
            
            const outputValue = this.game.marketplace.getProductPrice(recipe.output) * recipe.quantity;
            const estimatedProfit = outputValue - materialCost;
            const profitPerSecond = estimatedProfit / recipe.time;
            
            const profitColor = estimatedProfit > 0 ? '#28a745' : estimatedProfit < 0 ? '#dc3545' : '#6c757d';
            const profitIcon = estimatedProfit > 0 ? '📈' : estimatedProfit < 0 ? '📉' : '➖';
            
            // Create missing materials list for tooltip
            const missingMaterials = inputsInfo
                .filter(input => !input.hasEnough)
                .map(input => `${input.material} (need ${input.quantity - input.available} more)`)
                .join(', ');
            
            let buttonTitle = '';
            if (forceDisabled) {
                buttonTitle = 'title="Machine is currently working"';
            } else if (!hasEnoughMaterials) {
                buttonTitle = `title="Missing materials: ${missingMaterials}"`;
            } else {
                buttonTitle = `title="Profit: $${estimatedProfit} (${profitPerSecond.toFixed(2)}/sec)"`;
            }
            
            return `
                <div style="margin: 0.5rem 0; padding: 0.75rem; border: 1px solid ${hasEnoughMaterials ? '#28a745' : '#dc3545'}; border-radius: 4px; background: ${hasEnoughMaterials ? '#f8fff8' : '#fff8f8'};">
                    <strong>${recipe.name}</strong><br>
                    <div style="margin: 0.5rem 0;">
                        <strong>Required Materials:</strong><br>
                        ${inputsInfo.map(input => input.formatted).join('<br>')}
                    </div>
                    <small><strong>Output:</strong> ${recipe.quantity}x ${recipe.output} (${recipe.time}s)</small><br>
                    
                    <!-- Profit Analysis -->
                    <div style="margin: 0.5rem 0; padding: 0.5rem; background: #f0f8ff; border-radius: 4px; border-left: 4px solid ${profitColor};">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span><strong>Cost:</strong> $${materialCost}</span>
                            <span><strong>Revenue:</strong> $${outputValue}</span>
                        </div>
                        <div style="margin-top: 0.25rem; text-align: center;">
                            <strong style="color: ${profitColor};">
                                ${profitIcon} Profit: $${estimatedProfit} 
                                (${profitPerSecond >= 0 ? '+' : ''}$${profitPerSecond.toFixed(2)}/sec)
                            </strong>
                        </div>
                    </div>
                    
                    <button class="${buttonClass}" 
                            onclick="window.factoryGame.ui.startProduction(${machineId}, '${recipe.name}')"
                            ${isDisabled ? 'disabled' : ''} 
                            ${buttonTitle}
                            style="margin-top: 0.5rem;">
                        ${hasEnoughMaterials ? 'Start Production' : 'Missing Materials'}
                    </button>
                </div>
            `;
        }).join('');
    }
    
    // UI Action Methods (called from HTML buttons)
    buyMaterial(materialName, quantity) {
        this.game.marketplace.buyMaterial(materialName, quantity);
    }
    
    sellProduct(productName, quantity) {
        this.game.marketplace.sellProduct(productName, quantity);
    }
    
    sellAllProducts(productName) {
        this.game.marketplace.sellProductAll(productName);
    }
    
    buyMachine(machineType) {
        this.game.productionHall.buyMachine(machineType);
    }
    
    sellMachine(machineId) {
        this.game.productionHall.sellMachine(machineId);
    }
    
    startProduction(machineId, recipeName) {
        this.game.productionHall.startProduction(machineId, recipeName);
    }
    
    setDefaultRecipe(machineId, recipeName) {
        this.game.productionHall.setDefaultRecipe(machineId, recipeName);
    }
    
    toggleAutoStart(machineId) {
        this.game.productionHall.toggleAutoStart(machineId);
    }
    
    transferProductToInput(productName, quantity) {
        const result = this.game.warehouse.transferProductToInput(productName, quantity);
        if (result.success) {
            this.game.log(result.reason, 'success');
        } else {
            this.game.log(result.reason, 'error');
        }
    }
    
    transferAllProductToInput(productName) {
        const result = this.game.warehouse.transferAllProductToInput(productName);
        if (result.success) {
            this.game.log(result.reason, 'success');
        } else {
            this.game.log(result.reason, 'error');
        }
    }
    
    expandWarehouse(type, slots) {
        const costPerSlot = type === 'input' ? 50 : 75;
        const totalCost = slots * costPerSlot;
        
        if (!this.game.spendMoney(totalCost)) {
            this.game.log(`Not enough money! Need $${totalCost}`, 'error');
            return;
        }
        
        if (type === 'input') {
            this.game.warehouse.expandInputCapacity(slots);
        } else {
            this.game.warehouse.expandOutputCapacity(slots);
        }
        
        this.game.log(`Expanded ${type} warehouse by ${slots} slots for $${totalCost}`, 'success');
    }
    
    expandProduction(slots) {
        this.game.productionHall.expandCapacity(slots);
    }
    
    saveGame() {
        this.game.saveGame();
    }
    
    resetGame() {
        if (confirm('Are you sure you want to reset the game? All progress will be lost!')) {
            localStorage.removeItem('factorySimulatorSave');
            location.reload();
        }
    }
    
    // Message system
    showMessage(message, type = 'info') {
        const messagesArea = document.getElementById('messages');
        const messageElement = document.createElement('p');
        messageElement.className = `message-${type}`;
        messageElement.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        
        messagesArea.appendChild(messageElement);
        
        // Keep only last 10 messages
        while (messagesArea.children.length > 10) {
            messagesArea.removeChild(messagesArea.firstChild);
        }
        
        // Auto-scroll to bottom
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
}