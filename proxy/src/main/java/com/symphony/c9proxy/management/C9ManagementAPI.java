package com.symphony.c9proxy.management;

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
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import lombok.Data;

@Component
public class C9ManagementAPI {
    private final Logger logger = LoggerFactory.getLogger(ManagementAPI.class);
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

    @Data
    private static class UsersResponse {
        private String version;
    }

    public C9ManagementAPI(C9Config config, RestTemplateBuilder restTemplateBuilder)
        throws NoSuchAlgorithmException, InvalidKeyException {
        this.HMAC = Mac.getInstance("HmacSHA512");
        this.HMAC.init(new SecretKeySpec(config.apiSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));

        this.api = restTemplateBuilder.rootUri("https://managementapi.prod1.xhoot.com:443/external/apis")
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

    @ExceptionHandler(HttpClientErrorException.class)
    private void handleException(HttpServletResponse response, HttpClientErrorException e) throws IOException {
        if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
            logger.warn(e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        } else {
            logger.error(e.getMessage());
            throw e;
        }
    }

    public String getUser(String email) {
        api.postForObject("/users", Map.of("emails", List.of(email)), UsersResponse.class);
        return "Yes!";
    }
}
