# transformer.bee Client (TypeScript)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/transformer-bee-client.svg)](https://www.npmjs.com/package/transformer-bee-client)
[![CI](https://github.com/Hochfrequenz/TransformerBeeClient.ts/workflows/CI/badge.svg)](https://github.com/Hochfrequenz/TransformerBeeClient.ts/actions)

This library is a TypeScript/JavaScript HTTP client for **transformer.bee** aka edifact-bo4e-converter.

We also maintain:
- [Python version](https://github.com/Hochfrequenz/TransformerBeeClient.py) of this client
- [.NET version](https://github.com/Hochfrequenz/TransformerBeeClient.NET) of this client

It allows you to convert EDIFACT messages to BO4E and vice versa by speaking to Hochfrequenz's transformer.bee service. Note that the actual conversion happens in the transformer.bee service/backend, this library only provides a convenient way to use its API.

## Features

- ✅ Full TypeScript support with strict typing
- ✅ Both authenticated (OAuth2) and unauthenticated clients
- ✅ Automatic token management and refresh
- ✅ Zero runtime dependencies (only `zod` for schema validation)
- ✅ Works in Node.js 18+
- ✅ ESM and CommonJS support
- ✅ Comprehensive error handling

## Installation

```bash
npm install transformer-bee-client
```

Or with yarn:

```bash
yarn add transformer-bee-client
```

Or with pnpm:

```bash
pnpm add transformer-bee-client
```

## Prerequisites / Account

First of all, you need an account to use transformer.bee. Ask [info@hochfrequenz.de](mailto:info@hochfrequenz.de) or ping [@JoschaMetze](https://github.com/joschametze) on GitHub to get one.

You can check if your account is working by logging [into our stage environment](https://transformerstage.utilibee.io/app/).

## Quick Start

### Unauthenticated Client (Local Development)

If you're hosting transformer.bee in the same network or your localhost without authentication:

```typescript
import {
  UnauthenticatedTransformerBeeClient,
  EdifactFormatVersion,
} from "transformer-bee-client";

const client = new UnauthenticatedTransformerBeeClient({
  baseUrl: "http://localhost:5021",
});

// Convert EDIFACT to BO4E
const edifactMessage = "UNA:+.? 'UNB+UNOC:3+...";
const boneyComb = await client.edifactToBo4e(
  edifactMessage,
  EdifactFormatVersion.FV2310
);

console.log(boneyComb.stammdaten);
console.log(boneyComb.transaktionsdaten);
```

### Authenticated Client (Production)

If Hochfrequenz provided you with a client ID and secret:

```typescript
import {
  AuthenticatedTransformerBeeClient,
  EdifactFormatVersion,
  BOneyComb,
} from "transformer-bee-client";

const client = new AuthenticatedTransformerBeeClient({
  baseUrl: "https://transformer.utilibee.io",
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
});

// Convert BO4E to EDIFACT
const boneyComb: BOneyComb = {
  stammdaten: [
    {
      boTyp: "MARKTLOKATION",
      marktlokationsId: "51238696781",
    },
  ],
  transaktionsdaten: {
    nachrichtentyp: "UTILMD",
    pruefidentifikator: "11042",
  },
};

const edifact = await client.bo4eToEdifact(
  boneyComb,
  EdifactFormatVersion.FV2310
);

console.log(edifact);
```

## API Reference

### EdifactFormatVersion

An enum representing the EDIFACT format versions:

| Version | Description |
|---------|-------------|
| `FV2304` | MIG/AHB versions valid since 2023-04-01 |
| `FV2310` | MIG/AHB versions valid since 2023-10-01 |
| `FV2404` | MIG/AHB versions valid since 2024-04-01 |
| `FV2410` | MIG/AHB versions valid since 2024-10-01 |
| `FV2504` | MIG/AHB versions valid since 2025-04-01 |

### BOneyComb

The container format for BO4E data:

```typescript
interface BOneyComb {
  stammdaten: Bo4eObject[];      // Array of BO4E business objects
  transaktionsdaten: Record<string, unknown>; // Transaction-specific data
}
```

### Client Configuration

#### UnauthenticatedTransformerBeeClient

```typescript
interface TransformerBeeClientConfig {
  baseUrl: string;           // Base URL of transformer.bee
  timeout?: number;          // Request timeout in ms (default: 30000)
  headers?: Record<string, string>; // Custom headers
}
```

#### AuthenticatedTransformerBeeClient

```typescript
interface AuthenticatedClientConfig extends TransformerBeeClientConfig {
  clientId: string;          // OAuth2 client ID
  clientSecret: string;      // OAuth2 client secret
  tokenEndpoint?: string;    // Custom token endpoint URL
  scope?: string;            // OAuth2 scope
}
```

### Methods

Both clients implement the `TransformerBeeClient` interface:

#### `edifactToBo4e(edifact: string, formatVersion: EdifactFormatVersion): Promise<BOneyComb>`

Converts an EDIFACT message to BO4E format.

#### `bo4eToEdifact(boneyComb: BOneyComb, formatVersion: EdifactFormatVersion): Promise<string>`

Converts a BO4E object to EDIFACT format.

### Error Handling

The library provides specific error classes:

```typescript
import {
  TransformerBeeError,      // Base error class
  AuthenticationError,       // OAuth2 authentication failed
  ApiError,                  // API returned an error
  EdifactToBo4eConversionError,
  Bo4eToEdifactConversionError,
  NetworkError,              // Network request failed
  TimeoutError,              // Request timed out
} from "transformer-bee-client";

try {
  const result = await client.edifactToBo4e(edifact, formatVersion);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Authentication failed:", error.message);
  } else if (error instanceof ApiError) {
    console.error(`API error ${error.statusCode}:`, error.message);
  } else if (error instanceof NetworkError) {
    console.error("Network error:", error.message);
  }
}
```

## Development

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/Hochfrequenz/TransformerBeeClient.ts.git
cd TransformerBeeClient.ts

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Lint
npm run lint

# Format code
npm run format
```

### Running Integration Tests

Integration tests require a running transformer.bee instance. Set environment variables:

```bash
export TRANSFORMER_BEE_URL=http://localhost:5021
# Optional for authenticated tests:
export TRANSFORMER_BEE_CLIENT_ID=your-client-id
export TRANSFORMER_BEE_CLIENT_SECRET=your-client-secret

npm run test:integration
```

## Release

To release a new version:

1. Update the version in `package.json`
2. Create a new release on GitHub with a tag starting with `v` (e.g., `v1.0.0`)
3. The GitHub Action will automatically publish to npm

## Contributing

You are very welcome to contribute by opening a pull request against the main branch.

## Related Tools and Context

This repository is part of the [Hochfrequenz Libraries and Tools for a truly digitized market communication](https://github.com/Hochfrequenz/digital_market_communication/).

## Hochfrequenz

[Hochfrequenz Unternehmensberatung GmbH](https://www.hochfrequenz.de) is a Grünwald (near Munich) based consulting company with offices in Berlin and Bremen and attractive remote options.

We're not only a main contributor for open source software for German utilities but, according to [Kununu ratings](https://www.kununu.com/de/hochfrequenz-unternehmensberatung1), also among the most attractive employers within the German energy market.

Applications of talented developers are welcome at any time! Please consider visiting our [career page](https://www.hochfrequenz.de/index.php/karriere/aktuelle-stellenausschreibungen/full-stack-entwickler) (German only).

## License

MIT License - see [LICENSE](LICENSE) file.
