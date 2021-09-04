package com.symphony.c9proxy.c9cti;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.c9tec.external.apis.samples.common.exceptions.ApiException;
import com.c9tec.external.apis.samples.common.exceptions.SignatureException;
import com.c9tec.external.apis.samples.cti.ICtiApiClient;
import com.c9tec.external.apis.samples.cti.IEventListener;
import com.c9tec.external.apis.samples.cti.domain.events.CallStatus;
import com.c9tec.external.apis.samples.cti.domain.events.RejectMessage;
import com.c9tec.external.apis.samples.cti.domain.events.UserStatusUpdate;
import com.c9tec.external.apis.samples.cti.domain.events.parts.FarEndType;
import com.c9tec.external.apis.samples.cti.impl.ClientOptions;
import com.c9tec.external.apis.samples.cti.impl.CtiApiClient;
import com.c9tec.external.apis.samples.cti.impl.GsonSerializer;

@Component
public class CTIConnector implements IEventListener {
    private final Logger logger = LoggerFactory.getLogger(CTIConnector.class);
    private ICtiApiClient client;
    
    @Autowired
    private C9CtiConfig config;
    
    public CTIConnector() {
        client = new CtiApiClient(new GsonSerializer(), ClientOptions.options(), this);
    }

    @PostConstruct
    private void create() throws ApiException, URISyntaxException {
        logger.info("Connecting to " + config.apiRoot);
        client.connect(new URI(config.apiRoot), config.apiKey, config.apiSecret.toCharArray());        
    }
    
    @PreDestroy
    private void destroy() throws IOException {
        logger.info("Disconnecting");
        client.disconnect();
    }
    
    public void initiateCall(FarEndType farEndType, String farEndNumber, int userId) throws ApiException, SignatureException {
        logger.info("initiateCall()");
        client.initiateCall(farEndType, farEndNumber, userId);
    }

    public void releaseCall(FarEndType farEndType, String farEndNumber, int userId) throws ApiException, SignatureException {
        logger.info("releaseCall()");
        client.releaseCall(farEndType, farEndNumber, userId);
    }

    @Override
    public void onAllUsersStatus(List<UserStatusUpdate> arg0) {
        logger.info("onAllUsersStatus()");
    }

    @Override
    public void onCallStatus(CallStatus arg0) {
        logger.info("onCallStatus()");
    }

    @Override
    public void onCallStatuses(int arg0, List<CallStatus> arg1) {
        logger.info("onCallStatuses()");
    }

    @Override
    public void onRequestRejected(RejectMessage arg0) {
        logger.info("onRequestRejected()");
    }

    @Override
    public void onUsersStatus(UserStatusUpdate arg0) {
        logger.info("onUsersStatus()");
    }
}
