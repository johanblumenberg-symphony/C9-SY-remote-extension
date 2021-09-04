package com.symphony.c9proxy.c9mgmt;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = "file:config/c9-proxy.properties")
public class C9ManagementConfig {
	
	@Value("${c9.management.apiKey}")
	public String apiKey;

	@Value("${c9.management.apiSecret}")
	public String apiSecret;
	
	@Value("${c9.management.apiRoot}")
	public String apiRoot;
}
