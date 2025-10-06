// Factory Simulator - Configuration File
// All game configuration values in one place for easy modification

const GameConfig = {
    // Starting values
    starting: {
        money: 1000,
        gameTime: 1,
        day: 1
    },
    
    // Game timing configuration
    timing: {
        gameLoopInterval: 1000, // milliseconds - game loop update frequency
        autoSaveInterval: 30000, // milliseconds - auto-save frequency
        priceUpdateFrequency: 30, // seconds - how often prices update
        dayLength: 60 // seconds - how long a game day lasts
    },
    
    // Maintenance costs
    maintenance: {
        costPerSlot: 5, // $ per machine slot per day
        historyDays: 30 // days of money history to keep
    },
    
    // Warehouse configuration
    warehouse: {
        initialInputCapacity: 100,
        initialOutputCapacity: 50,
        
        // Basic materials that can be bought
        basicMaterials: [
            'Iron Ore',
            'Wood',
            'Coal',
            'Copper Ore',
            'Stone'
        ],
        
        // Products that can be manufactured
        basicProducts: [
            'Iron Ingot',
            'Wooden Plank',
            'Copper Wire',
            'Steel Bar',
            'Concrete Block',
            'Electronic Component',
            'Reinforced Concrete'
        ]
    },
    
    // Marketplace configuration
    marketplace: {
        // Material prices (buy prices)
        materialPrices: {
            'Iron Ore': 5,
            'Wood': 3,
            'Coal': 4,
            'Copper Ore': 7,
            'Stone': 2
        },
        
        // Product prices (sell prices)
        productPrices: {
            'Iron Ingot': 15,
            'Wooden Plank': 8,
            'Copper Wire': 20,
            'Steel Bar': 25,
            'Concrete Block': 12,
            'Electronic Component': 75,
            'Reinforced Concrete': 45
        },
        
        // Price volatility
        priceVolatility: 0.1, // 10% max price change
        maxPriceHistory: 50 // Maximum price history points to keep
    },
    
    // Production hall configuration
    production: {
        initialMaxMachines: 5,
        expansionCostPerSlot: 500,
        machineSellbackRate: 0.7, // 70% of original cost
        
        // Machine types and their configurations
        machineTypes: {
            'Smelter': {
                cost: 200,
                recipes: [
                    {
                        name: 'Iron Ingot',
                        inputs: {
                            'Iron Ore': 2,
                            'Coal': 1
                        },
                        output: 'Iron Ingot',
                        quantity: 1,
                        time: 20 // seconds
                    },
                    {
                        name: 'Steel Bar',
                        inputs: {
                            'Iron Ingot': 2,
                            'Coal': 2
                        },
                        output: 'Steel Bar',
                        quantity: 1,
                        time: 40
                    }
                ]
            },
            'Workbench': {
                cost: 150,
                recipes: [
                    {
                        name: 'Wooden Plank',
                        inputs: {
                            'Wood': 1
                        },
                        output: 'Wooden Plank',
                        quantity: 2,
                        time: 10
                    },
                    {
                        name: 'Concrete Block',
                        inputs: {
                            'Stone': 3,
                            'Wood': 1
                        },
                        output: 'Concrete Block',
                        quantity: 1,
                        time: 30
                    }
                ]
            },
            'Wire Mill': {
                cost: 300,
                recipes: [
                    {
                        name: 'Copper Wire',
                        inputs: {
                            'Copper Ore': 1
                        },
                        output: 'Copper Wire',
                        quantity: 3,
                        time: 16
                    }
                ]
            },
            'Assembly Line': {
                cost: 500,
                recipes: [
                    {
                        name: 'Electronic Component',
                        inputs: {
                            'Copper Wire': 2,
                            'Steel Bar': 1
                        },
                        output: 'Electronic Component',
                        quantity: 1,
                        time: 50
                    },
                    {
                        name: 'Reinforced Concrete',
                        inputs: {
                            'Concrete Block': 2,
                            'Steel Bar': 1
                        },
                        output: 'Reinforced Concrete',
                        quantity: 1,
                        time: 60
                    }
                ]
            }
        }
    },
    
    // UI configuration
    ui: {
        updateThrottle: 200, // milliseconds - minimum time between user interaction and UI update
        fullUpdateInterval: 3 // seconds - how often to do full UI update
    }
};
