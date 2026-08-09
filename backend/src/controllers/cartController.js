const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getMyCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });
        }

        const requestedQuantity = quantity || 1;

        if (requestedQuantity < 1) {
            return res.status(400).json({ msg: 'Quantity must be at least 1' });
        }

        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        const nextQuantity = existingItem
            ? existingItem.quantity + requestedQuantity
            : requestedQuantity;

        if (nextQuantity > product.stock) {
            return res.status(400).json({ msg: `Only ${product.stock} item(s) available for ${product.name}` });
        }

        if (existingItem) {
            existingItem.quantity = nextQuantity;
        } else {
            cart.items.push({
                product: productId,
                quantity: requestedQuantity
            });
        }

        await cart.save();

        const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ msg: 'Cart not found' });
        }

        const item = cart.items.find(
            item => item.product.toString() === req.params.productId
        );

        if (!item) {
            return res.status(404).json({ msg: 'Cart item not found' });
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(
                item => item.product.toString() !== req.params.productId
            );
        } else {
            const product = await Product.findById(req.params.productId);

            if (!product) {
                return res.status(404).json({ msg: 'Product not found' });
            }

            if (quantity > product.stock) {
                return res.status(400).json({ msg: `Only ${product.stock} item(s) available for ${product.name}` });
            }

            item.quantity = quantity;
        }

        await cart.save();

        const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.removeCartItem = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({ msg: 'Cart not found' });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== req.params.productId
        );

        await cart.save();

        const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
