package com.ecommerce.ecommerce.service.impl;
import com.ecommerce.ecommerce.model.Product;
import com.ecommerce.ecommerce.repository.ProductRepository;
import com.ecommerce.ecommerce.service.ProductService;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repository = new ProductRepository();
    @Override
    public void add(Product product) {
        repository.add(product);
    }
    @Override
    public List<Product> getAll() {
        return repository.getAll();
    }
    @Override
    public void update(int id, Product product) {
        repository.update(id, product);
    }
    @Override
    public void delete(int id) {
        repository.delete(id);
    }

}
