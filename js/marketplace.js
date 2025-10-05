// Marketplace System - Buy materials and sell products
class Marketplace {
    constructor(game) {
        this.game = game;
        
        // Material prices (buy prices)
        this.materialPrices = new Map([
            ['Iron Ore', 5],
            ['Wood', 3],
            ['Coal', 4],
            ['Copper Ore', 7],
            ['Stone', 2]
        ]);
        
        // Product prices (sell prices)
        this.productPrices = new Map([
            ['Iron Ingot', 15],
            ['Wooden Plank', 8],
            ['Copper Wire', 20],
            ['Steel Bar', 25],
            ['Concrete Block', 12],
            ['Electronic Component', 75],
            ['Reinforced Concrete', 45]
        ]);
        
        // Price volatility
        this.priceVolatility = 0.1; // 10% max price change
        this.priceUpdateCounter = 0;
    }
    
    // Buy materials
    buyMaterial(materialName, quantity) {
        const price = this.materialPrices.get(materialName);
        if (!price) {
            this.game.log(`Material "${materialName}" not available!`, 'error');
            return false;
        }
        
        const totalCost = price * quantity;
        
        // Check if player has enough money
        if (!this.game.spendMoney(totalCost)) {
            this.game.log(`Not enough money! Need $${totalCost}, have $${this.game.getMoney()}`, 'error');
            return false;
        }
        
        // Try to add to warehouse
        const actualQuantity = this.game.warehouse.addInputMaterial(materialName, quantity);
        
        if (actualQuantity < quantity) {
            // Refund for materials that couldn't be stored
            const refund = (quantity - actualQuantity) * price;
            this.game.earnMoney(refund);
            
            if (actualQuantity === 0) {
                this.game.log('Warehouse is full! No materials purchased.', 'error');
                return false;
            } else {
                this.game.log(`Warehouse full! Only bought ${actualQuantity} ${materialName} for $${actualQuantity * price}`, 'warning');
            }
        } else {
            this.game.log(`Bought ${quantity} ${materialName} for $${totalCost}`, 'success');
        }
        
        return true;
    }
    
    // Sell products
    sellProduct(productName, quantity) {
        const price = this.productPrices.get(productName);
        if (!price) {
            this.game.log(`Product "${productName}" cannot be sold!`, 'error');
            return false;
        }
        
        // Check if warehouse has enough products
        const availableQuantity = this.game.warehouse.getOutputProduct(productName);
        const actualQuantity = Math.min(quantity, availableQuantity);
        
        if (actualQuantity === 0) {
            this.game.log(`No ${productName} available to sell!`, 'error');
            return false;
        }
        
        // Remove from warehouse and earn money
        this.game.warehouse.removeOutputProduct(productName, actualQuantity);
        const totalEarned = price * actualQuantity;
        this.game.earnMoney(totalEarned);
        
        if (actualQuantity < quantity) {
            this.game.log(`Only sold ${actualQuantity} ${productName} for $${totalEarned} (not enough in stock)`, 'warning');
        } else {
            this.game.log(`Sold ${quantity} ${productName} for $${totalEarned}`, 'success');
        }
        
        return true;
    }
    
    // Get current prices
    getMaterialPrice(materialName) {
        return this.materialPrices.get(materialName) || 0;
    }
    
    getProductPrice(productName) {
        return this.productPrices.get(productName) || 0;
    }
    
    getAllMaterialPrices() {
        return new Map(this.materialPrices);
    }
    
    getAllProductPrices() {
        return new Map(this.productPrices);
    }
    
    // Price updates (market volatility)
    updatePrices() {
        this.priceUpdateCounter++;
        
        // Update material prices
        for (let [material, basePrice] of this.materialPrices.entries()) {
            const variation = (Math.random() - 0.5) * 2 * this.priceVolatility;
            const newPrice = Math.max(1, Math.round(basePrice * (1 + variation)));
            this.materialPrices.set(material, newPrice);
        }
        
        // Update product prices
        for (let [product, basePrice] of this.productPrices.entries()) {
            const variation = (Math.random() - 0.5) * 2 * this.priceVolatility;
            const newPrice = Math.max(1, Math.round(basePrice * (1 + variation)));
            this.productPrices.set(product, newPrice);
        }
        
        this.game.log('Market prices updated!', 'info');
    }
    
    // Bulk operations
    buyMaterialBulk(materialName, maxCost) {
        const price = this.getMaterialPrice(materialName);
        if (!price) return false;
        
        const maxQuantity = Math.floor(maxCost / price);
        const availableSpace = this.game.warehouse.getInputAvailableSpace();
        const actualQuantity = Math.min(maxQuantity, availableSpace);
        
        if (actualQuantity > 0) {
            return this.buyMaterial(materialName, actualQuantity);
        }
        return false;
    }
    
    sellProductAll(productName) {
        const availableQuantity = this.game.warehouse.getOutputProduct(productName);
        if (availableQuantity > 0) {
            return this.sellProduct(productName, availableQuantity);
        }
        return false;
    }
    
    // Market analysis
    getProfitMargin(productName, materials) {
        const sellPrice = this.getProductPrice(productName);
        let materialCost = 0;
        
        for (let [material, quantity] of materials.entries()) {
            materialCost += this.getMaterialPrice(material) * quantity;
        }
        
        return sellPrice - materialCost;
    }
    
    getMostProfitableProducts() {
        // This would require production recipes, which will be defined in production.js
        // For now, return products sorted by price
        return Array.from(this.productPrices.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([name, price]) => ({ name, price }));
    }
    
    getCheapestMaterials() {
        return Array.from(this.materialPrices.entries())
            .sort((a, b) => a[1] - b[1])
            .map(([name, price]) => ({ name, price }));
    }
    
    // Transaction history (could be expanded)
    getMarketSummary() {
        return {
            materials: {
                count: this.materialPrices.size,
                avgPrice: Array.from(this.materialPrices.values()).reduce((a, b) => a + b, 0) / this.materialPrices.size,
                cheapest: this.getCheapestMaterials()[0],
                mostExpensive: this.getCheapestMaterials().slice(-1)[0]
            },
            products: {
                count: this.productPrices.size,
                avgPrice: Array.from(this.productPrices.values()).reduce((a, b) => a + b, 0) / this.productPrices.size,
                cheapest: this.getMostProfitableProducts().slice(-1)[0],
                mostExpensive: this.getMostProfitableProducts()[0]
            },
            priceUpdates: this.priceUpdateCounter
        };
    }
    
    // Save/Load functionality
    getSaveData() {
        return {
            materialPrices: Object.fromEntries(this.materialPrices),
            productPrices: Object.fromEntries(this.productPrices),
            priceUpdateCounter: this.priceUpdateCounter
        };
    }
    
    loadSaveData(data) {
        if (data.materialPrices) {
            // Merge saved prices with default prices to ensure new materials are included
            const savedMaterialPrices = new Map(Object.entries(data.materialPrices));
            for (let [material, price] of savedMaterialPrices.entries()) {
                if (this.materialPrices.has(material)) {
                    this.materialPrices.set(material, price);
                }
            }
        }
        
        if (data.productPrices) {
            // Merge saved prices with default prices to ensure new products are included
            const savedProductPrices = new Map(Object.entries(data.productPrices));
            for (let [product, price] of savedProductPrices.entries()) {
                if (this.productPrices.has(product)) {
                    this.productPrices.set(product, price);
                }
            }
        }
        
        this.priceUpdateCounter = data.priceUpdateCounter || 0;
    }
}