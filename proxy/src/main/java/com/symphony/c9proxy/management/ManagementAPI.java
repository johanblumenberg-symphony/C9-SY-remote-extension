package com.symphony.c9proxy.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ManagementAPI {
    @Autowired
    private C9ManagementAPI api;
    
    @GetMapping("/users")
    public String getUser() {
        return api.getUser("johan.blumenberg@symphony.com");
    }
}
