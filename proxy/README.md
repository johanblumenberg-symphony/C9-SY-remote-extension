# C9 Proxy

Cloud9 exposes a management API that gives access to all users and connections.
Authentication to this API is done using an API key and secret, and can only be used from other services, not from client.

## Authentication

This proxy is authenticating Symphony users by accessing the `/webcontroller/maestro/Account` on SBE. All access must be authenticated in SBE before any data can be returned. The proxy must only return data for the authenticated user.

## API

The proxy is returning data straight from the management API without changing it. This is to be transparent to changes in the API, without having to update the proxy.
