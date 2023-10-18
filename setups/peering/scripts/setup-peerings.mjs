#!/usr/bin/env zx

function generateToken(opts) {
  const { host, peerName } = opts;

  return $`http POST ${host}/v1/peering/token PeerName=${peerName} --verify no --body`;
}

function establishPeering(opts) {
  const { host, peerName, token } = opts;

  return $`http POST ${host}/v1/peering/establish PeerName=${peerName} PeeringToken=${token} --verify no --body`;
}

function createService(opts) {
  const { host, name } = opts;

  return $`http PUT ${host}/v1/agent/service/register Name=${name} --verify no`;
}

function createConfigurationEntry(opts) {
  const { host, kind, config } = opts;

  // build up rawJson for configuration payload - httpie allows raw JSON
  const rawJsonConfig = Object.keys(config).reduce((acc, key) => {
    const rawJsonSyntax = `${key}:=${JSON.stringify(config[key])}`;
    return `${acc}${rawJsonSyntax} `;
  }, "");

  console.log(rawJsonConfig);
  return $`http PUT ${host}/v1/config Kind=${kind} Name=default ${rawJsonConfig} --verify no`;
}

const SERVER_1 = `https://localhost:8501`;
const SERVER_2 = `https://localhost:8601`;

async function setupPeerings() {
  try {
    await which("http");

    try {
      // dialer: dc1 -> dc2
      const tokenPayload = await generateToken({
        host: SERVER_1,
        peerName: "to-dc2",
      });
      const token = JSON.parse(tokenPayload).PeeringToken;

      // setup a service that we will export
      await createService({ host: SERVER_1, name: "billing" });

      // export service via configuration entry
      await createConfigurationEntry({
        host: SERVER_1,
        kind: "exported-services",
        config: {
          Services: {
            Name: "billing",
            Namespace: "default",
            Consumers: [
              {
                Peer: "to-dc2",
              },
            ],
          },
        },
      });

      // receiver: use token from dc1 and establish peering connection
      await establishPeering({ host: SERVER_2, peerName: "from-dc1", token });

      // setup a service that server 2 will export
      await createService({ host: SERVER_2, name: "redis" });
      await createService({ host: SERVER_2, name: "billing" });

      await createConfigurationEntry({
        host: SERVER_2,
        kind: "exported-services",
        config: {
          Services: {
            Name: "redis",
            Namespace: "default",
            Consumers: [
              {
                Peer: "from-dc1",
              },
            ],
          },
        },
      });
    } catch (e) {
      echo(`There was an error calling the API: ${e}`);
      process.exit(1);
    }
  } catch (e) {
    echo(
      `To run this script you need to have \`httpie\` installed - https://httpie.io`
    );

    process.exit(1);
  }
}

await setupPeerings();
