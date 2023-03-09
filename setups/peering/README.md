# Peering Setup

This setup expects you to have built the `consul:local` image:

You can do so by cloning [Consul](https://github.com/hashicorp/consul) and
running the following commands:

1. `make ui-docker`
2. `make dev-docker`

## Starting the setup

1. `yarn setup:tls` you should only have to do this the first time
2. `docker-compose up`
3. `yarn setup:peerings`

The setup will start two agents with the UI enabled:

- server-1 - https://localhost:8501/ui/
- server-2 - https://localhost:8601/ui/

## Using a different version than `consul:local`

You can customize what consul image will be used by providing the
`CONSUL_IMAGE` environment variable.

`CONSUL_IMAGE=consul:latest docker-compose up`
