// Production Hall System - Machines and manufacturing
class ProductionHall {
    constructor(game) {
        this.game = game;
        
        // Production hall capacity
        this.maxMachines = 5;
        this.machines = [];
        
        // Machine types and their recipes
        this.machineTypes = new Map([
            ['Smelter', {
                cost: 200,
                recipes: [
                    {
                        name: 'Iron Ingot',
                        inputs: new Map([['Iron Ore', 2], ['Coal', 1]]),
                        output: 'Iron Ingot',
                        quantity: 1,
                        time: 20 // seconds
                    },
                    {
                        name: 'Steel Bar',
                        inputs: new Map([['Iron Ingot', 2], ['Coal', 2]]),
                        output: 'Steel Bar',
                        quantity: 1,
                        time: 40
                    }
                ]
            }],
            ['Workbench', {
                cost: 150,
                recipes: [
                    {
                        name: 'Wooden Plank',
                        inputs: new Map([['Wood', 1]]),
                        output: 'Wooden Plank',
                        quantity: 2,
                        time: 10
                    },
                    {
                        name: 'Concrete Block',
                        inputs: new Map([['Stone', 3], ['Wood', 1]]),
                        output: 'Concrete Block',
                        quantity: 1,
                        time: 30
                    }
                ]
            }],
            ['Wire Mill', {
                cost: 300,
                recipes: [
                    {
                        name: 'Copper Wire',
                        inputs: new Map([['Copper Ore', 1]]),
                        output: 'Copper Wire',
                        quantity: 3,
                        time: 16
                    }
                ]
            }],
            ['Assembly Line', {
                cost: 500,
                recipes: [
                    {
                        name: 'Electronic Component',
                        inputs: new Map([['Copper Wire', 2], ['Steel Bar', 1]]),
                        output: 'Electronic Component',
                        quantity: 1,
                        time: 50
                    },
                    {
                        name: 'Reinforced Concrete',
                        inputs: new Map([['Concrete Block', 2], ['Steel Bar', 1]]),
                        output: 'Reinforced Concrete',
                        quantity: 1,
                        time: 60
                    }
                ]
            }]
        ]);
        
        this.nextMachineId = 1;
    }
    
    // Machine management
    buyMachine(machineType) {
        if (this.machines.length >= this.maxMachines) {
            this.game.log('Production hall is at maximum capacity!', 'error');
            return false;
        }
        
        const machineInfo = this.machineTypes.get(machineType);
        if (!machineInfo) {
            this.game.log(`Unknown machine type: ${machineType}`, 'error');
            return false;
        }
        
        if (!this.game.spendMoney(machineInfo.cost)) {
            this.game.log(`Not enough money to buy ${machineType}! Cost: $${machineInfo.cost}`, 'error');
            return false;
        }
        
        const machine = {
            id: this.nextMachineId++,
            type: machineType,
            status: 'idle', // idle, working, complete
            currentRecipe: null,
            progress: 0,
            progressMax: 0,
            startTime: 0,
            defaultRecipe: null, // Default recipe name for auto-start
            autoStart: false // Auto-start when materials are available
        };
        
        this.machines.push(machine);
        this.game.log(`Purchased ${machineType} for $${machineInfo.cost}`, 'success');
        return true;
    }
    
    sellMachine(machineId) {
        const machineIndex = this.machines.findIndex(m => m.id === machineId);
        if (machineIndex === -1) {
            this.game.log('Machine not found!', 'error');
            return false;
        }
        
        const machine = this.machines[machineIndex];
        const machineInfo = this.machineTypes.get(machine.type);
        const sellPrice = Math.floor(machineInfo.cost * 0.7); // 70% of original cost
        
        this.machines.splice(machineIndex, 1);
        this.game.earnMoney(sellPrice);
        this.game.log(`Sold ${machine.type} for $${sellPrice}`, 'success');
        return true;
    }
    
