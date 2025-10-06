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
    
    // Materials configuration - combines items with their prices
    materials: [
        { id: 1, name: 'Iron Ore', price: 5 },
        { id: 2, name: 'Wood', price: 3 },
        { id: 3, name: 'Coal', price: 4 },
        { id: 4, name: 'Copper Ore', price: 7 },
        { id: 5, name: 'Stone', price: 2 }
    ],
    
    // Products configuration - combines items with their prices
    products: [
        { id: 101, name: 'Iron Ingot', price: 15 },
        { id: 102, name: 'Wooden Plank', price: 8 },
        { id: 103, name: 'Copper Wire', price: 20 },
        { id: 104, name: 'Steel Bar', price: 25 },
        { id: 105, name: 'Concrete Block', price: 12 },
        { id: 106, name: 'Electronic Component', price: 75 },
        { id: 107, name: 'Reinforced Concrete', price: 45 }
    ],
    
    // Warehouse configuration
    warehouse: {
        initialInputCapacity: 100,
        initialOutputCapacity: 50
    },
    
    // Marketplace configuration
    marketplace: {
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
