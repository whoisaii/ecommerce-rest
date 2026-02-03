package com.ecommerce.ecommerce.controller;

import com.ecommerce.ecommerce.model.Product;
import com.ecommerce.ecommerce.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    // GET http://localhost:8080/products
    @GetMapping
    public List<Product> getAllProducts() {
        return repository.getAllProducts();
    }

    // POST http://localhost:8080/products
    @PostMapping
    public void addProduct(@RequestBody Product product) {
        repository.addProduct(product);
    }

    // DELETE http://localhost:8080/products/5
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable int id) {
        repository.deleteProduct(id);
    }
}
