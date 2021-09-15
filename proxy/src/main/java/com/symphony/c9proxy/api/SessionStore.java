package com.symphony.c9proxy.api;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class SessionStore {
    private Map<String, StatusSession> sessions = new ConcurrentHashMap<>();
    
    // TODO: Clear expired sessions
    // TODO: only send initial call status to sessions that were not initialized already

    public StatusSession create(int userId) {
        String sessionId = UUID.randomUUID().toString();
        StatusSession session = new StatusSession(sessionId, userId);
        
        sessions.put(sessionId, session);

        return session;
    }
    
    public StatusSession getSession(String sessionId, int userId) {
        return sessions.get(sessionId);
    }
    
    public Collection<StatusSession> getAllSessions() {
        return sessions.values();
    }

    public Collection<StatusSession> getSessionsForUser(int userId) {
        List<StatusSession> userSessions = new ArrayList<>();
        
        for (StatusSession session : sessions.values()) {
            if (session.getUserId() == userId) {
                userSessions.add(session);
            }
        }
        return userSessions;
    }
}
