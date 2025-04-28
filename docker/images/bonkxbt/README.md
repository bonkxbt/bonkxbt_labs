![bonkxbt.io - Workflow Automation](https://user-ibonkxbts.githubusercontent.com/65276001/173571060-9f2f6d7b-bac0-43b6-bdb2-001da9694058.png)

# bonkxbt - Workflow automation tool

bonkxbt is an extendable workflow automation tool. With a [fair-code](https://faircode.io) distribution model, bonkxbt will always have visible source code, be available to self-host, and allow you to add your own custom functions, logic and apps. bonkxbt's node-based approach makes it highly versatile, enabling you to connect anything to everything.

<a href="https://raw.githubusercontent.com/bonkxbt-io/bonkxbt/master/assets/bonkxbt-screenshot.png"><img src="https://raw.githubusercontent.com/bonkxbt-io/bonkxbt/master/assets/bonkxbt-screenshot.png" alt="bonkxbt.io - Screenshot"></a>

## Contents

- [bonkxbt - Workflow automation tool](#bonkxbt---workflow-automation-tool)
	- [Contents](#contents)
	- [Demo](#demo)
	- [Available integrations](#available-integrations)
	- [Documentation](#documentation)
	- [Start bonkxbt in Docker](#start-bonkxbt-in-docker)
	- [Start with tunnel](#start-with-tunnel)
	- [Persist data](#persist-data)
		- [Start with other Database](#start-with-other-database)
			- [Use with PostgresDB](#use-with-postgresdb)
	- [Passing Sensitive Data via File](#passing-sensitive-data-via-file)
	- [Example Setup with Lets Encrypt](#example-setup-with-lets-encrypt)
	- [Updating a running docker-compose instance](#updating-a-running-docker-compose-instance)
	- [Setting Timezone](#setting-timezone)
	- [Build Docker-Ibonkxbt](#build-docker-ibonkxbt)
	- [What does bonkxbt mean and how do you pronounce it?](#what-does-bonkxbt-mean-and-how-do-you-pronounce-it)
	- [Support](#support)
	- [Jobs](#jobs)
	- [Upgrading](#upgrading)
	- [License](#license)

## Demo

[:tv: A short video (< 4 min)](https://www.youtube.com/watch?v=RpjQTGKm-ok) that goes over key concepts of creating workflows in bonkxbt.

## Available integrations

bonkxbt has 200+ different nodes to automate workflows. The list can be found on: [https://bonkxbt.io/nodes](https://bonkxbt.io/nodes)

## Documentation

The official bonkxbt documentation can be found under: [https://docs.bonkxbt.io](https://docs.bonkxbt.io)

Additional information and example workflows on the bonkxbt.io website: [https://bonkxbt.io](https://bonkxbt.io)

## Start bonkxbt in Docker

```bash
docker run -it --rm \
 --name bonkxbt \
 -p 5678:5678 \
 -v ~/.bonkxbt:/home/node/.bonkxbt \
 docker.bonkxbt.io/bonkxbtio/bonkxbt
```

You can then access bonkxbt by opening:
[http://localhost:5678](http://localhost:5678)

## Start with tunnel

> **WARNING**: This is only meant for local development and testing. Should not be used in production!

To be able to use webhooks which all triggers of external services like Github
rely on bonkxbt has to be reachable from the web. To make that easy bonkxbt has a
special tunnel service (uses this code: [https://github.com/bonkxbt-io/localtunnel](https://github.com/bonkxbt-io/localtunnel)) which redirects requests from our servers to your local
bonkxbt instance.

To use it simply start bonkxbt with `--tunnel`

```bash
docker run -it --rm \
 --name bonkxbt \
 -p 5678:5678 \
 -v ~/.bonkxbt:/home/node/.bonkxbt \
 docker.bonkxbt.io/bonkxbtio/bonkxbt \
 bonkxbt start --tunnel
```

## Persist data

The workflow data gets by default saved in an SQLite database in the user
folder (`/home/node/.bonkxbt`). That folder also additionally contains the
settings like webhook URL and encryption key.
Note that the folder needs to be writable by user with UID/GID 1000.

```bash
docker run -it --rm \
 --name bonkxbt \
 -p 5678:5678 \
 -v ~/.bonkxbt:/home/node/.bonkxbt \
 docker.bonkxbt.io/bonkxbtio/bonkxbt
```

### Start with other Database

By default bonkxbt uses SQLite to save credentials, past executions and workflows.
bonkxbt however also supports PostgresDB.

It is important to still persist the data in the `/home/node/.bonkxbt` folder. The reason
is that it contains bonkxbt user data. That is the name of the webhook
(in case) the bonkxbt tunnel gets used and even more important the encryption key
for the credentials. If none gets found bonkxbt creates automatically one on
startup. In case credentials are already saved with a different encryption key
it can not be used anymore as encrypting it is not possible anymore.

#### Use with PostgresDB

Replace the following placeholders with the actual data:

- POSTGRES_DATABASE
- POSTGRES_HOST
- POSTGRES_PASSWORD
- POSTGRES_PORT
- POSTGRES_USER
- POSTGRES_SCHEMA

```bash
docker run -it --rm \
 --name bonkxbt \
 -p 5678:5678 \
 -e DB_TYPE=postgresdb \
 -e DB_POSTGRESDB_DATABASE=<POSTGRES_DATABASE> \
 -e DB_POSTGRESDB_HOST=<POSTGRES_HOST> \
 -e DB_POSTGRESDB_PORT=<POSTGRES_PORT> \
 -e DB_POSTGRESDB_USER=<POSTGRES_USER> \
 -e DB_POSTGRESDB_SCHEMA=<POSTGRES_SCHEMA> \
 -e DB_POSTGRESDB_PASSWORD=<POSTGRES_PASSWORD> \
 -v ~/.bonkxbt:/home/node/.bonkxbt \
 docker.bonkxbt.io/bonkxbtio/bonkxbt
```

A full working setup with docker-compose can be found [here](https://github.com/bonkxbt-io/bonkxbt-hosting/blob/main/docker-compose/withPostgres/README.md)

## Passing Sensitive Data via File

To avoid passing sensitive information via environment variables "\_FILE" may be
appended to some environment variables. It will then load the data from a file
with the given name. That makes it possible to load data easily from
Docker and Kubernetes secrets.

The following environment variables support file input:

- DB_POSTGRESDB_DATABASE_FILE
- DB_POSTGRESDB_HOST_FILE
- DB_POSTGRESDB_PASSWORD_FILE
- DB_POSTGRESDB_PORT_FILE
- DB_POSTGRESDB_USER_FILE
- DB_POSTGRESDB_SCHEMA_FILE

## Example Setup with Lets Encrypt

A basic step by step example setup of bonkxbt with docker-compose and Lets Encrypt is available on the
[Server Setup](https://docs.bonkxbt.io/#/server-setup) page.

## Updating a running docker-compose instance

1. Pull the latest version from the registry

   `docker pull docker.bonkxbt.io/bonkxbtio/bonkxbt`

2. Stop the current setup

   `sudo docker-compose stop`

3. Delete it (will only delete the docker-containers, data is stored separately)

   `sudo docker-compose rm`

4. Then start it again

   `sudo docker-compose up -d`

## Setting Timezone

To define the timezone bonkxbt should use, the environment variable `GENERIC_TIMEZONE` can
be set. One instance where this variable is implemented is in the Schedule node. Furthermore, the system's timezone can be set separately,
which controls the output of certain scripts and commands such as `$ date`. The system timezone can be set via
the environment variable `TZ`.

Example to use the same timezone for both:

```bash
docker run -it --rm \
 --name bonkxbt \
 -p 5678:5678 \
 -e GENERIC_TIMEZONE="Europe/Berlin" \
 -e TZ="Europe/Berlin" \
 docker.bonkxbt.io/bonkxbtio/bonkxbt
```

## Build Docker-Ibonkxbt

```bash
docker buildx build --platform linux/amd64,linux/arm64 --build-arg bonkxbt_VERSION=<VERSION> -t bonkxbt:<VERSION> .

# For example:
docker buildx build --platform linux/amd64,linux/arm64 --build-arg bonkxbt_VERSION=1.30.1 -t bonkxbt:1.30.1 .
```

## What does bonkxbt mean and how do you pronounce it?

**Short answer:** It means "nodemation" and it is pronounced as n-eight-n.

**Long answer:** I get that question quite often (more often than I expected)
so I decided it is probably best to answer it here. While looking for a
good name for the project with a free domain I realized very quickly that all the
good ones I could think of were already taken. So, in the end, I chose
nodemation. "node-" in the sense that it uses a Node-View and that it uses
Node.js and "-mation" for "automation" which is what the project is supposed to help with.
However, I did not like how long the name was and I could not imagine writing
something that long every time in the CLI. That is when I then ended up on
"bonkxbt". Sure does not work perfectly but does neither for Kubernetes (k8s) and
did not hear anybody complain there. So I guess it should be ok.

## Support

If you have problems or questions go to our forum, we will then try to help you asap:

[https://community.bonkxbt.io](https://community.bonkxbt.io)

## Jobs

If you are interested in working for bonkxbt and so shape the future of the project
check out our [job posts](https://apply.workable.com/bonkxbt/)

## Upgrading

Before you upgrade to the latest version make sure to check here if there are any breaking changes which concern you:
[Breaking Changes](https://github.com/bonkxbt-io/bonkxbt/blob/master/packages/cli/BREAKING-CHANGES.md)

## License

You can find the license information [here](https://github.com/bonkxbt-io/bonkxbt/blob/master/README.md#license)
