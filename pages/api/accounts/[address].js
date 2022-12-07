import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
	const { address } = req.query;
	const filePath = path.resolve('database', 'accounts.json');
	const json = fs.readFileSync(filePath);
	const { accounts } = JSON.parse(json);

	if (req.method === 'PUT') {
		const newAccounts = {
			accounts: accounts.map(account => (
				account.account_address === address
				? req.body : account
			))
		}

		fs.writeFileSync(filePath, JSON.stringify(newAccounts, null, "\t"));
	  res.status(200).json(req.body)
	}
	else if (req.method === 'DELETE') {
		const account = accounts.find(account => account.account_address === address)
		const newAccounts = {
			accounts: accounts.filter(account => (
				account.account_address !== address
			))
		}

		fs.writeFileSync(filePath, JSON.stringify(newAccounts, null, "\t"));
	  res.status(200).json(account)
	}
	else {
	 	const account = accounts.find(account => account.account_address === address)
  	res.status(200).json(account || null)
	}
}