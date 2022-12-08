import React, { useState, useEffect, useContext } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Logo from '../images/logo.svg';
import { AppContext } from "../context";
import { useRouter } from 'next/router';
import { createAccounts } from '../helpers';

export default function Navbar() {
	const router = useRouter();
	const value = useContext(AppContext);
	const { accountAddress, setAccountAddress } = value;
	const [isShow, setIsShow] = useState(false)

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
	}, [])

	// Deteksi jika terjadi pergantian akun di metamask
  useEffect(() => {
  	const _detectChange = async () => {
  		console.log('_detectChange')
	  	if(window.ethereum) {
		    window.ethereum.on('accountsChanged', async function ([account]) {
		      setAccountAddress(account ? account : '')
		      router.push('/')
		    });
		  }
		  else {
	    	console.log('Please Install Metamask')
	    }
  	}
    _detectChange()
  }, [])

  useEffect(() => {
  	setIsShow(false)
  }, [router.pathname])

  useEffect(() => {
  	const _createAccount = async () => {
  		if(accountAddress) {
	  		await createAccounts(accountAddress)
  		}
  	}

  	_createAccount()
  }, [accountAddress])

	//Aksi koneksi ke metamask
	const _connectToWallet = async () => {
	  if (window.ethereum) {
	  	console.log('Aksi koneksi ke metamask')
	    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
	    setAccountAddress(account)
	  }
	  else {
	    console.log('Please install metamask');
	  }
	}

	return (
		<nav className={`navbar navbar-dark navbar-expand-lg px-1 mb-5 ${isShow ? 'bg-blur' : 'bg-transparent'}`}>
		  <div className="container">
		    <Link className="navbar-brand" href={`/`}>
		    	<Image src={Logo} alt="logo" />
		    	<strong className="text-white">NFT Market</strong>
		    </Link>
		    <button 
		    	className="navbar-toggler" 
		    	type="button" data-bs-toggle="collapse"
		    	onClick={() => setIsShow(!isShow)}
		    >
		      <span className="navbar-toggler-icon"></span>
		    </button>
		    <div className={`collapse navbar-collapse ${isShow ? 'show' : ''}`} id="navbarSupportedContent">
			    <form className="input-search d-flex" role="search">
	          <input 
	          	className="form-control me-2" 
	          	type="search" 
	          	placeholder="Search"
	          	// value={searchValue}
	          	// onChange={onChangeSearch}
	          />
	       	</form>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${router.patname === '/' ? 'active fw-bolder' : ''}`} aria-current="page" href={`/`}>Explore</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${router.patname === '/create' ? 'active fw-bolder' : ''}`} aria-current="page" href={`/create`}>Create</Link>
            </li>
            {
            	accountAddress &&
            	<>
	            	<li className="nav-item">
	            	  <Link className={`nav-link ${router.patname === '/collections' ? 'active fw-bolder' : ''}`} aria-current="page" href={`/collections/${accountAddress}`}>MyNFT</Link>
	            	</li>
	            	<li className="nav-item">
	            	  <Link className={`nav-link ${router.patname === '/profile' ? 'active fw-bolder' : ''}`} aria-current="page" href={`/profile/${accountAddress}`}>Profile</Link>
	            	</li>
            	</>
            }
					</ul>
					<button 
						type="button" 
						className="btn btn-gradient px-4 rounded-pill btn-connect"
						onClick={_connectToWallet}
					>
						{accountAddress ? `${accountAddress.substring(0, 4)}...${accountAddress.substring(accountAddress.length - 4, accountAddress.length)}` : 'Connect Wallet' }		
					</button>
				</div>
			</div>
		</nav>
	)
}