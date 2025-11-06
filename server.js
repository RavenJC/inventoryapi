const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Use environment variable for MongoDB
const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL)
  .then(() => console.log('✓ Connected to Database'))
  .catch(err => console.error('✗ Database Error:', err));

// Schema/model
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

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ success: true, message: 'Product created!', data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct)
      return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated!', data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted!', data: deletedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Filters
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
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/products/filter/instock', async (req, res) => {
  try {
    const products = await Product.find({ quantity: { $gt: 0 } });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/products/filter/outofstock', async (req, res) => {
  try {
    const products = await Product.find({ quantity: 0 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Correct Render port handling
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});
