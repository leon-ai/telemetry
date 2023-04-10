# Telemetry

Telemetry is the service for Leon that collects data to improve the experience. This initiative is completely anonymous and is only used to improve Leon.

It has been inspired from the series of articles [Transparent Telemetry for Open-Source Projects](https://research.swtch.com/telemetry-intro).

It can easily be disabled by setting `LEON_TELEMETRY` to `false` in your `.env` file located in the root of your Leon instance.

## Why Telemetry?

> Without telemetry, developers rely on bug reports and surveys to find out when their software isn’t working or how it is being used. Both of these techniques are too limited in their effectiveness.

## What Data is Collected?

Feel free to browse this repository to see what data is collected.
It uses the [Prisma](https://www.prisma.io/) ORM (self-hosted). You can find the schema in the `prisma/schema.prisma` file.
