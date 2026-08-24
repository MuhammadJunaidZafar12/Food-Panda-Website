import Restaurant from "../models/restaurant.model.js";

import {
    createProductService,
    getAllProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService,
} from "../services/product.service.js";
import { deleteImageFromCloudinary } from "../utils/cloudinaryHelper.js";


// ==========================================
// Create Product
// ==========================================

export const createProduct = async (req, res, next) => {
    try {
        const { restaurant } = req.body;

        if (!restaurant) {
            return res.status(400).json({
                success: false,
                message: "Restaurant is required.",
            });
        }

        // Find restaurant
        const restaurantData = await Restaurant.findById(
            restaurant
        );

        if (!restaurantData) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found.",
            });
        }

        // Check ownership
        if (
            restaurantData.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to add products to this restaurant.",
            });
        }

        const productData = {
            ...req.body,
            restaurant,
            image: req.file?.path || "",
        };

        const product =
            await createProductService(productData);

        res.status(201).json({
            success: true,
            message: "Product created successfully.",
            product,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// Get All Products
// ==========================================

export const getAllProducts = async (req, res, next) => {
    try {
        const { restaurant } = req.query;

        const products =
            await getAllProductsService(restaurant);

        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// Get Product By ID
// ==========================================

export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product =
            await getProductByIdService(id);

        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// Update Product
// ==========================================

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find product
        const product =
            await getProductByIdService(id);

        // Check restaurant ownership
        const restaurant =
            await Restaurant.findById(product.restaurant?._id || product.restaurant);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found.",
            });
        }

        if (
            restaurant.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to update this product.",
            });
        }

        const productData = {
            ...req.body,
        };

        // Only update image if new image uploaded
        if (req.file?.path) {
            productData.image = req.file.path;
            if (product.image) {
                await deleteImageFromCloudinary(product.image);
            }
        }

        const updatedProduct =
            await updateProductService(
                id,
                productData
            );

        res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            product: updatedProduct,
        });
    } catch (error) {
        next(error);
    }
};


// ==========================================
// Delete Product
// ==========================================

export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Find product
        const product =
            await getProductByIdService(id);
        // Find restaurant
        const restaurant =
            await Restaurant.findById(product.restaurant?._id || product.restaurant);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found.",
            });
        }
        // Check ownership
        if (
            restaurant.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not allowed to delete this product.",
            });
        }

        await deleteProductService(id);

        if (product.image) {
            await deleteImageFromCloudinary(product.image);
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};