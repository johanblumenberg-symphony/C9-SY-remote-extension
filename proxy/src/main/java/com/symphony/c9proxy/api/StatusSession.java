package com.symphony.c9proxy.api;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicReference;

public class StatusSession {
    private Queue<Object> queue = new ConcurrentLinkedDeque<Object>();
    private AtomicReference<MessageSender> consumer = new AtomicReference<>();
    private String sessionId;
    private int userId;
    
    public interface MessageSender {
        void send(Object message);
        void cancel();
    }

    public StatusSession(String sessionId, int userId) {
        this.sessionId = sessionId;
        this.userId = userId;
    }
    
    public String getSessionId() {
        return sessionId;
    }
   
    public int getUserId() {
        return userId;
    }
    
    public void enqueueMessage(Object message) {
        queue.add(message);
        maybeSend();
    }

    public void addConsumer(MessageSender next) {
        MessageSender prev = consumer.getAndSet(next);
        if (prev != null) {
            prev.cancel();
        }
        maybeSend();
    }

    public boolean cancelConsumer(MessageSender c) {
        return consumer.compareAndSet(c, null);
    }

    private synchronized void maybeSend() {
        if (queue.size() > 0) {
            MessageSender c = consumer.getAndSet(null);
            if (c != null) {
                Object m = queue.poll();
                c.send(m);
            }
        }
    }
}
