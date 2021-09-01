package com.symphony.c9proxy.management;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = "c9.properties")
public class C9Config {
	
	@Value("${management.apiKey}")
	public String apiKey;

	@Value("${management.apiSecret}")
	public String apiSecret;
}
