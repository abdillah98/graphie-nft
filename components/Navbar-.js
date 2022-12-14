import React, { useState, useEffect, useContext } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Logo from '../images/logo.svg';
import { AppContext } from "../context";
import { useRouter } from 'next/router';
import { createAccounts } from '../helpers';

export default function Navbar({searchValue, onChangeSearch}) {
	const router = useRouter();
	const value = useContext(AppContext);
	const { accountAddress, setAccountAddress } = value;
	const [isShow, setIsShow] = useState(false)

	// useEffect(() => {
	// 	const _ = async () => {
	// 		console.log('object')
	// 		await createAccounts('0xf251efdfb0d3b196bf04e30ef88574eac2cbb3e5')
	// 	}
	// 	_()
	// }, [])
	
	//Ambil akun pertama di metamask saat awal pemuatan atau saat reload halaman
	useEffect(() => {
	  const _getAcccount = async () => {
	    if(window.ethereum) {
	    	const [account] = await window.ethereum.request({ method: 'eth_accounts' });
	    	setAccountAddress(
	    	  account ? account : ''
	    	)
	    }
	    else {
	    	console.log('Please Install Metamask')
	    }
	  }
	  _getAcccount()
	}, [setAccountAddress])

	// Deteksi jika terjadi pergantian akun di metamask
  useEffect(() => {
  	const _detectChange = async () => {
  		console.log('_detectChange')
	  	if(window.ethereum) {
		    window.ethereum.on('accountsChanged', async function ([account]) {
		    	await createAccounts(account)
		      setAccountAddress(account ? account : '')
		    	router.push(`/collections/${account}`)
		    });
		  }
		  else {
	    	console.log('Please Install Metamask')
	    }
  	}
    _detectChange()
  }, [setAccountAddress])

	//Aksi koneksi ke metamask
	const _connectToWallet = async () => {
	  if (window.ethereum) {
	    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
	    await createAccounts(account)
	    setAccountAddress(account)
	  }
	  else {
	    console.log('Please install metamask');
	  }
	}


	return (
		<nav className="navbar mb-5">
		  <div className="container">
		    <div className="d-flex w-100 align-items-center justify-content-between">
		      <div className="d-flex align-items-center">
		        <Image src={Logo} alt="logo" />
		        <h5 className="text-white fw-bolder ms-2">NFT Market</h5>
		      </div>
	        <input 
	          id="search" 
	          type="text" 
	          className="form-control " 
	          placeholder="Search..."
	          value={searchValue}
	          onChange={onChangeSearch}
	        />
		      <div className="d-flex align-items-center">
		        <ul className="menu">
		          <li className="menu-item">
		          	<Link className="text-reset" href="/">Explore</Link>
		          </li>
		          <li className="menu-item">
		          	<Link className="text-reset" href="/create">Create</Link>
		          </li>
		          {
		          	accountAddress &&
			          <li className="menu-item">	
			          	<Link className="text-reset" href={`/collections/${accountAddress}`}>MyNFT</Link>
			          </li>
		          }
		        </ul>
		      </div>
		      <button 
		      	type="button" 
		      	className="btn btn-gradient px-4 rounded-pill"
		      	onClick={_connectToWallet}
		      >
		      	{accountAddress ? `${accountAddress.substring(0, 4)}...${accountAddress.substring(accountAddress.length - 4, accountAddress.length)}` : 'Connect Wallet' }		
		      </button>
		    </div>
		  </div>
		</nav>
	)
}