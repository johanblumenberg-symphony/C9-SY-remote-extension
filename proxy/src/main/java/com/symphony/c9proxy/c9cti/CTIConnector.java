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
import com.c9tec.external.apis.samples.cti.domain.ApiMessageType;
import com.c9tec.external.apis.samples.cti.domain.events.CallStatus;
import com.c9tec.external.apis.samples.cti.domain.events.CallStatusSnapshot;
import com.c9tec.external.apis.samples.cti.domain.events.RejectMessage;
import com.c9tec.external.apis.samples.cti.domain.events.UserStatusUpdate;
import com.c9tec.external.apis.samples.cti.domain.events.parts.FarEndType;
import com.c9tec.external.apis.samples.cti.impl.ClientOptions;
import com.c9tec.external.apis.samples.cti.impl.CtiApiClient;
import com.c9tec.external.apis.samples.cti.impl.GsonSerializer;
import com.symphony.c9proxy.api.SessionStore;
import com.symphony.c9proxy.api.StatusSession;

import lombok.Data;

@Component
public class CTIConnector implements IEventListener {
    private final Logger logger = LoggerFactory.getLogger(CTIConnector.class);
    private ICtiApiClient client;

    @Autowired
    private C9CtiConfig config;

    @Autowired
    private SessionStore sessions;

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

    public void initiateCall(FarEndType farEndType, String farEndNumber, int userId)
        throws ApiException, SignatureException {
        logger.info("initiateCall()");
        client.initiateCall(farEndType, farEndNumber, userId);
    }

    public void releaseCall(FarEndType farEndType, String farEndNumber, int userId)
        throws ApiException, SignatureException {
        logger.info("releaseCall()");
        client.releaseCall(farEndType, farEndNumber, userId);
    }

    public void requestUsersStatus() throws ApiException, SignatureException {
        logger.info("requestUsersStatus()");
        client.requestUsersStatus();
    }

    public void requestUsersCallStatus() throws ApiException, SignatureException {
        logger.info("requestUsersCallStatus()");
        client.requestUsersCallStatus();
    }

    @Override
    public void onAllUsersStatus(List<UserStatusUpdate> status) {
        logger.info("onAllUsersStatus() " + new GsonSerializer().serialize(status));
    }

    @Override
    public void onCallStatus(CallStatus status) {
        @Data
        final class CallStatusMessage {
            private final ApiMessageType messageType = ApiMessageType.EVENT_CALL_STATUS;
            private final CallStatus messageBody;
        }

        logger.info("onCallStatus() " + new GsonSerializer().serialize(status));
        for (StatusSession session : sessions.getSessionsForUser(status.getUserId())) {
            session.enqueueMessage(new CallStatusMessage(status));
        }
    }

    @Override
    public void onCallStatuses(int userId, List<CallStatus> callStatusList) {
        @Data
        final class CallStatusSnapshotMessage {
            private final ApiMessageType messageType = ApiMessageType.REQUEST_CALL_STATUS_SNAPSHOT;
            private final CallStatusSnapshot messageBody;
        }

        logger.info("onCallStatuses() " + userId + " " + new GsonSerializer().serialize(callStatusList));
        CallStatusSnapshot callStatusSnapshot = new CallStatusSnapshot();
        callStatusSnapshot.setUserId(userId);
        callStatusSnapshot.setCallStatusList(callStatusList);
        for (StatusSession session : sessions.getSessionsForUser(userId)) {
            session.enqueueMessage(new CallStatusSnapshotMessage(callStatusSnapshot));
        }
    }

    @Override
    public void onRequestRejected(RejectMessage rejectMessage) {
        logger.info("onRequestRejected() " + new GsonSerializer().serialize(rejectMessage));
    }

    @Override
    public void onUsersStatus(UserStatusUpdate status) {
        logger.info("onUsersStatus() " + new GsonSerializer().serialize(status));
    }
}
