const Product = require('../models/Product');

exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(6);
        res.json(products);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const { category, search } = req.query;

        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (search) {
            const searchConditions = [
                { name: { $regex: search, $options: 'i' } }
            ];
            const skuNumber = getValidSku(search);

            if (skuNumber) {
                searchConditions.push({ sku: skuNumber });
            }

            filter.$or = searchConditions;
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            sku,
            category,
            description,
            price,
            stock,
            imageUrl,
            isFeatured
        } = req.body;

        if (!name || !category || price === undefined || sku === undefined || sku === '') {
            return res.status(400).json({ msg: 'SKU, name, category and price are required' });
        }

        const skuNumber = getValidSku(sku);

        if (!skuNumber) {
            return res.status(400).json({ msg: 'SKU must be a number from 001 to 999' });
        }

        const existingProduct = await Product.findOne({ sku: skuNumber });

        if (existingProduct) {
            return res.status(400).json({ msg: 'SKU already exists' });
        }

        const product = await Product.create({
            name,
            sku: skuNumber,
            category,
            description: description || '',
            price,
            stock: stock || 0,
            imageUrl: imageUrl || '',
            isFeatured: isFeatured || false
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const updates = { ...req.body };

        if (updates.sku !== undefined) {
            const skuNumber = getValidSku(updates.sku);

            if (!skuNumber) {
                return res.status(400).json({ msg: 'SKU must be a number from 001 to 999' });
            }

            const existingProduct = await Product.findOne({
                sku: skuNumber,
                _id: { $ne: req.params.id }
            });

            if (existingProduct) {
                return res.status(400).json({ msg: 'SKU already exists' });
            }

            updates.sku = skuNumber;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

function getValidSku(value) {
    const skuText = String(value || '').trim();

    if (!/^\d{1,3}$/.test(skuText)) {
        return null;
    }

    const sku = Number(skuText);

    if (!Number.isInteger(sku) || sku < 1 || sku > 999) {
        return null;
    }

    return sku;
}

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.json({ msg: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
