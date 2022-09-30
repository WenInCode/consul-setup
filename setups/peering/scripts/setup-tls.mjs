#!/usr/bin/env zx

async function setupTls() {
  try {
    await which("consul");

    cd(__dirname);
    cd("../certs");

    // delete existing certificats
    try {
      await $`rm *.pem`;
    } catch (e) {
      echo("no existing certificates found");
    }
    // create new certificates
    await $`consul tls ca create`;
    await $`consul tls cert create -server -dc dc1`;
    await $`consul tls cert create -server -dc dc2`;
  } catch (e) {
    echo(
      "You have to install consul locally to run this script - brew install consul"
    );
  }
}

await setupTls();
