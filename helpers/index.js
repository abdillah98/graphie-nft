const env = process.env.NODE_ENV
const DEV_URL= process.env.NEXT_PUBLIC_DEV_URL;
const PROD_URL= process.env.NEXT_PUBLIC_PROD_URL;
const URL = env === 'development' ? DEV_URL : PROD_URL;

export const getAccounts = async () => {
	const requestOptions = {
	  method: 'GET',
	  headers: {
	  	"Content-Type": "application/json"
	  }
	};

	const response = await fetch(`${URL}/api/accounts`, requestOptions)
	const json = response.json();
	return json;
}

export const getAccount = async (address) => {
	const requestOptions = {
	  method: 'GET',
	  headers: {
	  	"Content-Type": "application/json"
	  }
	};

	const response = await fetch(`${URL}/api/accounts/${address}`, requestOptions)
	const json = response.json();
	return json;
}

export const createAccounts = async (address) => {
	const accounts = await getAccounts()
	const findAccount = accounts.find(account => account.account_address === address)
	
	if(findAccount) return;

	const requestOptions = {
	  method: 'POST',
	  headers: {
	  	"Content-Type": "application/json"
	  },
	  body: JSON.stringify({
	  	"account_address": address,
	  	"account_name": null,
	  	"account_picture": null,
	  	"account_banner": null
	  })
	};

	const response = await fetch(`${URL}/api/accounts`, requestOptions)
	const json = response.json();
	return json;
}