package com.symphony.c9proxy.c9cti;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = "file:config/c9-proxy.properties")
public class C9CtiConfig {
	
	@Value("${c9.cti.apiKey}")
	public String apiKey;

	@Value("${c9.cti.apiSecret}")
	public String apiSecret;
	
	@Value("${c9.cti.apiRoot}")
	public String apiRoot;
}
