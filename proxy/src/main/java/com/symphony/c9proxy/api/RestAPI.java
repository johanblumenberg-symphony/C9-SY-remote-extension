package com.symphony.c9proxy.api;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

public class RestAPI {

    public static class Unauthorized extends RuntimeException {
        private static final long serialVersionUID = 1L;

        public Unauthorized() {
            super("Unauthorized");
        }
    }

    public static class NotFound extends RuntimeException {
        private static final long serialVersionUID = 1L;

        public NotFound() {
            super("NotFound");
        }
    }

    @ControllerAdvice
    public static class GlobalExceptionHandler {
        @ExceptionHandler(Unauthorized.class)
        public void resourceUnauthorized(HttpServletResponse response, Unauthorized e) throws IOException {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        }

        @ExceptionHandler(NotFound.class)
        public void resourceNotFound(HttpServletResponse response, NotFound e) throws IOException {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }
}
