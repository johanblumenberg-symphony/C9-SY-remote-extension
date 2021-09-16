package com.symphony.c9proxy.c9mgmt;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.symphony.c9proxy.api.RestAPI;

import lombok.Data;

@Component
public class C9ManagementAPI {
    private final Logger logger = LoggerFactory.getLogger(C9ManagementAPI.class);
    private final RestTemplate api;
    private final Mac HMAC;
    private static final ThreadLocal<DateFormat> DATE_HEADER_FORMAT = new ThreadLocal<DateFormat>() {
        @Override
        protected DateFormat initialValue() {
            DateFormat format = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'", Locale.US);
            format.setTimeZone(TimeZone.getTimeZone("GMT"));
            return format;
        }
    };

    public C9ManagementAPI(C9ManagementConfig config, RestTemplateBuilder restTemplateBuilder)
        throws NoSuchAlgorithmException, InvalidKeyException {
        this.HMAC = Mac.getInstance("HmacSHA512");
        this.HMAC.init(new SecretKeySpec(config.apiSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));

        this.api = restTemplateBuilder.rootUri(config.apiRoot)
            .additionalInterceptors(new ClientHttpRequestInterceptor() {
                @Override
                public ClientHttpResponse intercept(HttpRequest request, byte[] body,
                    ClientHttpRequestExecution execution) throws IOException {
                    String date = DATE_HEADER_FORMAT.get().format(new Date());
                    String nonce = UUID.randomUUID().toString();

                    String message = String.join("\n",
                        Arrays.asList(
                            request.getMethod().toString(),
                            request.getURI().getScheme(),
                            request.getURI().getHost() + ":" + request.getURI().getPort(),
                            request.getURI().getPath(),
                            request.getHeaders().getContentType().toString(),
                            config.apiKey,
                            nonce,
                            date,
                            new String(body, StandardCharsets.UTF_8),
                            ""));

                    String signature = Base64.getEncoder()
                        .encodeToString(HMAC.doFinal(message.getBytes(StandardCharsets.UTF_8)));

                    request.getHeaders().set("Date", date);
                    request.getHeaders().set("Authorization",
                        String.format("HmacSHA512 %s:%s:%s", config.apiKey, nonce, signature));

                    return execution.execute(request, body);
                }
            }).build();
        this.api.setRequestFactory(new HttpComponentsClientHttpRequestFactory());
    }

    @Data
    private static class UsersResponse {
        private String version;
        private int totalUsers;
        private List<C9User> users;
    }

    public C9User getUserByEmail(String email) {
        try {
            UsersResponse response = api.postForObject("/users", Map.of("emails", List.of(email)), UsersResponse.class);

            if (response.users == null) {
                throw new RuntimeException("Null users recevied when accessing /users");
            } else if (response.users.size() == 1) {
                return response.users.get(0);
            } else if (response.users.isEmpty()) {
                logger.warn("No results returned when accessing /users");
                throw new RestAPI.NotFound();
            } else {
                logger.warn("Too many results returned when accessing /users");
                throw new RestAPI.NotFound();
            }
        } catch (HttpClientErrorException.Unauthorized e) {
            logger.warn("Unauthorized access to /users: " + e.getMessage());
            throw new RestAPI.Unauthorized();
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Not found accessing /users: " + e.getMessage());
            throw new RestAPI.NotFound();
        }
    }

    @Data
    private static class ButtonsResponse {
        private String version;
        private List<C9Button> buttons;
    }

    public List<C9Button> getButtons(int userId) {
        try {
            ButtonsResponse response = api.postForObject("/users/{userId}/buttons", Map.of(), ButtonsResponse.class, userId);
            return response.getButtons();
        } catch (HttpClientErrorException.Unauthorized e) {
            logger.warn("Unauthorized access to /users/{userId}/buttons: " + e.getMessage());
            throw new RestAPI.Unauthorized();
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Not found accessing /users/{userId}/buttons: " + e.getMessage());
            throw new RestAPI.NotFound();
        }
    }

    public Object getRawUser(int userId) {
        try {
            return api.postForObject("/users", Map.of("userIds", List.of(userId)), Object.class);
        } catch (HttpClientErrorException.Unauthorized e) {
            logger.warn("Unauthorized access to /users: " + e.getMessage());
            throw new RestAPI.Unauthorized();
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Not found accessing /users: " + e.getMessage());
            throw new RestAPI.NotFound();
        }
    }

    public Object getRawUserByEmail(String email) {
        try {
            return api.postForObject("/users", Map.of("emails", List.of(email)), Object.class);
        } catch (HttpClientErrorException.Unauthorized e) {
            logger.warn("Unauthorized access to /users: " + e.getMessage());
            throw new RestAPI.Unauthorized();
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Not found accessing /users: " + e.getMessage());
            throw new RestAPI.NotFound();
        }
    }

    public Object getRawButtons(int userId) {
        try {
            return api.postForObject("/users/{userId}/buttons", Map.of(), Object.class, userId);
        } catch (HttpClientErrorException.Unauthorized e) {
            logger.warn("Unauthorized access to /users/{userId}/buttons: " + e.getMessage());
            throw new RestAPI.Unauthorized();
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Not found accessing /users/{userId}/buttons: " + e.getMessage());
            throw new RestAPI.NotFound();
        }
    }
    
    public Object getRawConnectionsForGroup(int groupId) {
        try {
            return api.postForObject("/connections", Map.of("groupId", groupId), Object.class);
        } catch (HttpClientErrorException.Unauthorized e) {
            logger.warn("Unauthorized access to /connections: " + e.getMessage());
            throw new RestAPI.Unauthorized();
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Not found accessing /connections: " + e.getMessage());
            throw new RestAPI.NotFound();
        }        
    }

    public Object getRawConnections(List<String> connectionNumbers) {
        try {
            return api.postForObject("/connections", Map.of("connectionNumbers", connectionNumbers), Object.class);
        } catch (HttpClientErrorException.Unauthorized e) {
            logger.warn("Unauthorized access to /connections: " + e.getMessage());
            throw new RestAPI.Unauthorized();
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Not found accessing /connections: " + e.getMessage());
            throw new RestAPI.NotFound();
        }        
    }
}
