package com.symphony.c9proxy.sbe;

import lombok.Data;

@Data
@SuppressWarnings("unused")
public class SBEUser {
    private long userName;
    private String prettyName;
    private String emailAddress;
}
