import React, {useState, useEffect, useCallback, useContext} from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import {useDropzone} from 'react-dropzone';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { AppContext } from "../context";
import {ethers} from 'ethers';
import NFT from "../contracts/NFT.json";
import nftContractAddress from "../contracts/nft-contract-address";
import MarketV2 from "../contracts/NFTMarketV2.json";
import marketContractAddressV2 from "../contracts/nftmarketv2-contract-address";

const projectId = '2IAVP1C1Q7Xvu3fJrtGbYSwRg7A';
const projectSecretKey = 'b59320d193e887f32062d77acdffa307';
const authorization = "Basic " + btoa(projectId + ":" + projectSecretKey);
const fileURI = 'https://graphieipfs.infura-ipfs.io/ipfs';

const client = ipfsHttpClient({
  url: "https://ipfs.infura.io:5001/api/v0",
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

	const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    const file = acceptedFiles[0]
    const filenameExt = file.name;
    const filename = file.name.split('.').slice(0, -1).join('.');
    const createUrl = URL.createObjectURL(file)
    const myFile = new File([createUrl], filenameExt);
    setImage(myFile)
    setImageUrl(createUrl)
    setForm({...form, name: filename})
  }, [])

  const {
  	getRootProps, 
  	getInputProps, 
  	isDragActive
  } = useDropzone({onDrop})

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
      await _postIdToDb(uploadJson.path, price)
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
  	const _provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
  	// const nftContract = new ethers.Contract(nftContractAddress.contractAddress, NFT.abi, _provider.getSigner(0));
  	const marketContract = new ethers.Contract(marketContractAddressV2.contractAddress, MarketV2.abi, _provider.getSigner(0));

  	//get a reference to the price entered in the form 
  	const price = ethers.utils.parseUnits(form.price, 'ether')

  	//get the listing price
  	let listingPrice = await marketContract.getListingPrice()
  	listingPrice = listingPrice.toString()

  	let transaction = await marketContract.createToken(tokenURI, price, {value: listingPrice});
  	let tx = await transaction.wait();
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
			  	    {/*<div {...getRootProps()}>
	  	          <input {...getInputProps()} />
	              <div className="dropzone-area">
	              	{
	              		imageUrl ?
		                <div className="image-drop">
		                	<Image layout="fill" src={imageUrl} alt="image-drop" />
		                </div> :
	                	<span>Drag & drop some files here, or click to select files</span>
	              	}
	              </div> 
	  	        </div>*/}
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
			  	    <div className="form-text mb-2">The description will be included on the item's detail page underneath its image. </div>
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
			  	    {isLoading ? 'Loading...' : 'Create'}
			  	  </button>
			  	</form>
				</div>
			</div>
		</div>
	)
}