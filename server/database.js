const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DBSOURCE = path.join(__dirname, "db.sqlite");

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // Categories
        db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE
        )`);

        // Items
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            category_id INTEGER,
            image TEXT,
            FOREIGN KEY(category_id) REFERENCES categories(id)
        )`);

        // Shops - Added distance
        db.run(`CREATE TABLE IF NOT EXISTS shops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            distance REAL
        )`);

        // Shop Items (Availability)
        db.run(`CREATE TABLE IF NOT EXISTS shop_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_id INTEGER,
            item_id INTEGER,
            price REAL,
            stock INTEGER,
            FOREIGN KEY(shop_id) REFERENCES shops(id),
            FOREIGN KEY(item_id) REFERENCES items(id)
        )`);

        // Cart - Added shop_id and price snapshot
        db.run(`CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER,
            shop_id INTEGER,
            quantity INTEGER,
            price REAL,
            FOREIGN KEY(item_id) REFERENCES items(id),
            FOREIGN KEY(shop_id) REFERENCES shops(id)
        )`);

        // Seed data if empty
        db.get("SELECT count(*) as count FROM categories", [], (err, row) => {
            if (row.count === 0) {
                seedData();
            }
        });
    });
}

function seedData() {
    console.log("Seeding data...");
    const categories = [
        "Vegetables", "Dairy", "Electronics", "Essentials", "Cosmetics",
        "Medicine", "Toys", "Clothing", "Fruits", "Sweets"
    ];

    const stmtCat = db.prepare("INSERT INTO categories (name) VALUES (?)");
    categories.forEach(cat => stmtCat.run(cat));
    stmtCat.finalize();

    // Generate Items with better images
    // Using loremflickr for realistic random images based on category keywords
    const itemsData = [
        // Vegetables
        { name: "Tomato", category: "Vegetables" }, { name: "Potato", category: "Vegetables" }, { name: "Onion", category: "Vegetables" },
        { name: "Carrot", category: "Vegetables" }, { name: "Spinach", category: "Vegetables" }, { name: "Capsicum", category: "Vegetables" },
        // Dairy
        { name: "Milk", category: "Dairy" }, { name: "Curd", category: "Dairy" }, { name: "Cheese", category: "Dairy" },
        { name: "Butter", category: "Dairy" }, { name: "Paneer", category: "Dairy" }, { name: "Yogurt", category: "Dairy" },
        // Electronics
        { name: "Headphones", category: "Electronics" }, { name: "Charger", category: "Electronics" }, { name: "Power Bank", category: "Electronics" },
        { name: "USB Cable", category: "Electronics" }, { name: "Mouse", category: "Electronics" },
        // Essentials
        { name: "Rice (5kg)", category: "Essentials" }, { name: "Washing Powder", category: "Essentials" }, { name: "Salt", category: "Essentials" },
        { name: "Sugar", category: "Essentials" }, { name: "Oil (1L)", category: "Essentials" },
        // Cosmetics
        { name: "Lipstick", category: "Cosmetics" }, { name: "Face Wash", category: "Cosmetics" }, { name: "Perfume", category: "Cosmetics" },
        { name: "Moisturizer", category: "Cosmetics" }, { name: "Shampoo", category: "Cosmetics" },
        // Medicine
        { name: "Paracetamol", category: "Medicine" }, { name: "Bandage", category: "Medicine" }, { name: "Cough Syrup", category: "Medicine" },
        { name: "Antiseptic", category: "Medicine" }, { name: "Vitamins", category: "Medicine" },
        // Toys
        { name: "Action Figure", category: "Toys" }, { name: "Lego Set", category: "Toys" }, { name: "Doll", category: "Toys" },
        { name: "Puzzle", category: "Toys" }, { name: "Toy Car", category: "Toys" },
        // Clothing
        { name: "T-Shirt", category: "Clothing" }, { name: "Jeans", category: "Clothing" }, { name: "Socks", category: "Clothing" },
        { name: "Cap", category: "Clothing" }, { name: "Shirt", category: "Clothing" },
        // Fruits
        { name: "Apple", category: "Fruits" }, { name: "Banana", category: "Fruits" }, { name: "Mango", category: "Fruits" },
        { name: "Grapes", category: "Fruits" }, { name: "Orange", category: "Fruits" },
        // Sweets
        { name: "Gulab Jamun", category: "Sweets" }, { name: "Rasgulla", category: "Sweets" }, { name: "Chocolate", category: "Sweets" },
        { name: "Ladoo", category: "Sweets" }, { name: "Cake", category: "Sweets" }
    ];


    db.serialize(() => {
        db.all("SELECT id, name FROM categories", [], (err, catRows) => {
            if (err) return;
            const catMap = {};
            catRows.forEach(r => catMap[r.name] = r.id);

            const stmtItem = db.prepare("INSERT INTO items (name, category_id, image) VALUES (?, ?, ?)");
            itemsData.forEach(item => {
                // Use random seed to get different images
                const imageUrl = `https://loremflickr.com/320/240/${item.category.toLowerCase().replace(' ', ',')},${item.name.split(' ')[0]}?random=${Math.random()}`;
                stmtItem.run(item.name, catMap[item.category], imageUrl);
            });
            stmtItem.finalize(() => {
                createShopsAndStock();
            });
        });
    });
}

