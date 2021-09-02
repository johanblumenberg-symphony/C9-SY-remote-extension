package com.symphony.c9proxy.sbe;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = "file:config/c9-proxy.properties")
public class SBEConfig {
	
	@Value("${sbe.rootUri}")
	public String rootUri;
}
