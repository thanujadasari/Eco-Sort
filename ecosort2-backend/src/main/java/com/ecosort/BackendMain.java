package com.ecosort;

import com.sun.net.httpserver.*;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public class BackendMain {
    private static final Gson GSON = new Gson();

    public static void main(String[] args) throws Exception {
        // Initialize database
        try {
            Database.init();
            System.out.println("Database initialized");
        } catch (Exception e) {
            System.err.println("Database init error: " + e.getMessage());
        }

        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // Define endpoints
        server.createContext("/api/status", wrap(new StatusHandler()));
        server.createContext("/api/register", wrap(new RegisterHandler()));
        server.createContext("/api/login", wrap(new LoginHandler()));
        server.createContext("/api/classify", wrap(new ClassifyHandler()));
        server.createContext("/api/saveResult", wrap(new SaveResultHandler()));
        server.createContext("/api/getHistory", wrap(new GetHistoryHandler()));

        server.setExecutor(null);
        server.start();
        System.out.println("✅ EcoSort Backend running on http://localhost:" + port);
    }

    // Wrapper for CORS
    private static HttpHandler wrap(HttpHandler inner) {
        return exchange -> {
            Headers respH = exchange.getResponseHeaders();
            respH.add("Access-Control-Allow-Origin", "*");
            respH.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
            respH.add("Access-Control-Allow-Headers", "Content-Type,Authorization");
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                exchange.close();
                return;
            }
            inner.handle(exchange);
        };
    }

    // Status endpoint
    static class StatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange ex) throws IOException {
            Map<String, String> m = new HashMap<>();
            m.put("status", "Backend active");
            m.put("version", "1.0");
            sendJson(ex, 200, GSON.toJson(m));
        }
    }

    // Register user
    static class RegisterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange ex) throws IOException {
            try (InputStreamReader isr = new InputStreamReader(ex.getRequestBody(), StandardCharsets.UTF_8)) {
                JsonObject body = JsonParser.parseReader(isr).getAsJsonObject();
                String name = body.get("name").getAsString();
                String email = body.get("email").getAsString();
                String password = body.get("password").getAsString();
                String hash = PasswordUtil.hash(password);

                Database.createUser(name, email, hash);

                JsonObject out = new JsonObject();
                out.addProperty("message", "User registered successfully");
                out.addProperty("name", name);
                out.addProperty("email", email);
                sendJson(ex, 201, out.toString());
            } catch (Exception e) {
                sendJson(ex, 500, "{\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    // Login user
    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange ex) throws IOException {
            try (InputStreamReader isr = new InputStreamReader(ex.getRequestBody(), StandardCharsets.UTF_8)) {
                JsonObject body = JsonParser.parseReader(isr).getAsJsonObject();
                String email = body.get("email").getAsString();
                String password = body.get("password").getAsString();

                ResultSet rs = Database.findUserByEmail(email);
                if (rs == null || !rs.next()) {
                    sendJson(ex, 401, "{\"error\":\"Invalid credentials\"}");
                    return;
                }

                String stored = rs.getString("password_hash");
                if (!PasswordUtil.verify(password, stored)) {
                    sendJson(ex, 401, "{\"error\":\"Invalid credentials\"}");
                    rs.close();
                    return;
                }

                JsonObject out = new JsonObject();
                out.addProperty("id", rs.getInt("id"));
                out.addProperty("name", rs.getString("name"));
                out.addProperty("email", rs.getString("email"));
                rs.close();

                sendJson(ex, 200, out.toString());
            } catch (Exception e) {
                sendJson(ex, 500, "{\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    // Classify endpoint (demo)
    static class ClassifyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange ex) throws IOException {
            try (InputStreamReader isr = new InputStreamReader(ex.getRequestBody(), StandardCharsets.UTF_8)) {
                JsonObject body = JsonParser.parseReader(isr).getAsJsonObject();
                String demo = "[{\"itemName\":\"Plastic Bottle\",\"wasteType\":\"Non-Biodegradable\",\"recyclingInfo\":\"Rinse and recycle\",\"composition\":[{\"name\":\"Plastic\",\"value\":90},{\"name\":\"Label\",\"value\":10}]}]";
                sendJson(ex, 200, demo);
            } catch (Exception e) {
                sendJson(ex, 500, "{\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    // Save classification result
    static class SaveResultHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange ex) throws IOException {
            try (InputStreamReader isr = new InputStreamReader(ex.getRequestBody(), StandardCharsets.UTF_8)) {
                JsonObject body = JsonParser.parseReader(isr).getAsJsonObject();
                int userId = body.get("userId").getAsInt();
                String resultJson = body.get("resultJson").getAsString();

                Database.saveResult(userId, "Unknown", resultJson);

                JsonObject out = new JsonObject();
                out.addProperty("message", "Result saved successfully");
                sendJson(ex, 201, out.toString());
            } catch (Exception e) {
                sendJson(ex, 500, "{\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    // Get history for a user
    static class GetHistoryHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange ex) throws IOException {
            try {
                String q = ex.getRequestURI().getQuery();
                Map<String, String> params = parseQuery(q);
                if (!params.containsKey("userId")) {
                    sendJson(ex, 400, "{\"error\":\"userId required\"}");
                    return;
                }
                int userId = Integer.parseInt(params.get("userId"));
                String json = Database.getHistoryJson(userId);
                sendJson(ex, 200, json);
            } catch (Exception e) {
                sendJson(ex, 500, "{\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    // Helper: send JSON response
    private static void sendJson(HttpExchange ex, int code, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        ex.sendResponseHeaders(code, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    // Helper: parse query params
    private static Map<String, String> parseQuery(String q) {
        Map<String, String> out = new HashMap<>();
        if (q == null || q.isEmpty()) return out;
        for (String part : q.split("&")) {
            String[] kv = part.split("=", 2);
            if (kv.length == 2) out.put(kv[0], kv[1]);
        }
        return out;
    }
}
