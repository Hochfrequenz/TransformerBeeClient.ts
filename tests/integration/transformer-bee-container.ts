import { GenericContainer, StartedTestContainer, Wait } from "testcontainers";

/**
 * The Docker image for transformer.bee (edifact-bo4e-converter).
 * Source: https://github.com/Hochfrequenz/TransformerBeeClient.py/blob/main/integrationtests/conftest.py
 */
const TRANSFORMER_BEE_IMAGE =
  "ghcr.io/enercity/edifact-bo4e-converter/edifactbo4econverter:v1.31.0";

/**
 * The REST API port exposed by transformer.bee.
 */
const TRANSFORMER_BEE_REST_PORT = 5001;

/**
 * Starts a transformer.bee container for integration testing.
 *
 * @returns A promise resolving to the started container
 */
export async function startTransformerBeeContainer(): Promise<StartedTestContainer> {
  const container = await new GenericContainer(TRANSFORMER_BEE_IMAGE)
    .withExposedPorts(TRANSFORMER_BEE_REST_PORT)
    .withEnvironment({ StorageProvider: "Directory" })
    .withWaitStrategy(Wait.forLogMessage(/Application started\. Press Ctrl\+C to shut down\./))
    .withStartupTimeout(60000)
    .start();

  return container;
}

/**
 * Gets the base URL for the transformer.bee API from a started container.
 *
 * @param container - The started transformer.bee container
 * @returns The base URL for the API
 */
export function getTransformerBeeUrl(container: StartedTestContainer): string {
  const host = container.getHost();
  const port = container.getMappedPort(TRANSFORMER_BEE_REST_PORT);
  return `http://${host}:${port}`;
}

export { TRANSFORMER_BEE_REST_PORT };
