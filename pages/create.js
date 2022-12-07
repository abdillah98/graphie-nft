import React, {useState, useEffect, useCallback, useContext} from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { AppContext } from "../context";
import {ethers} from 'ethers';
import NFT from "../contracts/NFT.json";
import nftContractAddress from "../contracts/nft-contract-address";
import MarketV2 from "../contracts/NFTMarketV2.json";
import marketContractAddressV2 from "../contracts/nftmarketv2-contract-address";
import Web3Modal from "web3modal";

const env = process.env.NODE_ENV
const projectId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
const projectSecretKey = process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET_KEY;
const authorization = "Basic " + btoa(projectId + ":" + projectSecretKey);
const fileURI = process.env.NEXT_PUBLIC_INFURA_IPFS_FILE_URL;

const client = ipfsHttpClient({
  url: process.env.NEXT_PUBLIC_INFURA_API_URL,
  headers: {
    authorization,
  },
});

export default function Create() {
	const router = useRouter();
	const value = useContext(AppContext);
	const { accountAddress, setAccountAddress } = value;

	const [image, setImage] = useState('')
	const [imageUrl, setImageUrl] = useState('');
	const [form, setForm] = useState({name: '', description: '', price: ''});
	const [isLoading, setIsLoading] = useState(false);
	const [jsonFile, setJsonFile] = useState('')
	const [isError, setIsError] = useState(false)

  const _postIdToDb = async (id, price) => {
  	var raw = JSON.stringify({id, price});

  	var requestOptions = {
  	  method: 'POST',
  	  headers: {
  	  	"Content-Type": "application/json"
  	  },
  	  body: raw
  	};

  	const response = await fetch("http://localhost:3004/metadata", requestOptions);
  	const json = await response.json();
  	console.log(json);
  }

  const _uploadMetadata = async () => {
    const { name, description, price } = form;

    if(!image || !name || !description) {
      alert('Image, name or description not empty');
      return;
    }
    if(!accountAddress) {
    	alert('Please click connect to Metamask');
    	return;
    }

    try{ //try uploading the file
      setIsLoading(true)

      const uploadImage = await client.add(image)
      
      // file saved in the url path below
      const imageUrl = `${fileURI}/${uploadImage.path}`;
      const data = JSON.stringify({
          name, description, image: imageUrl
      });

      const uploadJson = await client.add(data);
      const jsonUrl = `${fileURI}/${uploadJson.path}`;

      // Save id path to local db
      if (env == 'development') {
      	await _postIdToDb(uploadJson.path, price)
	    }

      await _createMarketItem(jsonUrl)
      setJsonFile(jsonUrl)
      setIsLoading(false)
      router.push('/')
    }
    catch(e){
        console.log('Error uploading file: ', e)
    }
  }

  const _createMarketItem = async (tokenURI) => {
  	// const _provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
  	const web3Modal = new Web3Modal();
  	const connection = await web3Modal.connect();
  	const provider = new ethers.providers.Web3Provider(connection);

  	const signer = provider.getSigner();
  	const marketContract = new ethers.Contract(marketContractAddressV2.contractAddress, MarketV2.abi, signer);

  	try {
  		//get a reference to the price entered in the form 
  		const price = ethers.utils.parseUnits(form.price, 'ether')

  		//get the listing price
  		let listingPrice = await marketContract.getListingPrice()
  		listingPrice = listingPrice.toString()

  		let transaction = await marketContract.createToken(tokenURI, price, {value: listingPrice});
  		let tx = await transaction.wait();
  	}
  	catch (error) {
  		console.log(error)
  		setIsError(!isError)
  	}
  }

	return (
		<div className="container">
		  <div className="row justify-content-center mb-5">
			  <div className="col-lg-6 mb-5">
			  	<h1 className="fw-bolder text-white mb-4">Create New Item</h1>
			  	<form>
			  	  <div className="mb-3">
			  	    <label 
			  	      htmlFor="image" 
			  	      className="form-label fw-bold text-white"
			  	    >
			  	      Image <span className="text-danger">*</span>
			  	    </label>
			  	    <div className="form-text mb-2">File types supported: JPG, PNG, GIF, SVG, MP4, WEBM. Max size: 100 MB</div>
			  	    <input 
			  	      type="file" 
			  	      className="form-control" 
			  	      id="image" 
			  	      onChange={(e) => setImage(e.target.files[0])}
			  	    />
			  	  </div>
			  	  <div className="mb-3">
				  	  <div className="row">
					  	  <div className="col">
					  	    <label 
					  	      htmlFor="name" 
					  	      className="form-label fw-bold text-white"
					  	    >
					  	      Name <span className="text-danger">*</span>
					  	    </label>
					  	    <div className="form-text mb-2">The name will be included as nft name. </div>
					  	    <input 
					  	      type="text" 
					  	      className="form-control" 
					  	      id="name" 
					  	      placeholder="beauty nft..."
					  	      value={form.name}
					  	      onChange={(e) => setForm({...form, name: e.target.value})}
					  	    />
					  	  </div>
					  	  <div className="col">
					  	    <label 
					  	      htmlFor="price" 
					  	      className="form-label fw-bold text-white"
					  	    >
					  	      Price <span className="text-danger">*</span>
					  	    </label>
					  	    <div className="form-text mb-2">The name will be included as nft name. </div>
					  	    <input 
					  	      type="number" 
					  	      className="form-control" 
					  	      id="price" 
					  	      placeholder="beauty nft..."
					  	      value={form.price}
					  	      onChange={(e) => setForm({...form, price: e.target.value})}
					  	    />
					  	  </div>
				  	  </div>
			  	  </div>
			  	  <div className="mb-3">
			  	    <label 
			  	      htmlFor="description" 
			  	      className="form-label fw-bold text-white"
			  	    >
			  	      Description <span className="text-danger">*</span>
			  	    </label>
			  	    <div className="form-text mb-2">The description will be included on the items detail page underneath its image. </div>
			  	    <textarea 
			  	      className="form-control" 
			  	      id="description" 
			  	      placeholder="description here..." 
			  	      rows="3"
			  	      value={form.description} 
			  	      onChange={(e) => setForm({...form,  description: e.target.value})}
			  	    />
			  	  </div>
			  	  <button 
			  	    type="button" 
			  	    className="btn btn-gradient px-4"
			  	    onClick={_uploadMetadata}
			  	    disabled={isLoading}
			  	  >
			  	    {isLoading ? 
			  	    <span>Loading...</span> :
			  	    <span>Create</span>
			  	  	}
			  	  </button>
			  	</form>

					{
						isError &&
						<div className="alert-bottom">
							<div className="w-100">
								<strong className="text-danger">Failed!</strong>
								<div className="text-reset">There is an error. try again later</div>
							</div>
							<button className="btn-close bg-white" onClick={() => setIsError(!isError)} />
						</div>
					}
				</div>
			</div>
		</div>
	)
}