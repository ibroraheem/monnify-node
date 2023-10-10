# 🚀 **MonnifySDK Documentation** 📖

Integrate the Monnify payment gateway seamlessly with Node.js applications using the MonnifySDK.

![version](https://img.shields.io/badge/version-1.0.1-green)
![npm](https://img.shields.io/badge/npm-compatible-brightgreen)
![monnify](https://img.shields.io/badge/monnify-supported-blue)

## 📌 **Table of Contents**

- [🚀 **MonnifySDK Documentation** 📖](#-monnifysdk-documentation-)
  - [📌 **Table of Contents**](#-table-of-contents)
  - [📦 **Installation**](#-installation)
  - [⚙️ **Initialization**](#️-initialization)
  - [🛠️ **Core Methods**](#️-core-methods)
    - [1. `initializeTransaction()`](#1-initializetransaction)
  - [❗ **Error Handling**](#-error-handling)
  - [🔚 **Conclusion**](#-conclusion)

---

## 📦 **Installation**

```bash
npm install monnify-sdk
```

## ⚙️ **Initialization**

After installation, initialize the SDK with your Monnify credentials.

```javascript
const MonnifySDK = require('monnify-sdk');
const sdk = new MonnifySDK(apiKey, secretKey, contractCode, baseUrl);
```

**Parameters**:

- `apiKey`: The Monnify API key assigned to your account.
- `secretKey`: Your confidential Monnify secret.
- `contractCode`: Your business's unique Monnify code.
- `baseUrl`: Base endpoint for Monnify's API.

## 🛠️ **Core Methods**

### 1. `initializeTransaction()`

Begin a payment transaction:

```javascript
const result = await sdk.initializeTransaction(amount, customerName, customerEmail, paymentDescription, merchantUrl, currencyCode);
```

**Parameters**:

- ... [like before] ...

**Successful Response**:

```javascript
{
    status: 'success',
    checkoutUrl: [URL to redirect the user for completing the payment]
}
```

**Error Response**:

```javascript
{
    status: 'error',
    message: [Error message explaining the issue]
}
```

... *(Detail out the parameters, successful response, and error response for all the other methods, similar to the above format)* ...

## ❗ **Error Handling**

While the SDK is built to handle many scenarios, some unexpected situations can still arise. It's important to handle errors gracefully:

```javascript
try {
    const response = await sdk.initializeTransaction(...params);
    if(response.status === "success") {
        // Successful handling code here
    } else {
        // Handle potential errors or issues
    }
} catch (error) {
    console.error("Encountered an error:", error.message);
}
```

## 🔚 **Conclusion**

With `MonnifySDK`, integrating Monnify's payment solutions into your Node.js projects becomes a breeze. Whenever in doubt, lean on this documentation, and always check Monnify's official resources for the latest updates.
