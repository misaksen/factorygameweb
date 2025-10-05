// Warehouse Management System
class Warehouse {
    constructor() {
        // Storage capacities
        this.inputCapacity = 100;
        this.outputCapacity = 50;
        
        // Current storage
        this.inputMaterials = new Map();
        this.outputProducts = new Map();
        
        // Initialize with basic materials and products
        this.initializeItems();
    }
    
    initializeItems() {
        // Basic materials that can be bought
        const basicMaterials = [
            'Iron Ore',
            'Wood',
            'Coal',
            'Copper Ore',
            'Stone'
        ];
        
        // Products that can be manufactured
        const basicProducts = [
            'Iron Ingot',
            'Wooden Plank',
            'Copper Wire',
            'Steel Bar',
            'Concrete Block',
            'Electronic Component',
            'Reinforced Concrete'
        ];
        
        // Initialize storage with zero quantities
        basicMaterials.forEach(material => {
            this.inputMaterials.set(material, 0);
        });
        
        basicProducts.forEach(product => {
            this.outputProducts.set(product, 0);
        });
    }
    
    // Input materials management
    addInputMaterial(materialName, quantity) {
        const currentAmount = this.inputMaterials.get(materialName) || 0;
        const availableSpace = this.getInputAvailableSpace();
        const actualQuantity = Math.min(quantity, availableSpace);
        
        if (actualQuantity > 0) {
            this.inputMaterials.set(materialName, currentAmount + actualQuantity);
            return actualQuantity;
        }
        return 0;
    }
    
    removeInputMaterial(materialName, quantity) {
        const currentAmount = this.inputMaterials.get(materialName) || 0;
        const actualQuantity = Math.min(quantity, currentAmount);
        
        if (actualQuantity > 0) {
            this.inputMaterials.set(materialName, currentAmount - actualQuantity);
            return actualQuantity;
        }
        return 0;
    }
    
    getInputMaterial(materialName) {
        return this.inputMaterials.get(materialName) || 0;
    }
    
    // Output products management
    addOutputProduct(productName, quantity) {
        const currentAmount = this.outputProducts.get(productName) || 0;
        const availableSpace = this.getOutputAvailableSpace();
        const actualQuantity = Math.min(quantity, availableSpace);
        
        if (actualQuantity > 0) {
            this.outputProducts.set(productName, currentAmount + actualQuantity);
            return actualQuantity;
        }
        return 0;
    }
    
    removeOutputProduct(productName, quantity) {
        const currentAmount = this.outputProducts.get(productName) || 0;
        const actualQuantity = Math.min(quantity, currentAmount);
        
        if (actualQuantity > 0) {
            this.outputProducts.set(productName, currentAmount - actualQuantity);
            return actualQuantity;
        }
        return 0;
    }
    
    getOutputProduct(productName) {
        return this.outputProducts.get(productName) || 0;
    }
    
    // Capacity management
    getInputTotalUsed() {
        let total = 0;
        for (let quantity of this.inputMaterials.values()) {
            total += quantity;
        }
        return total;
    }
    
    getOutputTotalUsed() {
        let total = 0;
        for (let quantity of this.outputProducts.values()) {
            total += quantity;
        }
        return total;
    }
    
    getInputAvailableSpace() {
        return this.inputCapacity - this.getInputTotalUsed();
    }
    
    getOutputAvailableSpace() {
        return this.outputCapacity - this.getOutputTotalUsed();
    }
    
    getInputCapacityPercentage() {
        return (this.getInputTotalUsed() / this.inputCapacity) * 100;
    }
    
    getOutputCapacityPercentage() {
        return (this.getOutputTotalUsed() / this.outputCapacity) * 100;
    }
    
    // Capacity expansion
    expandInputCapacity(additionalCapacity, cost) {
        this.inputCapacity += additionalCapacity;
        return true;
    }
    
    expandOutputCapacity(additionalCapacity, cost) {
        this.outputCapacity += additionalCapacity;
        return true;
    }
    
    // Utility methods
    getAllInputMaterials() {
        return new Map(this.inputMaterials);
    }
    
    getAllOutputProducts() {
        return new Map(this.outputProducts);
    }
    
    getInputMaterialsList() {
        return Array.from(this.inputMaterials.keys());
    }
    
    getOutputProductsList() {
        return Array.from(this.outputProducts.keys());
    }
    
    // Check if there's enough material for production
    hasEnoughMaterials(requirements) {
        for (let [material, quantity] of requirements.entries()) {
            const availableInInput = this.getInputMaterial(material);
            const availableInOutput = this.getOutputProduct(material);
            const totalAvailable = availableInInput + availableInOutput;
            if (totalAvailable < quantity) {
                return false;
            }
        }
        return true;
    }
    
