package com.symphony.c9proxy.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.symphony.c9proxy.c9.C9Button;
import com.symphony.c9proxy.c9.C9ManagementAPI;
import com.symphony.c9proxy.c9.C9User;
import com.symphony.c9proxy.sbe.SBEUser;
import com.symphony.c9proxy.sbe.SBEUserAPI;

@RestController()
public class ManagementAPI {
    @Autowired
    private C9ManagementAPI c9Api;

    @Autowired
    private SBEUserAPI sbeApi;

    @GetMapping("/user")
    public C9User getUser(@RequestHeader("x-symphony-csrf-token") String csrfToken,
        @RequestHeader("cookie") List<String> cookies) {
        SBEUser sbeUser = sbeApi.getUser(csrfToken, cookies);
        return c9Api.getUserByEmail(sbeUser.getEmailAddress());
    }

    @GetMapping("/buttons")
    public List<C9Button> getButtons(@RequestHeader("x-symphony-csrf-token") String csrfToken,
        @RequestHeader("cookie") List<String> cookies) {
        SBEUser sbeUser = sbeApi.getUser(csrfToken, cookies);
        C9User c9User = c9Api.getUserByEmail(sbeUser.getEmailAddress());
        return c9Api.getButtons(c9User.getUserId());
    }
}
