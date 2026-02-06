package com.ecommerce.ecommerce.service;

import com.ecommerce.ecommerce.model.Product;
import java.util.List;

public interface ProductService {
    void add(Product product);
    List<Product> getAll();
    void update(int id, Product product);
    void delete(int id);
}
