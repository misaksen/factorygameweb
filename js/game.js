// Factory Simulator - Main Game Controller
class FactoryGame {
    constructor() {
        this.money = GameConfig.starting.money;
        this.gameTime = GameConfig.starting.gameTime; // Day counter
        this.isRunning = false;
        
        // Money history tracking for statistics
        this.moneyHistory = [
            { day: GameConfig.starting.day, money: GameConfig.starting.money }
        ];
        
        // Initialize game systems
        this.warehouse = new Warehouse();
        this.marketplace = new Marketplace(this);
        this.productionHall = new ProductionHall(this);
        this.ui = new UI(this);
        
        // Game loop interval
        this.gameLoopInterval = null;
        this.autoSaveInterval = null;
        
        this.init();
    }
    
    init() {
        console.log('Initializing Factory Simulator...');
        
        // Load saved game or start new
        this.loadGame();
        
        // Initialize UI
        this.ui.init();
        
        // Start game loop
        this.startGameLoop();
        
        // Setup auto-save
        this.setupAutoSave();
        
        this.log('Factory Simulator initialized successfully!');
    }
    
    startGameLoop() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.gameLoopInterval = setInterval(() => {
            this.gameLoop();
        }, GameConfig.timing.gameLoopInterval);
        
        this.log('Game started!');
    }
    
    stopGameLoop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
        
        this.log('Game paused.');
    }
    
    gameLoop() {
        // Update production
        this.productionHall.update();
        
        // Update marketplace prices
        if (this.gameTime % GameConfig.timing.priceUpdateFrequency === 0) {
            this.marketplace.updatePrices();
        }
        
        // Advance time
        if (this.gameTime % GameConfig.timing.dayLength === 0) {
            this.advanceDay();
        }
        
        // Update UI less frequently and only essential parts
        this.ui.updateGameStats(); // Always update money and time
        
        // Avoid updating during user interactions
        const timeSinceInteraction = Date.now() - this.ui.lastUserInteraction;
        const canUpdate = timeSinceInteraction > GameConfig.ui.updateThrottle;
        
        // Only update view content at regular intervals, when something significant changes, or when forced
        if (canUpdate && (this.gameTime % GameConfig.ui.fullUpdateInterval === 0 || this.ui.needsFullUpdate)) {
            this.ui.updateViewContent(this.ui.currentView);
            this.ui.needsFullUpdate = false;
        }
        
        this.gameTime++;
    }
    
    advanceDay() {
        const day = Math.floor(this.gameTime / GameConfig.timing.dayLength) + 1;
        this.log(`Day ${day} begins...`);
        
        // Calculate and apply daily maintenance costs
        const totalSlots = this.productionHall.getProductionStatus().capacity;
        const totalMaintenanceCost = totalSlots * GameConfig.maintenance.costPerSlot;
        
        if (totalMaintenanceCost > 0) {
            this.money -= totalMaintenanceCost;
            this.log(`Daily maintenance cost: $${totalMaintenanceCost} (${totalSlots} slots × $${GameConfig.maintenance.costPerSlot})`, 'warning');
            
            // Check if player went into debt
            if (this.money < 0) {
                this.log(`Warning: Negative balance! Current money: $${this.money}`, 'error');
            }
        }
        
        // Record money for statistics (after maintenance costs)
        this.moneyHistory.push({
            day: day,
            money: this.money
        });
        
        // Keep only last N days of history to avoid memory issues
        if (this.moneyHistory.length > GameConfig.maintenance.historyDays) {
            this.moneyHistory.shift();
        }
        
        // Daily events could go here
        // - Random price fluctuations
        // - New products unlocked
    }
    
    // Money management
    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            return true;
        }
        return false;
    }
    
    earnMoney(amount) {
        this.money += amount;
    }
    
    getMoney() {
        return this.money;
    }
    
    // Logging system
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`);
        
        // Display message in UI
        this.ui.showMessage(message, type);
    }
    
    // Save/Load system
    saveGame() {
        const gameState = {
            money: this.money,
            gameTime: this.gameTime,
            moneyHistory: this.moneyHistory,
            warehouse: this.warehouse.getSaveData(),
            productionHall: this.productionHall.getSaveData(),
            marketplace: this.marketplace.getSaveData()
        };
        
        try {
            localStorage.setItem('factorySimulatorSave', JSON.stringify(gameState));
            this.log('Game saved successfully!', 'success');
        } catch (error) {
            this.log('Failed to save game: ' + error.message, 'error');
        }
    }
    
    loadGame() {
        try {
            const savedData = localStorage.getItem('factorySimulatorSave');
            if (savedData) {
                const gameState = JSON.parse(savedData);
                
                this.money = gameState.money || GameConfig.starting.money;
                this.gameTime = gameState.gameTime || GameConfig.starting.gameTime;
                this.moneyHistory = gameState.moneyHistory || [{ day: GameConfig.starting.day, money: this.money }];
                
                if (gameState.warehouse) {
                    this.warehouse.loadSaveData(gameState.warehouse);
                }
                if (gameState.productionHall) {
                    this.productionHall.loadSaveData(gameState.productionHall);
                }
                if (gameState.marketplace) {
                    this.marketplace.loadSaveData(gameState.marketplace);
                }
                
                this.log('Game loaded successfully!', 'success');
            } else {
                this.log('Starting new game...');
            }
        } catch (error) {
            this.log('Failed to load saved game, starting fresh: ' + error.message, 'warning');
        }
    }
    
    resetGame() {
        console.log('Resetting game...');
        
        // Stop game loop and auto-save
        this.stopGameLoop();
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        
        // Clear saved data
        localStorage.removeItem('factorySimulatorSave');
        
        // Reset game state to initial values
        this.money = GameConfig.starting.money;
        this.gameTime = GameConfig.starting.gameTime;
        this.isRunning = false;
        this.moneyHistory = [{ day: GameConfig.starting.day, money: GameConfig.starting.money }];
        
        // Reset all game systems
        this.warehouse = new Warehouse();
        this.marketplace = new Marketplace(this);
        this.productionHall = new ProductionHall(this);
        this.ui = new UI(this);
        
        // Reinitialize the game
        this.ui.init();
        this.startGameLoop();
        
        // Reset pause button state
        if (typeof updatePauseButton === 'function') {
            updatePauseButton(false);
        }
        
        this.log('Game has been reset! Starting fresh...', 'success');
    }
    
    setupAutoSave() {
        // Auto-save at configured interval
        this.autoSaveInterval = setInterval(() => {
            this.saveGame();
        }, GameConfig.timing.autoSaveInterval);
    }
    
    // Game state getters
    getCurrentDay() {
        return Math.floor(this.gameTime / GameConfig.timing.dayLength) + 1;
    }
    
    getGameTime() {
        return this.gameTime;
    }
    
    // Cleanup
    destroy() {
        this.stopGameLoop();
        
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Final save
        this.saveGame();
        
        this.log('Game session ended.');
    }
    
    // Helper functions for ID/name conversion
    getMaterialName(id) {
        const material = GameConfig.materials.find(m => m.id === id);
        return material ? material.name : null;
    }
    
    getProductName(id) {
        const product = GameConfig.products.find(p => p.id === id);
        return product ? product.name : null;
    }
    
    // Get name for any item (material or product)
    getItemName(id) {
        return this.getMaterialName(id) || this.getProductName(id) || `Unknown_${id}`;
    }
    
    getMaterialId(name) {
        const material = GameConfig.materials.find(m => m.name === name);
        return material ? material.id : null;
    }
    
    getProductId(name) {
        const product = GameConfig.products.find(p => p.name === name);
        return product ? product.id : null;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    window.factoryGame = new FactoryGame();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.factoryGame) {
        window.factoryGame.destroy();
    }
});