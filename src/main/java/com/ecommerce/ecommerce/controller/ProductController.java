package com.ecommerce.ecommerce.controller;
import com.ecommerce.ecommerce.model.Product;
import com.ecommerce.ecommerce.service.ProductService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }
    @GetMapping
    public List<Product> getAll() {
        return service.getAll();
    }

    @PostMapping
    public void add(@RequestBody Product product) {
        service.add(product);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable int id,
                       @RequestBody Product product) {
        service.update(id, product);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }

}
