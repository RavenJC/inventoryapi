
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

//mongodb
const DB_URL = 'mongodb+srv://Raven:12345@cluster0.b3fmzcz.mongodb.net/Climaco?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(DB_URL)
    .then(() => console.log('✓ Connected to Database'))
    .catch(err => console.log('✗ Database Error:', err));
//schema/model
const productSchema = new mongoose.Schema({
    sku: String,
    name: String,
    category: String,
    quantity: Number,
    unitPrice: Number,
    expiry: Date,
    active: Boolean
});

const Product = mongoose.model('Product', productSchema);


//get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

//product by id
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

//create product
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product({
            sku: req.body.sku,
            name: req.body.name,
            category: req.body.category,
            quantity: req.body.quantity,
            unitPrice: req.body.unitPrice,
            expiry: req.body.expiry,
            active: req.body.active
        });
        
        await newProduct.save();
        
        res.status(201).json({
            success: true,
            message: 'Product created!',
            data: newProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

//update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                sku: req.body.sku,
                name: req.body.name,
                category: req.body.category,
                quantity: req.body.quantity,
                unitPrice: req.body.unitPrice,
                expiry: req.body.expiry,
                active: req.body.active
            },
            { new: true } // Return the updated product
        );
        
        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Product updated!',
            data: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

//delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Product deleted!',
            data: deletedProduct
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

//search products
app.get('/api/products/search/:keyword', async (req, res) => {
    try {
        const keyword = req.params.keyword;
        
        const products = await Product.find({
            $or: [
                { sku: { $regex: keyword, $options: 'i' } },
                { name: { $regex: keyword, $options: 'i' } },
                { category: { $regex: keyword, $options: 'i' } }
            ]
        });
        
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

//in stock filter
app.get('/api/products/filter/instock', async (req, res) => {
    try {
        const products = await Product.find({ quantity: { $gt: 0 } });
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
//out of stock filter

app.get('/api/products/filter/outofstock', async (req, res) => {
    try {
        const products = await Product.find({ quantity: 0 });
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


//server start
const PORT = 3000;
app.listen(PORT, () => {
    console.log(' Server is running!');
    console.log(' http://localhost:' + PORT);
});