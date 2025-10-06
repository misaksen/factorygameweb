// Production Hall System - Machines and manufacturing
class ProductionHall {
    constructor(game) {
        this.game = game;
        
        // Production hall capacity
        this.maxMachines = GameConfig.production.initialMaxMachines;
        this.machines = [];
        
        // Machine types and their recipes - convert config format to Maps
        this.machineTypes = new Map();
        this.machineTypesByName = new Map(); // For backward compatibility
        
        for (const machineTypeConfig of GameConfig.production.machineTypes) {
            const machineData = {
                id: machineTypeConfig.id,
                name: machineTypeConfig.name,
                cost: machineTypeConfig.cost,
                recipes: machineTypeConfig.recipes.map(recipe => ({
                    name: recipe.name,
                    inputs: new Map(Object.entries(recipe.inputs).map(([id, quantity]) => [
                        this.game.getItemName(parseInt(id)),
                        quantity
                    ])),
                    output: this.game.getItemName(recipe.output),
                    quantity: recipe.quantity,
                    time: recipe.time
                }))
            };
            
            // Store by ID (primary key)
            this.machineTypes.set(machineTypeConfig.id, machineData);
            // Store by name for backward compatibility
            this.machineTypesByName.set(machineTypeConfig.name, machineData);
        }
        
        this.nextMachineId = 1;
    }
    
    // Machine management
    buyMachine(machineType) {
        if (this.machines.length >= this.maxMachines) {
            this.game.log('Production hall is at maximum capacity!', 'error');
            return false;
        }
        
        // Try to get machine info by ID first, then by name for backward compatibility
        let machineInfo = this.machineTypes.get(machineType);
        if (!machineInfo) {
            machineInfo = this.machineTypesByName.get(machineType);
        }
        
        if (!machineInfo) {
            this.game.log(`Unknown machine type: ${machineType}`, 'error');
            return false;
        }
        
        if (!this.game.spendMoney(machineInfo.cost)) {
            this.game.log(`Not enough money to buy ${machineInfo.name}! Cost: $${machineInfo.cost}`, 'error');
            return false;
        }
        
        const machine = {
            id: this.nextMachineId++,
            typeId: machineInfo.id, // Store machine type ID
            typeName: machineInfo.name, // Store machine type name for display
            status: 'idle', // idle, working, complete
            currentRecipe: null,
            progress: 0,
            progressMax: 0,
            startTime: 0,
            defaultRecipe: null, // Default recipe name for auto-start
            autoStart: false // Auto-start when materials are available
        };
        
        this.machines.push(machine);
        this.game.log(`Purchased ${machineInfo.name} for $${machineInfo.cost}`, 'success');
        return true;
    }
    
    sellMachine(machineId) {
        const machineIndex = this.machines.findIndex(m => m.id === machineId);
        if (machineIndex === -1) {
            this.game.log('Machine not found!', 'error');
            return false;
        }
        
        const machine = this.machines[machineIndex];
        const machineInfo = this.machineTypes.get(machine.typeId);
        const sellPrice = Math.floor(machineInfo.cost * GameConfig.production.machineSellbackRate);
        
        this.machines.splice(machineIndex, 1);
        this.game.earnMoney(sellPrice);
        this.game.log(`Sold ${machine.typeName} for $${sellPrice}`, 'success');
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
            this.game.log(`Cleared default recipe for ${machine.typeName} #${machine.id}`, 'info');
            return true;
        }
        
        const machineInfo = this.machineTypes.get(machine.typeId);
        const recipe = machineInfo.recipes.find(r => r.name === recipeName);
        if (!recipe) {
            this.game.log(`Recipe "${recipeName}" not available for ${machine.typeName}!`, 'error');
            return false;
        }
        
        machine.defaultRecipe = recipeName;
        this.game.log(`Set default recipe for ${machine.typeName} #${machine.id} to ${recipeName}`, 'success');
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
        this.game.log(`Auto-start ${status} for ${machine.typeName} #${machine.id}`, 'info');
        return machine.autoStart;
    }
    
    // Auto-start production for machines that have it enabled
    tryAutoStartProduction(machine) {
        if (!machine.autoStart || !machine.defaultRecipe || machine.status !== 'idle') {
            return false;
        }
        
        const machineInfo = this.machineTypes.get(machine.typeId);
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
                    
                    this.game.log(`Auto-started ${recipe.name} on ${machine.typeName} #${machine.id}`, 'info');
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
        
        const machineInfo = this.machineTypes.get(machine.typeId);
        const recipe = machineInfo.recipes.find(r => r.name === recipeName);
        if (!recipe) {
            this.game.log(`Recipe "${recipeName}" not available for ${machine.typeName}!`, 'error');
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
            
            this.game.log(`Started producing ${recipe.name} on ${machine.typeName}`, 'success');
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
        const totalCost = additionalSlots * GameConfig.production.expansionCostPerSlot;
        
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
        // Try to get machine info by ID first, then by name for backward compatibility
        let machineInfo = this.machineTypes.get(machineType);
        if (!machineInfo) {
            machineInfo = this.machineTypesByName.get(machineType);
        }
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
                type: machine.typeName,
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
        this.maxMachines = data.maxMachines || GameConfig.production.initialMaxMachines;
        this.nextMachineId = data.nextMachineId || 1;
        
        if (data.machines) {
            this.machines = data.machines.map(machine => {
                const loadedMachine = {
                    ...machine,
                    // Convert Object back to Map
                    currentRecipe: machine.currentRecipe ? {
                        ...machine.currentRecipe,
                        inputs: new Map(Object.entries(machine.currentRecipe.inputs))
                    } : null
                };
                
                // Handle backward compatibility for machines with old 'type' field
                if (machine.type && !machine.typeId) {
                    const machineInfo = this.machineTypesByName.get(machine.type);
                    if (machineInfo) {
                        loadedMachine.typeId = machineInfo.id;
                        loadedMachine.typeName = machineInfo.name;
                    } else {
                        // Fallback for unknown machine types
                        console.warn(`Unknown machine type: ${machine.type}, defaulting to Smelter`);
                        loadedMachine.typeId = 201; // Default to Smelter
                        loadedMachine.typeName = 'Smelter';
                    }
                    // Remove old type field
                    delete loadedMachine.type;
                }
                
                // Ensure all machines have required fields
                if (!loadedMachine.typeId || !loadedMachine.typeName) {
                    console.warn('Machine missing type information, defaulting to Smelter', loadedMachine);
                    loadedMachine.typeId = loadedMachine.typeId || 201;
                    loadedMachine.typeName = loadedMachine.typeName || 'Smelter';
                }
                
                return loadedMachine;
            });
        }
    }
}