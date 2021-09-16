package com.symphony.c9proxy.api;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.async.DeferredResult;

import com.c9tec.external.apis.samples.common.exceptions.ApiException;
import com.c9tec.external.apis.samples.common.exceptions.SignatureException;
import com.c9tec.external.apis.samples.cti.domain.events.parts.FarEndType;
import com.symphony.c9proxy.api.RestAPI.Cancelled;
import com.symphony.c9proxy.api.RestAPI.NotFound;
import com.symphony.c9proxy.api.StatusSession.MessageSender;
import com.symphony.c9proxy.c9cti.CTIConnector;
import com.symphony.c9proxy.c9mgmt.C9Button;
import com.symphony.c9proxy.c9mgmt.C9ManagementAPI;
import com.symphony.c9proxy.c9mgmt.C9User;
import com.symphony.c9proxy.sbe.SBEUser;
import com.symphony.c9proxy.sbe.SBEUserAPI;

import lombok.Data;

@RestController()
public class ManagementAPI {
    @Autowired
    private C9ManagementAPI c9Api;

    @Autowired
    private SBEUserAPI sbeApi;

    @Autowired
    private CTIConnector ctiApi;

    @Autowired
    private SessionStore sessions;

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

    @GetMapping("/mgmt/users")
    public Object getUsers(
        @RequestHeader("x-symphony-csrf-token") String csrfToken,
        @RequestHeader("cookie") List<String> cookies,
        @RequestParam(name="userId", required=false) Integer userId,
        @RequestParam(name="email", required=false) String email) {
        sbeApi.getUser(csrfToken, cookies);

        if (userId != null) {
            return c9Api.getRawUser(userId);
        } else if (email != null) {
            return c9Api.getRawUserByEmail(email);
        } else {
            throw new RestAPI.BadRequest();
        }
    }

    @GetMapping("/mgmt/connections")
    public Object getConnetions(
        @RequestHeader("x-symphony-csrf-token") String csrfToken,
        @RequestHeader("cookie") List<String> cookies) {
        SBEUser sbeUser = sbeApi.getUser(csrfToken, cookies);
        C9User c9User = c9Api.getUserByEmail(sbeUser.getEmailAddress());
        List<C9Button> buttons = c9Api.getButtons(c9User.getUserId());
        return c9Api.getRawConnections(buttons.stream().map(C9Button::getConnectionNumber).collect(Collectors.toList()));
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
        ctiApi.releaseCall(FarEndType.C9_REF_NUM, farEndNumber, c9User.getUserId());
    }

    @Data
    private static class SessionCreated {
        private final String session;
    }
    
    @PostMapping("/cti/status")
    public SessionCreated createStatusSession(
        @RequestHeader("x-symphony-csrf-token") String csrfToken,
        @RequestHeader("cookie") List<String> cookies) throws ApiException, SignatureException {
        SBEUser sbeUser = sbeApi.getUser(csrfToken, cookies);
        C9User c9User = c9Api.getUserByEmail(sbeUser.getEmailAddress());

        StatusSession session = sessions.create(c9User.getUserId());

        ctiApi.requestUsersCallStatus();
        
        return new SessionCreated(session.getSessionId());
    }

    @GetMapping("/cti/status")
    public DeferredResult<Object> getStatusMessages(
        @RequestHeader("x-symphony-csrf-token") String csrfToken,
        @RequestHeader("cookie") List<String> cookies,
        @RequestParam("session") String sessionId) throws ApiException, SignatureException {
        SBEUser sbeUser = sbeApi.getUser(csrfToken, cookies);
        C9User c9User = c9Api.getUserByEmail(sbeUser.getEmailAddress());

        StatusSession session = sessions.getSession(sessionId, c9User.getUserId());
        DeferredResult<Object> result = new DeferredResult<>(20000L);

        if (session != null) {
            MessageSender c = new MessageSender() {
                @Override
                public void send(Object message) {
                    result.setResult(message);
                }

                @Override
                public void cancel() {
                    result.setErrorResult(new Cancelled());
                }
            };

            session.addConsumer(c);

            result.onTimeout(() -> {
                if (session.cancelConsumer(c)) {
                    result.setResult(null);
                }
            });
        } else {
            result.setErrorResult(new NotFound());
        }

        return result;
    }
}
