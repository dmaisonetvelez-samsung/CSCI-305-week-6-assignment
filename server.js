// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// --- CUSTOM MIDDLEWARE ---

/**
 * 1. Request Logging Middleware
 * Logs HTTP method, URL, timestamp, and body for POST/PUT
 */
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request Body:', req.body);
    }
    next();
};

app.use(requestLogger);

/**
 * 2. Input Validation Middleware
 * Uses express-validator to check rules defined in the README
 */
const validateMenuItem = [
    body('name').isString().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
    body('description').isString().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('price').isNumeric().isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
    body('category').isIn(['appetizer', 'entree', 'dessert', 'beverage']).withMessage('Invalid category'),
    body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
    body('available').optional().isBoolean().withMessage('Available must be a boolean'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// --- DATA ---

let menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// --- ROUTES ---

// GET /api/menu - Retrieve all menu items
app.get('/api/menu', (req, res) => {
    res.status(200).json(menuItems);
});

// GET /api/menu/:id - Retrieve a specific menu item by ID
app.get('/api/menu/:id', (req, res) => {
    const item = menuItems.find(m => m.id === parseInt(req.params.id));
    if (!item) {
        return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json(item);
});

// POST /api/menu - Add a new menu item
app.post('/api/menu', validateMenuItem, (req, res) => {
    const newItem = {
        id: menuItems.length > 0 ? Math.max(...menuItems.map(m => m.id)) + 1 : 1,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        ingredients: req.body.ingredients,
        available: req.body.available !== undefined ? req.body.available : true
    };

    menuItems.push(newItem);
    res.status(201).json(newItem);
});

// PUT /api/menu/:id - Update an existing menu item
app.put('/api/menu/:id', validateMenuItem, (req, res) => {
    const index = menuItems.findIndex(m => m.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({ message: "Menu item not found" });
    }

    const updatedItem = {
        id: parseInt(req.params.id),
        ...req.body
    };

    menuItems[index] = updatedItem;
    res.status(200).json(updatedItem);
});

// DELETE /api/menu/:id - Remove a menu item
app.delete('/api/menu/:id', (req, res) => {
    const index = menuItems.findIndex(m => m.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({ message: "Menu item not found" });
    }

    menuItems.splice(index, 1);
    res.status(200).json({ message: "Item deleted successfully" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
