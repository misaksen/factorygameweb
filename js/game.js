// Factory Simulator - Main Game Controller
class FactoryGame {
    constructor() {
        this.money = 1000;
        this.gameTime = 1; // Day counter
        this.isRunning = false;
        
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
        }, 1000); // Update every second
        
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
        
        // Update marketplace prices (every 30 seconds)
        if (this.gameTime % 30 === 0) {
            this.marketplace.updatePrices();
        }
        
        // Advance time every 60 seconds (1 minute = 1 game day)
        if (this.gameTime % 60 === 0) {
            this.advanceDay();
        }
        
        // Update UI
        this.ui.updateDisplay();
        
        this.gameTime++;
    }
    
    advanceDay() {
        const day = Math.floor(this.gameTime / 60) + 1;
        this.log(`Day ${day} begins...`);
        
        // Daily events could go here
        // - Random price fluctuations
        // - Equipment maintenance costs
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
                
                this.money = gameState.money || 1000;
                this.gameTime = gameState.gameTime || 1;
                
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
        this.money = 1000;
        this.gameTime = 1;
        this.isRunning = false;
        
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
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            this.saveGame();
        }, 30000);
    }
    
    // Game state getters
    getCurrentDay() {
        return Math.floor(this.gameTime / 60) + 1;
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