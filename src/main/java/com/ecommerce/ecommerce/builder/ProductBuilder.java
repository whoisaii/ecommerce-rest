package com.ecommerce.ecommerce.builder;
import com.ecommerce.ecommerce.model.Product;
public class ProductBuilder {
    private int id;
    private String name;
    private double price;

    public ProductBuilder id(int id) {
        this.id = id;
        return this;
    }
    public ProductBuilder name(String name) {
        this.name = name;
        return this;
    }
    public ProductBuilder price(double price) {
        this.price = price;
        return this;
    }
    public Product build() {
        return new Product(id, name, price);
    }
}
