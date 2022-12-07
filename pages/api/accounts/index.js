// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
	const filePath = path.resolve('database', 'accounts.json');
	const json = fs.readFileSync(filePath);
	const { accounts } = JSON.parse(json);

	if (req.method === 'POST') {
		const id = accounts.length + 1;
		const newAccounts = {
			accounts: [...accounts, {id, ...req.body}]
		}

		fs.writeFileSync(filePath, JSON.stringify(newAccounts, null, "\t"));
	  res.status(200).json(req.body)
	}
	else {
	  res.status(200).json(accounts)
	}
}
