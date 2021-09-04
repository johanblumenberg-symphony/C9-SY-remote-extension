package com.symphony.c9proxy.c9mgmt;

import lombok.Data;

@Data
public class C9User {
    @Data
    public static class Contact {
        private String email;
    }
    
    @Data
    public static class PersonalSettings {
        private String firstName;
        private String lastName;
        private Contact contact;
    }
    
    private String userName;
    private int userId;
    private PersonalSettings personalSettings;
}