    // Machine configuration
    setDefaultRecipe(machineId, recipeName) {
        const machine = this.machines.find(m => m.id === machineId);
        if (!machine) {
            this.game.log('Machine not found!', 'error');
            return false;
        }
        
        // Handle clearing default recipe
        if (!recipeName || recipeName === '') {
            machine.defaultRecipe = null;
            this.game.log(`Cleared default recipe for ${machine.type} #${machine.id}`, 'info');
            return true;
        }
        
        const machineInfo = this.machineTypes.get(machine.type);
        const recipe = machineInfo.recipes.find(r => r.name === recipeName);
        if (!recipe) {
            this.game.log(`Recipe "${recipeName}" not available for ${machine.type}!`, 'error');
            return false;
        }
        
        machine.defaultRecipe = recipeName;
        this.game.log(`Set default recipe for ${machine.type} #${machine.id} to ${recipeName}`, 'success');
        return true;
    }
    
    toggleAutoStart(machineId) {
        const machine = this.machines.find(m => m.id === machineId);
        if (!machine) {
            this.game.log('Machine not found!', 'error');
            return false;
        }
        
        machine.autoStart = !machine.autoStart;
        const status = machine.autoStart ? 'enabled' : 'disabled';
        this.game.log(`Auto-start ${status} for ${machine.type} #${machine.id}`, 'info');
        return machine.autoStart;
    }
    
    // Auto-start production for machines that have it enabled
    tryAutoStartProduction(machine) {
        if (!machine.autoStart || !machine.defaultRecipe || machine.status !== 'idle') {
            return false;
        }
        
        const machineInfo = this.machineTypes.get(machine.type);
        const recipe = machineInfo.recipes.find(r => r.name === machine.defaultRecipe);
        if (!recipe) {
            return false;
        }
        
        // Check if warehouse has enough materials and space for output
        if (this.game.warehouse.hasEnoughMaterials(recipe.inputs)) {
            const outputProducts = new Map([[recipe.output, recipe.quantity]]);
            if (this.game.warehouse.hasSpaceForProducts(outputProducts)) {
                // Start production automatically
                if (this.game.warehouse.consumeMaterials(recipe.inputs)) {
                    machine.status = 'working';
                    machine.currentRecipe = recipe;
                    machine.progress = 0;
                    machine.progressMax = recipe.time;
                    machine.startTime = this.game.getGameTime();
                    
                    this.game.log(`Auto-started ${recipe.name} on ${machine.type} #${machine.id}`, 'info');
                    return true;
                }
            }
        }
        return false;
    }
    
    // Production management
    startProduction(machineId, recipeName) {
        const machine = this.machines.find(m => m.id === machineId);
        if (!machine) {
            this.game.log('Machine not found!', 'error');
            return false;
        }
        
        if (machine.status !== 'idle') {
            this.game.log('Machine is already working!', 'error');
            return false;
        }
        
        const machineInfo = this.machineTypes.get(machine.type);
        const recipe = machineInfo.recipes.find(r => r.name === recipeName);
        if (!recipe) {
            this.game.log(`Recipe "${recipeName}" not available for ${machine.type}!`, 'error');
            return false;
        }
        
        // Check if warehouse has enough materials
        if (!this.game.warehouse.hasEnoughMaterials(recipe.inputs)) {
            const missingMaterials = [];
            for (let [material, needed] of recipe.inputs.entries()) {
                const available = this.game.warehouse.getInputMaterial(material);
                if (available < needed) {
                    missingMaterials.push(`${material} (need ${needed}, have ${available})`);
                }
            }
            this.game.log(`Not enough materials: ${missingMaterials.join(', ')}`, 'error');
            return false;
        }
        
        // Check if warehouse has space for output
        const outputProducts = new Map([[recipe.output, recipe.quantity]]);
        if (!this.game.warehouse.hasSpaceForProducts(outputProducts)) {
            this.game.log('Output warehouse is full!', 'error');
            return false;
        }
        
        // Consume materials and start production
        if (this.game.warehouse.consumeMaterials(recipe.inputs)) {
            machine.status = 'working';
            machine.currentRecipe = recipe;
            machine.progress = 0;
            machine.progressMax = recipe.time;
            machine.startTime = this.game.getGameTime();
            
            this.game.log(`Started producing ${recipe.name} on ${machine.type}`, 'success');
            return true;
        }
        
        return false;
    }
    