    // Consume materials for production
    consumeMaterials(requirements) {
        if (!this.hasEnoughMaterials(requirements)) {
            return false;
        }
        
        for (let [material, quantity] of requirements.entries()) {
            let remainingToConsume = quantity;
            
            // First, consume from input materials
            const availableInInput = this.getInputMaterial(material);
            const consumeFromInput = Math.min(remainingToConsume, availableInInput);
            if (consumeFromInput > 0) {
                this.removeInputMaterial(material, consumeFromInput);
                remainingToConsume -= consumeFromInput;
            }
            
            // Then, consume from output products if needed
            if (remainingToConsume > 0) {
                const availableInOutput = this.getOutputProduct(material);
                const consumeFromOutput = Math.min(remainingToConsume, availableInOutput);
                if (consumeFromOutput > 0) {
                    this.removeOutputProduct(material, consumeFromOutput);
                    remainingToConsume -= consumeFromOutput;
                }
            }
        }
        return true;
    }
    
    // Check if there's space for production output
    hasSpaceForProducts(products) {
        let totalSpace = 0;
        for (let quantity of products.values()) {
            totalSpace += quantity;
        }
        return this.getOutputAvailableSpace() >= totalSpace;
    }
    
    // Add produced products
    addProducedProducts(products) {
        if (!this.hasSpaceForProducts(products)) {
            return false;
        }
        
        for (let [product, quantity] of products.entries()) {
            this.addOutputProduct(product, quantity);
        }
        return true;
    }
    
    // Transfer products from output warehouse to input warehouse
    transferProductToInput(productName, quantity) {
        // Check if we have enough of the product in output
        const availableInOutput = this.getOutputProduct(productName);
        if (availableInOutput < quantity) {
            return {
                success: false,
                transferred: 0,
                reason: `Not enough ${productName} in output warehouse (have ${availableInOutput}, need ${quantity})`
            };
        }
        
        // Check if there's space in input warehouse
        const availableInputSpace = this.getInputAvailableSpace();
        const actualQuantity = Math.min(quantity, availableInputSpace);
        
        if (actualQuantity === 0) {
            return {
                success: false,
                transferred: 0,
                reason: 'Input warehouse is full'
            };
        }
        
        // Perform the transfer
        this.removeOutputProduct(productName, actualQuantity);
        this.addInputMaterial(productName, actualQuantity);
        
        return {
            success: true,
            transferred: actualQuantity,
            reason: actualQuantity < quantity ? 
                `Transferred ${actualQuantity} (input warehouse full)` : 
                `Transferred ${actualQuantity} ${productName} to input warehouse`
        };
    }
    
    // Transfer all available quantity of a product to input
    transferAllProductToInput(productName) {
        const availableQuantity = this.getOutputProduct(productName);
        if (availableQuantity === 0) {
            return {
                success: false,
                transferred: 0,
                reason: `No ${productName} available in output warehouse`
            };
        }
        
        return this.transferProductToInput(productName, availableQuantity);
    }
    
    // Get list of products that can be transferred (exist in output warehouse)
    getTransferableProducts() {
        const transferable = [];
        for (let [productName, quantity] of this.outputProducts.entries()) {
            if (quantity > 0) {
                transferable.push({
                    name: productName,
                    quantity: quantity,
                    canTransfer: this.getInputAvailableSpace() > 0
                });
            }
        }
        return transferable;
    }
    
    // Save/Load functionality
    getSaveData() {
        return {
            inputCapacity: this.inputCapacity,
            outputCapacity: this.outputCapacity,
            inputMaterials: Object.fromEntries(this.inputMaterials),
            outputProducts: Object.fromEntries(this.outputProducts)
        };
    }
    
    loadSaveData(data) {
        this.inputCapacity = data.inputCapacity || 100;
        this.outputCapacity = data.outputCapacity || 50;
        
        if (data.inputMaterials) {
            this.inputMaterials = new Map(Object.entries(data.inputMaterials));
        }
        
        if (data.outputProducts) {
            this.outputProducts = new Map(Object.entries(data.outputProducts));
        }
    }
    
    // Status reporting
    getStatusReport() {
        return {
            input: {
                capacity: this.inputCapacity,
                used: this.getInputTotalUsed(),
                available: this.getInputAvailableSpace(),
                percentage: this.getInputCapacityPercentage(),
                items: this.getAllInputMaterials()
            },
            output: {
                capacity: this.outputCapacity,
                used: this.getOutputTotalUsed(),
                available: this.getOutputAvailableSpace(),
                percentage: this.getOutputCapacityPercentage(),
                items: this.getAllOutputProducts()
            }
        };
    }
}