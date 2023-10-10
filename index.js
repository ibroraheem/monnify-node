const axios = require('axios')

class MonnifySDK {
    constructor(apiKey, secretKey, contractCode, baseUrl) {
        this.client = axios.create({
            baseUrl,
            headers: {
                'Authorization': `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`,
                'Content-Type': 'application/json'
            }
        })
        this.contractCode = contractCode
    }

    async initializeTransaction(amount, customerName, customerEmail, paymentDescription, merchantUrl, currencyCode) {
        const data = {
            amount: amount,
            customerName: customerName,
            customerEmail: customerEmail,
            paymentReference: `${Date.now()}`,
            paymentDescription: paymentDescription,
            redirectUrl: merchantUrl,
            paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
            currencyCode: currencyCode
        }
        try {
            const response = await this.client.post('/api/v1/merchant/transactions/init-transaction', data);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    checkoutUrl: response.data.responseBody.checkoutUrl
                }
            }
            throw new Error(response.data.responseMessage || 'Failed to initialize transaction')
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
    async payWithBankTransfer(amount, paymentDescription, merchantUrl, currencyCode) {
        const data = {
            amount: amount,
            paymentDescription: paymentDescription,
            redirectUrl: merchantUrl,
            currencyCode: currencyCode
        };

        try {
            const response = await this.client.post('/api/v1/merchant/bank-transfer/init-payment', data);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    accountDetails: {
                        accountNumber: response.data.responseBody.accountNumber,
                        accountName: response.data.responseBody.accountName,
                        bankName: response.data.responseBody.bankName,
                        bankCode: response.data.responseBody.bankCode
                    },
                    ussdPayment: response.data.responseBody.ussdPayment,
                    transactionReference: response.data.responseBody.transactionReference,
                    paymentReference: response.data.responseBody.paymentReference
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to initiate bank transfer');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async chargeCard(transactionReference, cardDetails) {
        const data = {
            transactionReference: transactionReference,
            collectionChannel: "API_NOTIFICATION",
            card: {
                number: cardDetails.number,
                expiryMonth: cardDetails.expiryMonth,
                expiryYear: cardDetails.expiryYear,
                pin: cardDetails.pin,
                cvv: cardDetails.cvv
            }
        };

        try {
            const response = await this.client.post('/api/v1/merchant/cards/charge', data);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    message: response.data.responseBody.message,
                    transactionReference: response.data.responseBody.transactionReference,
                    paymentReference: response.data.responseBody.paymentReference,
                    authorizedAmount: response.data.responseBody.authorizedAmount
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to charge the card');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async authorizeOTP(transactionReference, tokenId, token) {
        const data = {
            transactionReference: transactionReference,
            collectionChannel: "API_NOTIFICATION",
            tokenId: tokenId,
            token: token
        };

        try {
            const response = await this.client.post('/api/v1/merchant/cards/charge', data);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    message: response.data.responseBody.message,
                    transactionReference: response.data.responseBody.transactionReference,
                    paymentReference: response.data.responseBody.paymentReference,
                    authorizedAmount: response.data.responseBody.authorizedAmount
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to authorize OTP');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async getAllTransactions(params) {
        try {
            const response = await this.client.get('/api/v1/transactions/search', {
                params: params
            });
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    transactions: response.data.responseBody.content,
                    metadata: {
                        totalElements: response.data.responseBody.totalElements,
                        totalPages: response.data.responseBody.totalPages
                    }
                }
            }
            throw new Error(response.data.responseMessage);
        } catch (error) {
            return { status: 'error', message: error.message }
        }
    }

    async getTransactionStatus(transactionReference) {
        try {
            const response = await this.client.get(`/api/v2/transactions/${encodeURIComponent(transactionReference)}`)
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    transactionDetails: response.data.responseBody
                }
            }
            throw new Error(response.data.responseMessage);
        } catch (error) {
            return { status: 'error', message: error.message }
        }
    }

    async createReservedAccount(accountDetails) {
        try {
            const response = await this.client.post('/api/v2/bank-transfer/reserved-accounts', accountDetails);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    reservedAccountDetails: response.data.responseBody
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to create reserved account.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async createInvoiceReservedAccount(accountDetails) {
        try {
            const response = await this.client.post('/api/v1/bank-transfer/reserved-accounts', accountDetails);

            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody
                };
            }

            throw new Error(response.data.responseMessage || 'Failed to create invoiced reserved account.');

        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async getReservedAccountDetails(accountReference) {
        try {
            const response = await this.client.get(`/api/v2/bank-transfer/reserved-accounts/${accountReference}`);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody
                }
            }
            throw new Error(response.data.responseMessage || 'Failed to retrieve reserved account details.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async addLinkedAccounts(accountReference, preferredBanks = [], getAllAvailableBanks = false) {
        const data = {
            getAllAvailableBanks,
            preferredBanks
        }
        try {
            const response = await this.client.put(`/api/v1/bank-transfer/reserved-accounts/add-linked-accounts/${accountReference}`, data)
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody
                }
            }
            throw new Error(response.data.responseMessage)
        } catch (error) {
            return {
                status: 'error',
                data: error.message
            }

        }
    }

    async updateCustomerBVN(reservedAccountReference, bvn) {
        const data = {
            bvn
        }
        try {
            const response = await this.client.put(`/api/v1/bank-transfer/reserved-accounts/update-customer-bvn/${reservedAccountReference}`, data);
            if (response.data && response.data.bvn) {
                return {
                    status: 'success',
                    updatedBVN: response.data.bvn
                };
            }
            throw new Error('Failed to update BVN for the reserved account.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async updatePaymentSourceFilter(accountReference, restrictPaymentSource, allowedPaymentSources) {
        const data = {
            restrictPaymentSource,
            allowedPaymentSources
        };
        try {
            const response = await this.client.put(`/api/v1/bank-transfer/reserved-accounts/update-payment-source-filter/${accountReference}`, data);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody
                }
            }
            throw new Error(response.data.responseMessage || 'Failed to update allowed payment sources.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }

    async updateIncomeSplitConfig(accountReference, splitConfig) {
        try {
            const response = await this.client.put(`/api/v1/bank-transfer/reserved-accounts/update-income-split-config/${accountReference}`, splitConfig);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody
                }
            }
            throw new Error(response.data.responseMessage || 'Failed to update income split configuration.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }

    async deallocateReservedAccount(accountReference) {
        try {
            const response = await this.client.delete(`/api/v1/bank-transfer/reserved-accounts/${accountReference}`);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody
                }
            }
            throw new Error(response.data.responseMessage || 'Failed to deallocate reserved account')
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            }
        }
    }
    async getReservedAccountTransactions(accountReference, page = 0, size = 10) {
        try {
            const response = await this.client.get(`/api/v1/bank-transfer/reserved-accounts/transactions`, {
                headers: {
                    "Accept": "application/json"
                },
                params: {
                    accountReference,
                    page,
                    size
                }
            })
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: "success",
                    data: response.data.responseBody
                }
            }
            throw new Error(response.data.responseMessage || 'Failed to fetch transactions')
        } catch (error) {
            return {
                status: "error",
                message: error.message
            }
        }
    }

    async createInvoice(invoiceDetails) {
        try {
            const response = await this.client.post('/api/v1/invoice/create', invoiceDetails);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    invoiceDetails: response.data.responseBody
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to create invoice');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async getAllInvoices() {
        try {
            const response = await this.client.get('/api/v1/invoice/all', {
                headers: {
                    "Accept": "application/json"
                }
            });
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    invoices: response.data.responseBody.content,
                    metadata: {
                        totalElements: response.data.responseBody.totalElements,
                        totalPages: response.data.responseBody.totalPages,
                        pageSize: response.data.responseBody.size,
                        pageNumber: response.data.responseBody.number
                    }
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to fetch all invoices');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async viewInvoiceDetails(invoiceReference) {
        try {
            const response = await this.client.get(`/api/v1/invoice/${invoiceReference}/details`, {
                headers: {
                    "Accept": "application/json"
                }
            });
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    invoiceDetails: response.data.responseBody
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to fetch invoice details');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async cancelInvoice(invoiceReference) {
        try {
            const response = await this.client.delete(`/api/v1/invoice/${encodeURIComponent(invoiceReference)}/cancel`);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    invoice: response.data.responseBody
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to cancel the invoice');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async attachReservedAccountToInvoice(invoiceData) {
        try {
            const response = await this.client.post('/api/v1/invoice/create', invoiceData);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    invoice: response.data.responseBody
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to attach reserved account to the invoice');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async chargeCardToken(chargeData) {
        try {
            const response = await this.client.post('/api/v1/merchant/cards/charge-card-token', chargeData);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    chargeDetails: response.data.responseBody
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to charge card token');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async createSubAccounts(subAccountData) {
        try {
            const response = await this.client.post('/api/v1/sub-accounts', subAccountData);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    subAccounts: response.data.responseBody
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to create sub accounts');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async getSubAccounts() {
        try {
            const response = await this.client.get('/api/v1/sub-accounts');
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    subAccounts: response.data.responseBody
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to fetch sub accounts');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async updateSubAccount(updateData) {
        try {
            const response = await this.client.put('/api/v1/sub-accounts', updateData);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    subAccountDetails: response.data.responseBody
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to update sub account');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async deleteSubAccount(subAccountCode) {
        try {
            const response = await this.client.delete(`/api/v1/sub-accounts/${subAccountCode}`);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    message: response.data.responseMessage
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to delete the sub account');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async initiateRefund(data) {
        try {
            const endpoint = `/api/v1/refunds/initiate-refund`;
            const response = await this.client.post(endpoint, data);

            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }

            throw new Error(response.data.responseMessage || 'Failed to initiate refund.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async getAllRefunds() {
        try {
            const endpoint = `/api/v1/refunds`;
            const response = await this.client.get(endpoint);

            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }

            throw new Error(response.data.responseMessage || 'Failed to get all refunds.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async getRefundStatus(refundReference) {
        try {
            const endpoint = `/api/v1/refunds/${refundReference}`;
            const response = await this.client.get(endpoint);

            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }

            throw new Error(response.data.responseMessage || 'Failed to get refund status.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async getTransactionsBySettlementReference(reference, page = 0, size = 20) {
        try {
            const endpoint = `/api/v1/transactions/find-by-settlement-reference?reference=${reference}&page=${page}&size=${size}`;
            const response = await this.client.get(endpoint);

            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }

            throw new Error(response.data.responseMessage || 'Failed to get transactions by settlement reference.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async getSettlementInformationForTransaction(transactionReference) {
        try {
            const endpoint = `/api/v1/settlement-detail?transactionReference=${encodeURIComponent(transactionReference)}`;
            const response = await this.client.get(endpoint);

            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }

            throw new Error(response.data.responseMessage || 'Failed to get settlement information.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async createWallet(walletDetails) {
        try {
            const endpoint = `/api/v1/disbursements/wallet`;
            const response = await this.client.post(endpoint, walletDetails);
            
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }
            
            throw new Error(response.data.responseMessage || 'Failed to create wallet.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async getWalletBalance(accountNumber) {
        try {
            const endpoint = `/api/v1/disbursements/wallet/balance?accountNumber=${accountNumber}`;
            const response = await this.client.get(endpoint);
            
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }
            
            throw new Error(response.data.responseMessage || 'Failed to fetch wallet balance.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async getWallets(walletReference) {
        try {
            const endpoint = `/api/v1/disbursements/wallet?walletReference=${walletReference}`;
            const response = await this.client.get(endpoint);
            
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }
            
            throw new Error(response.data.responseMessage || 'Failed to fetch wallet details.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async getWalletTransactions(accountNumber) {
        try {
            const endpoint = `/api/v1/disbursements/wallet/transactions?accountNumber=${accountNumber}`;
            const response = await this.client.get(endpoint);
            
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }
            
            throw new Error(response.data.responseMessage || 'Failed to fetch wallet transactions.');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
                
    async validateBankAccount({ accountNumber, bankCode }) {
        try {
            const endpoint = `/api/v1/disbursements/account/validate?accountNumber=${accountNumber}&bankCode=${bankCode}`;
            const response = await this.client.get(endpoint);

            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }

            throw new Error(response.data.responseMessage || 'Failed to validate bank account');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async verifyBVNInfo({ bvn, name, dateOfBirth, mobileNo }) {
        try {
            const payload = {
                bvn,
                name,
                dateOfBirth,
                mobileNo
            };
            const response = await this.client.post(`/api/v1/vas/bvn-details-match`, payload);
            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    message: response.data.responseMessage
                };
            }
            throw new Error(response.data.responseMessage || 'Failed to verify BVN information');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async verifyBVNAndAccountMatch({ bankCode, accountNumber, bvn }) {
        try {
            const payload = {
                bankCode,
                accountNumber,
                bvn
            };
            const response = await this.client.post(`/api/v1/vas/bvn-account-match`, payload);

            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }

            throw new Error(response.data.responseMessage || 'Failed to verify BVN and Account match');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async getSupportedBanks() {
        try {
            const endpoint = `/api/v1/banks`;
            const response = await this.client.get(endpoint);

            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }

            throw new Error(response.data.responseMessage || 'Failed to retrieve supported banks');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    async getBanksWithUSSD() {
        try {
            const endpoint = `/api/v1/sdk/transactions/banks`;
            const response = await this.client.get(endpoint);

            if (response.data && response.data.requestSuccessful) {
                return {
                    status: 'success',
                    data: response.data.responseBody,
                    message: response.data.responseMessage
                };
            }

            throw new Error(response.data.responseMessage || 'Failed to retrieve banks with USSD short codes');
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }



}
module.exports = MonnifySDK