import {storage} from '../firebase/config'
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage'
import {v4} from 'uuid'

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
	const findAccount = accounts.find(account => account.account_address == address)
	console.log('findAccount')
	console.log(findAccount)
	if(findAccount) return;

	try {
		const requestOptions = {
		  method: 'POST',
		  headers: {
		  	"Content-Type": "application/json"
		  },
		  body: JSON.stringify({
		  	"account_address": address,
		  	"account_name": null,
		  	"account_picture": null,
		  	"account_banner": null,
		  	"account_description": null
		  })
		};

		const response = await fetch(`${URL}/api/accounts`, requestOptions)
		const json = response.json();
		return json;
	}
	catch(error) {
		console.log(error)
	}
}

export const updateAccounts = async (raw) => {
	console.log(raw)
	
	const requestOptions = {
	  method: 'PUT',
	  headers: {
	  	"Content-Type": "application/json"
	  },
	  body: JSON.stringify(raw)
	};

	const response = await fetch(`${URL}/api/accounts/${raw.account_address}`, requestOptions)
	const json = response.json();
	return json;
}

export const uploadFirebase = async (file) => {
	if(file) {
		const fileRef = ref(storage, `images/${v4()}`)
		const uploadFile = await uploadBytes(fileRef, file);
		const url = await getDownloadURL(ref(storage, uploadFile.ref._location.path_))
		return url
	}

	return null
}