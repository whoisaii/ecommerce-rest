package com.ecommerce.ecommerce.factory;

import com.ecommerce.ecommerce.model.Product;

public class ProductFactory {
    public static Product createDefaultProduct() {
        return new Product(0, "Default product", 0.0);
    }
}
