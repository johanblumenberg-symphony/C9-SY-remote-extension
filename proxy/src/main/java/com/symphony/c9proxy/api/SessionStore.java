package com.symphony.c9proxy.api;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class SessionStore {
    private Map<Integer, Map<String, StatusSession>> sessions = new ConcurrentHashMap<>();
    
    // TODO: Clear expired sessions
    // TODO: only send initial call status to sessions that were not initialized already

    public StatusSession create(int userId) {
        String sessionId = UUID.randomUUID().toString();
        StatusSession session = new StatusSession(sessionId, userId);
        
        Map<String, StatusSession> userSessions = sessions.get(userId);
        if (userSessions == null) {
            // Do not overwrite an existing value that was added concurrently
            sessions.putIfAbsent(userId, new ConcurrentHashMap<>());
            userSessions = sessions.get(userId);
        }
        userSessions.put(sessionId, session);

        return session;
    }
    
    public StatusSession getSession(String sessionId, int userId) {
        Map<String, StatusSession> userSessions = sessions.get(userId);
        
        if (userSessions != null) {
            return userSessions.get(sessionId);
        } else {
            return null;
        }
    }
    
    public Collection<StatusSession> getSessionsForUser(int userId) {
        Map<String, StatusSession> userSessions = sessions.get(userId);

        if (userSessions != null) {
            return userSessions.values();
        } else {
            return Collections.emptyList();
        }
    }
}
