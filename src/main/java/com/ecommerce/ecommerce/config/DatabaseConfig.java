package com.ecommerce.ecommerce.config;
import java.sql.Connection;
import java.sql.DriverManager;

public class DatabaseConfig {
    public static Connection getConnection() throws Exception {
        return DriverManager.getConnection(
                "jdbc:postgresql://localhost:5432/ecommerce",
                "postgres",
                "1234"
        );
    }
}
