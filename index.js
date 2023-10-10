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
    async getReservedAccountTransactions(accountReference, page=0, size =10){
        try {
            const response = await this.client.get(`/api/v1/bank-transfer/reserved-accounts/transactions`,{
                headers: {
                    "Accept": "application/json"
                },
                params: {
                    accountReference,
                    page,
                    size
                }
            })
            if(response.data && response.data.requestSuccessful){
                return{
                    status: "success",
                    data: response.data.responseBody
                }
            }
            throw new Error(response.data.responseMessage || 'Failed to fetch transactions')
        } catch (error) {
            return{
                status:"error",
                message :  error.message
            }
        }
    }
    

}
module.exports = MonnifySDK