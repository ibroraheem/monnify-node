# 🚀 MonnifySDK Documentation 📖

Easily integrate the Monnify payment gateway into your Node.js application using the MonnifySDK.

![version](https://img.shields.io/badge/version-1.0.0-green)
![npm](https://img.shields.io/badge/npm-compatible-brightgreen)
![monnify](https://img.shields.io/badge/monnify-supported-blue)

## 📌 Table of Contents

1. 📦 Installation
2. ⚙️ Initialization
3. 🛠️ Methods
4. ❗ Error Handling

## 📦 Installation

To get started with the MonnifySDK, install it via npm:

```bash
npm install monnify-sdk
```

## ⚙️ Initialization

Import and initialize the SDK:

```javascript
const MonnifySDK = require('monnify-sdk');
const sdk = new MonnifySDK(apiKey, secretKey, contractCode, baseUrl);
```

🔑 Where:

- `apiKey`: Your Monnify API key.
- `secretKey`: Your Monnify secret key.
- `contractCode`: Your unique Monnify contract code.
- `baseUrl`: Monnify's API base URL.

## 🛠️ Methods

### i. initializeTransaction

Initialize a payment transaction:

```javascript
const result = await sdk.initializeTransaction(1000, "John Doe", "johndoe@example.com", "Payment for Order #123", "https://your-merchant-url.com/callback", "NGN");
```

**Parameters**:

- ... [as before] ...

[... Continue for all other methods ...]

## ❗ Error Handling

All methods return promises. Handle potential errors:

```javascript
try {
    const response = await sdk.initializeTransaction(...params);
    // Handle response
} catch (error) {
    console.error(error.message);
}
```

## 🔚 Conclusion

MonnifySDK makes Monnify integration 🍰 piece of cake! Always refer to Monnify's official documentation for updates or more details.