    // Update production progress
    update() {
        for (let machine of this.machines) {
            if (machine.status === 'working') {
                machine.progress = this.game.getGameTime() - machine.startTime;
                
                // Check if production is complete
                if (machine.progress >= machine.progressMax) {
                    this.completeProduction(machine);
                }
            } else if (machine.status === 'idle') {
                // Try to auto-start production if enabled
                this.tryAutoStartProduction(machine);
            }
        }
    }
    
    completeProduction(machine) {
        if (!machine.currentRecipe) return;
        
        const recipe = machine.currentRecipe;
        const outputProducts = new Map([[recipe.output, recipe.quantity]]);
        
        // Add products to warehouse
        if (this.game.warehouse.addProducedProducts(outputProducts)) {
            // Automatically reset machine to idle (no manual collection needed)
            machine.status = 'idle';
            machine.currentRecipe = null;
            machine.progress = 0;
            machine.progressMax = 0;
            machine.startTime = 0;
            
            this.game.log(`Completed production of ${recipe.quantity} ${recipe.output} - Machine ready for next job`, 'success');
        } else {
            // If warehouse is full, keep machine in working state
            this.game.log(`Cannot complete production - output warehouse full!`, 'warning');
        }
    }
    
    // Note: Machines now automatically reset to idle when production completes
    // No manual collection needed - products are auto-added to warehouse
    
    // Capacity management
    expandCapacity(additionalSlots) {
        const costPerSlot = 500;
        const totalCost = additionalSlots * costPerSlot;
        
        if (!this.game.spendMoney(totalCost)) {
            this.game.log(`Not enough money to expand capacity! Cost: $${totalCost}`, 'error');
            return false;
        }
        
        this.maxMachines += additionalSlots;
        this.game.log(`Expanded production hall by ${additionalSlots} slots for $${totalCost}`, 'success');
        return true;
    }
    
    // Information getters
    getMachines() {
        return [...this.machines];
    }
    
    getMachine(machineId) {
        return this.machines.find(m => m.id === machineId);
    }
    
    getAvailableSlots() {
        return this.maxMachines - this.machines.length;
    }
    
    getMachineTypes() {
        return new Map(this.machineTypes);
    }
    
    getRecipesForMachine(machineType) {
        const machineInfo = this.machineTypes.get(machineType);
        return machineInfo ? [...machineInfo.recipes] : [];
    }
    
    getAllRecipes() {
        const allRecipes = [];
        for (let [machineType, info] of this.machineTypes.entries()) {
            for (let recipe of info.recipes) {
                allRecipes.push({
                    ...recipe,
                    machineType: machineType
                });
            }
        }
        return allRecipes;
    }
    
    // Status reporting
    getProductionStatus() {
        const status = {
            capacity: this.maxMachines,
            used: this.machines.length,
            available: this.getAvailableSlots(),
            machines: {
                idle: 0,
                working: 0,
                complete: 0
            },
            details: []
        };
        
        for (let machine of this.machines) {
            status.machines[machine.status]++;
            
            const progress = machine.status === 'working' 
                ? Math.min(100, (machine.progress / machine.progressMax) * 100)
                : (machine.status === 'complete' ? 100 : 0);
            
            status.details.push({
                id: machine.id,
                type: machine.type,
                status: machine.status,
                recipe: machine.currentRecipe?.name || 'None',
                progress: Math.round(progress)
            });
        }
        
        return status;
    }
    
    // Save/Load functionality
    getSaveData() {
        return {
            maxMachines: this.maxMachines,
            machines: this.machines.map(machine => ({
                ...machine,
                // Convert Map to Object for JSON serialization
                currentRecipe: machine.currentRecipe ? {
                    ...machine.currentRecipe,
                    inputs: Object.fromEntries(machine.currentRecipe.inputs)
                } : null
            })),
            nextMachineId: this.nextMachineId
        };
    }
    
    loadSaveData(data) {
        this.maxMachines = data.maxMachines || 5;
        this.nextMachineId = data.nextMachineId || 1;
        
        if (data.machines) {
            this.machines = data.machines.map(machine => ({
                ...machine,
                // Convert Object back to Map
                currentRecipe: machine.currentRecipe ? {
                    ...machine.currentRecipe,
                    inputs: new Map(Object.entries(machine.currentRecipe.inputs))
                } : null
            }));
        }
    }
}