function createShopsAndStock() {
    const shopNames = [
        "Sharma General Store", "Apna Bazaar", "Daily Fresh", "City Supermart", "Green Grocers",
        "Modi Care Shop", "Reliance Fresh Copy", "Quick Mart", "Corner Store", "Value Mart",
        "Best Price Shop", "Urban Needs", "Metro Mart", "Village Store", "Town Bazaar",
        "Sunrise Stores", "Moonlight Mart", "Star Groceries", "Galaxy Supermarket", "Universe Needs",
        "Planet Fresh", "Nature's Basket Copy", "Organic World", "Healthy Life", "Fit Food",
        "Tasty Treats", "Yummy Mart", "Delicious Deals", "Spicy Store", "Sweet Tooth Shop",
        "Gupta Provisions", "Singh Super Store", "Khan Market", "Reddy's Mart", "Patel Brothers",
        "Kumar Stores", "Rao's Daily Needs", "Mehta Market", "Jain General Store", "Agarwal Sweets & More",
        "Laxmi Stores", "Ganesh Mart", "Sai Baba Provisions", "Om Shanti Store", "Krishna Mart",
        "Radha Krishna Store", "Jai Hind Mart", "Bharat Bazaar", "Indian Roots", "Western Ways"
    ];

    const stmtShop = db.prepare("INSERT INTO shops (name, distance) VALUES (?, ?)");
    shopNames.forEach(name => {
        // Random distance between 0.1 and 8.0 km
        const distance = (Math.random() * 7.9 + 0.1).toFixed(1);
        stmtShop.run(name, distance);
    });

    stmtShop.finalize(() => {
        db.all("SELECT id FROM shops", [], (err, shopRows) => {
            if (err) return;
            db.all("SELECT id FROM items", [], (err, itemRows) => {
                if (err) return;

                const stmtShopItem = db.prepare("INSERT INTO shop_items (shop_id, item_id, price, stock) VALUES (?, ?, ?, ?)");

                shopRows.forEach(shop => {
                    itemRows.forEach(item => {
                        // 60% chance to have an item
                        if (Math.random() > 0.4) {
                            const price = (Math.random() * 200 + 20).toFixed(0);
                            // 20% chance to be Out of Stock
                            const stock = Math.random() > 0.2 ? Math.floor(Math.random() * 50) + 1 : 0;
                            stmtShopItem.run(shop.id, item.id, price, stock);
                        }
                    });
                });
                stmtShopItem.finalize(() => {
                    console.log("Seeding complete.");
                });
            });
        });
    });
}

module.exports = db;
