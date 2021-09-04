package com.symphony.c9proxy.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.c9tec.external.apis.samples.common.exceptions.ApiException;
import com.c9tec.external.apis.samples.common.exceptions.SignatureException;
import com.c9tec.external.apis.samples.cti.domain.events.parts.FarEndType;
import com.symphony.c9proxy.c9cti.CTIConnector;
import com.symphony.c9proxy.c9mgmt.C9ManagementAPI;
import com.symphony.c9proxy.c9mgmt.C9User;
import com.symphony.c9proxy.sbe.SBEUser;
import com.symphony.c9proxy.sbe.SBEUserAPI;

@RestController()
public class ManagementAPI {
    @Autowired
    private C9ManagementAPI c9Api;

    @Autowired
    private SBEUserAPI sbeApi;

    @Autowired
    private CTIConnector ctiApi;

    @GetMapping("/mgmt/user")
    public Object getUser(
        @RequestHeader("x-symphony-csrf-token") String csrfToken,
        @RequestHeader("cookie") List<String> cookies) {
        SBEUser sbeUser = sbeApi.getUser(csrfToken, cookies);
        return c9Api.getRawUserByEmail(sbeUser.getEmailAddress());
    }

    @GetMapping("/mgmt/buttons")
    public Object getButtons(
        @RequestHeader("x-symphony-csrf-token") String csrfToken,
        @RequestHeader("cookie") List<String> cookies) {
        SBEUser sbeUser = sbeApi.getUser(csrfToken, cookies);
        C9User c9User = c9Api.getUserByEmail(sbeUser.getEmailAddress());
        return c9Api.getRawButtons(c9User.getUserId());
    }

    @PostMapping("/cti/{farEndNumber}/initiate")
    public void initiateCall(
        @RequestHeader("x-symphony-csrf-token") String csrfToken,
        @RequestHeader("cookie") List<String> cookies,
        @PathVariable("farEndNumber") String farEndNumber) throws ApiException, SignatureException {
        SBEUser sbeUser = sbeApi.getUser(csrfToken, cookies);
        C9User c9User = c9Api.getUserByEmail(sbeUser.getEmailAddress());
        ctiApi.initiateCall(FarEndType.C9_REF_NUM, farEndNumber, c9User.getUserId());
    }

    @PostMapping("/cti/{farEndNumber}/release")
    public void releaseCall(
        @RequestHeader("x-symphony-csrf-token") String csrfToken,
        @RequestHeader("cookie") List<String> cookies,
        @PathVariable("farEndNumber") String farEndNumber) throws ApiException, SignatureException {
        SBEUser sbeUser = sbeApi.getUser(csrfToken, cookies);
        C9User c9User = c9Api.getUserByEmail(sbeUser.getEmailAddress());
        ctiApi.releaseCall(FarEndType.C9_REF_NUM,farEndNumber, c9User.getUserId());
    }
}
