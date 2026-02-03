package com.ecommerce.ecommerce.repository;

import com.ecommerce.ecommerce.model.Product;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ProductRepository {

    private final String URL = "jdbc:postgresql://localhost:5432/ecommerce";
    private final String USER = "postgres";
    private final String PASSWORD = "1234";

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    // GET ALL
    public List<Product> getAllProducts() {
        List<Product> products = new ArrayList<>();
        String sql = "SELECT * FROM products";

        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                products.add(new Product(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getDouble("price")
                ));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return products;
    }

    // ADD
    public void addProduct(Product product) {
        String sql = "INSERT INTO products (id, name, price) VALUES (?, ?, ?)";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, product.getId());
            ps.setString(2, product.getName());
            ps.setDouble(3, product.getPrice());
            ps.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // DELETE
    public void deleteProduct(int id) {
        String sql = "DELETE FROM products WHERE id=?";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
   //UPDATE
   public void updateProduct(int id) {
       String sql = " UPDATE products SET name = ?, price = ? WHERE id = ?";

       try (Connection conn = getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)) {

           ps.setDouble(2,price);
           ps.setInt(3, id);
           ps.executeUpdate();

       } catch (SQLException e) {
           e.printStackTrace();
       }
   }
}
