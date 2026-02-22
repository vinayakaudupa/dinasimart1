const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// API Endpoints

app.get('/', (req, res) => {
    res.send('DinasiMart API is running');
});

// Get all categories
app.get('/api/categories', (req, res) => {
    const sql = "SELECT * FROM categories";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        })
    });
});

// Search items with autocomplete
app.get('/api/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({ data: [] });
    }
    const sql = `SELECT * FROM items WHERE name LIKE ? LIMIT 10`;
    db.all(sql, [`%${query}%`], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});


// Get shops that have a specific item, sorted by distance
app.get('/api/items/:id/shops', (req, res) => {
    const itemId = req.params.id;
    const sql = `
        SELECT s.*, si.price, si.stock 
        FROM shops s
        JOIN shop_items si ON s.id = si.shop_id
        WHERE si.item_id = ?
        ORDER BY s.distance ASC
    `;
    db.all(sql, [itemId], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Get related items (same category)
app.get('/api/items/:id/related', (req, res) => {
    const itemId = req.params.id;
    // First get the category of the item
    db.get("SELECT category_id FROM items WHERE id = ?", [itemId], (err, row) => {
        if (err || !row) {
            res.status(400).json({ "error": "Item not found" });
            return;
        }
        const categoryId = row.category_id;
        const sql = `SELECT * FROM items WHERE category_id = ? AND id != ? LIMIT 5`;
        db.all(sql, [categoryId, itemId], (err, rows) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({
                "message": "success",
                "data": rows
            });
        });
    });
});

// Add to Cart (Persistent)
app.post('/api/cart', (req, res) => {
    const { itemId, shopId, price, quantity } = req.body;

    // Check if item from SAME shop is already in cart
    db.get("SELECT * FROM cart_items WHERE item_id = ? AND shop_id = ?", [itemId, shopId], (err, row) => {
        if (row) {
            const newQuantity = row.quantity + quantity;
            db.run("UPDATE cart_items SET quantity = ? WHERE id = ?", [newQuantity, row.id], function (err) {
                if (err) return res.status(400).json({ "error": err.message });
                res.json({ "message": "updated", data: { itemId, quantity: newQuantity } });
            });
        } else {
            db.run("INSERT INTO cart_items (item_id, shop_id, price, quantity) VALUES (?, ?, ?, ?)", [itemId, shopId, price, quantity], function (err) {
                if (err) return res.status(400).json({ "error": err.message });
                res.json({ "message": "added", data: { itemId, quantity } });
            });
        }
    });
});

// Update Cart Quantity
app.post('/api/cart/update', (req, res) => {
    const { id, quantity } = req.body;
    if (quantity <= 0) {
        db.run("DELETE FROM cart_items WHERE id = ?", [id], function (err) {
            if (err) return res.status(400).json({ "error": err.message });
            res.json({ "message": "deleted", data: { id } });
        });
    } else {
        db.run("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, id], function (err) {
            if (err) return res.status(400).json({ "error": err.message });
            res.json({ "message": "updated", data: { id, quantity } });
        });
    }
});


// Clear Cart
app.post('/api/cart/clear', (req, res) => {
    db.run("DELETE FROM cart_items", [], function (err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "cleared" });
    });
});


// Get Cart
app.get('/api/cart', (req, res) => {
    const sql = `
        SELECT ci.id, ci.quantity, ci.price, ci.shop_id, i.name, i.image, s.name as shop_name
        FROM cart_items ci
        JOIN items i ON ci.item_id = i.id
        JOIN shops s ON ci.shop_id = s.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Get all items (for Home page display)
app.get('/api/items', (req, res) => {
    const sql = "SELECT * FROM items";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Get single item
app.get('/api/items/:id', (req, res) => {
    const sql = "SELECT * FROM items WHERE id = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
