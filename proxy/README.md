# C9 Proxy

Cloud9 exposes a management API that gives access to all users and connections.
Authentication to this API is done using an API key and secret, and can only be used from other services, not from client.

## Design

### Authentication

This proxy is authenticating Symphony users by accessing the `/webcontroller/maestro/Account` on SBE. All access must be authenticated in SBE before any data can be returned. The proxy must only return data for the authenticated user.

### API

The proxy is returning data straight from the management API without changing it. This is to be transparent to changes in the API, without having to update the proxy.

## Setup

You need java and maven installed to run this proxy.

### API keys

You need an API key and secret to access the Cloud9 management and CTI APIs. Create a file called `config/c9-proxy.properties` based on `config/c9-proxy.config.template` and add the API keys and secrets to this file.

Also add the base URL to access the CTI and management API from Cloud9, and the Symphony base URL to access the Symphony API.

## Run

To run the proxy locally, run the following command.

```
$ mvn spring-boot:run
```
