package com.symphony.c9proxy.c9;

import lombok.Data;

@Data
public class C9Button {
    private long buttonId;
    private String buttonLabel;
    private String connectionNumber;
    private long connectionId;
    private long connectionInstanceId;
    private long extensionId;
    private long speakerPosition;
}
