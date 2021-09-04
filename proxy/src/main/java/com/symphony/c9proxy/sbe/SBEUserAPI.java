package com.symphony.c9proxy.sbe;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.symphony.c9proxy.api.RestAPI;

@Component
public class SBEUserAPI {
    private final Logger logger = LoggerFactory.getLogger(SBEUserAPI.class);
    private final RestTemplate api;

    public SBEUserAPI(SBEConfig config, RestTemplateBuilder restTemplateBuilder)
        throws NoSuchAlgorithmException, InvalidKeyException {

        this.api = restTemplateBuilder.rootUri(config.apiRoot).build();
        this.api.setRequestFactory(new HttpComponentsClientHttpRequestFactory());
    }

    public SBEUser getUser(String csrfToken, List<String> cookies) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Symphony-CSRF-Token", csrfToken);
            headers.addAll("Cookie", cookies);

            HttpEntity<Void> entity = new HttpEntity<Void>(headers);

            HttpEntity<SBEUser> response = api.exchange(
                "/webcontroller/maestro/Account?clienttype=DESKTOP&hasRoomParticipations=false&xPinnedChats=false",
                HttpMethod.GET, entity,
                SBEUser.class);
            return response.getBody();
        } catch (HttpClientErrorException.Unauthorized e) {
            logger.warn("Unauthorized access to /webcontroller/maestro/Account: " + e.getMessage());
            throw new RestAPI.Unauthorized();
        }
    }
}
