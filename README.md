# Factory Simulator

> **🤖 Coding Agent Proof of Concept**  
> This project was created as a demonstration of automated software development using GitHub Copilot's coding agent capabilities. The entire game, including all features, UI components, game mechanics, and documentation, was built through natural language conversations with an AI coding assistant. This showcases how coding agents can create complete, functional applications from user requirements without traditional manual programming.

A single-player web-based factory simulation game where you manage resources, production, and sales to build your industrial empire.

## How to Play

1. **Open the game** - Simply open `index.html` in a modern web browser
2. **Start with materials** - Use your starting $1000 to buy raw materials from the marketplace
3. **Set up production** - Purchase machines and start manufacturing products
4. **Sell products** - Sell your manufactured goods for profit
5. **Expand** - Use profits to expand warehouse capacity and production capabilities

## Game Features

### Warehouse System
- **Input Materials Storage** - Store raw materials with finite capacity
- **Output Products Storage** - Store manufactured products
- **Capacity Management** - Monitor storage levels and expand when needed

### Marketplace
- **Buy Materials** - Purchase raw materials at market prices
- **Sell Products** - Sell manufactured goods for profit
- **Dynamic Pricing** - Prices fluctuate over time for realistic market simulation

### Production Hall
- **Multiple Machine Types**:
  - **Smelter** - Process ore into ingots and bars
  - **Workbench** - Craft wood and stone products
  - **Wire Mill** - Create copper wire
- **Production Recipes** - Each machine can produce different items
- **Time-based Production** - Products take time to manufacture
- **Automatic Processing** - Materials and products are handled automatically

### Game Progression
- **Money Management** - Track profits and expenses
- **Capacity Expansion** - Grow your factory over time
- **Day/Night Cycle** - Time progresses as you play
- **Auto-save** - Game saves automatically every 30 seconds

## Controls

### Navigation
- **Warehouse Status** - View current inventory and capacity
- **Marketplace** - Buy materials and sell products
- **Production Hall** - Manage machines and production
- **Expansion** - Upgrade factory capacity

### Basic Actions
- Buy materials in quantities of 1 or 10
- Sell products individually or all at once
- Purchase new machines when you have available slots
- Start production by selecting recipes
- Collect completed products
- Expand capacity when warehouses get full

## Starting Strategy

1. **Buy basic materials** - Start with Iron Ore, Coal, and Wood
2. **Purchase a Smelter** - Create Iron Ingots from your materials
3. **Sell Iron Ingots** - Generate profit from your first production
4. **Expand operations** - Buy more machines and materials
5. **Monitor capacity** - Expand warehouses before they fill up

## Technical Details

- **No external dependencies** - Runs entirely in the browser
- **Local Storage** - Game saves to browser's local storage
- **Responsive Design** - Works on desktop and mobile devices
- **Modern JavaScript** - Uses ES6+ modules and features

## Game Files

- `index.html` - Main game interface
- `styles.css` - Game styling and layout
- `js/game.js` - Main game controller and initialization
- `js/warehouse.js` - Warehouse and inventory management
- `js/marketplace.js` - Buying and selling system
- `js/production.js` - Manufacturing and machine management
- `js/ui.js` - User interface and display updates

## Future Enhancements

The game is designed to be easily expandable with:
- Additional machine types and recipes
- More complex production chains
- Graphics and animations
- Sound effects
- Advanced market mechanics
- Research and technology upgrades

---

**Enjoy building your factory empire!**