import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {ethers} from 'ethers';
import NFT from "../../../contracts/NFT.json";
import nftContractAddress from "../../../contracts/nft-contract-address";
import MarketV2 from "../../../contracts/NFTMarketV2.json";
import marketContractAddressV2 from "../../../contracts/nftmarketv2-contract-address";
import { AppContext } from "../../../context";
import { SingleItemLoading } from "../../../components";

const RPC_URL = process.env.NEXT_PUBLIC_JSON_RPC
const RPC_URL_KEY = process.env.NEXT_PUBLIC_JSON_RPC_KEY

export default function Details({contract, tokenId}) {
	const router = useRouter();
	const value = useContext(AppContext);
	const { accountAddress } = value;

	const [item, setItem] = useState([])
	const [chain, setChain] = useState(null)
	const [isLoadingButton, setIsLoadingButton] = useState(false)

	useEffect(() => {
	  const _fetchMarketItems = async () => {
	    const provider = new ethers.providers.JsonRpcProvider(`${RPC_URL}/${RPC_URL_KEY}`);
	    const marketContract = new ethers.Contract(marketContractAddressV2.contractAddress, MarketV2.abi, provider);
	    
	    //return an array of unsold market items
	    try {
  	    const data = await marketContract.fetchMarketItems();
  		  const newItems = await Promise.all(data.map(async i => {
  		    const tokenUri = await marketContract.tokenURI(i.tokenId);
  		    const response = await fetch(tokenUri);
  		    const metadata = await response.json();
  		    const price = ethers.utils.formatUnits(i.price.toString(), 'ether')
  		    const item = {
  		      price,
  		      tokenId: i.tokenId.toNumber(),
  		      seller: i.seller,
  		      owner: i.owner,
  		      image: metadata.image,
  		      name: metadata.name,
  		      description: metadata.description,
  		    }
  		    return item;
  		  }));

  		  const nft = newItems.find(item => item.tokenId == tokenId )
  		  const _chain = await provider.getNetwork();
  		  setItem(nft)
  		  setChain(_chain)
	    }
	    catch (error) {
	    	console.log(error)
	    }

	  }

	  _fetchMarketItems()

	}, [tokenId])

	const _createMarketSale = async (item) => {
	  console.log(item)
	  
	  const _provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
	  const marketContract = new ethers.Contract(marketContractAddressV2.contractAddress, MarketV2.abi, _provider.getSigner(0));

	  //set the price
	  const price = ethers.utils.parseUnits(item.price.toString(), 'ether');

	  //make the sale
	  setIsLoadingButton(true)
	  const transaction = await marketContract.createMarketSale(item.tokenId, {
	    value: price
	  });

	  await transaction.wait();
	  setIsLoadingButton(false)
	  router.push(`/collections/${accountAddress}`)
	}

	return (
		<div className="container">
      <div className="row justify-content-center mb-5">
				<div className="col-lg-10">
					{
						item && chain ?
						<div className="row">
							<div className="col-lg-6">
								<div className="single-image mb-4">
									<Image layout="fill" src={item.image} alt={item.name} />
								</div>
							</div>
							<div className="col-lg-6">
								<h1 className="text-white">{item.name}</h1>
								<div className="text-white fw-bolder mb-4">
									<span>Owned by </span>
									<span className="text-gradient" title={item.owner}>
										{item.owner?.substring(0, 4)}...{item.owner?.substring(item.owner.length - 4, item.owner.length)}
									</span>
								</div>
								<div className="card-collapse mb-4">
									<div className="card-collapse-head text-white fw-bolder">
										Description
									</div>
									<div className="card-collapse-content">
										{item.description}
									</div>
								</div>
								<div className="card-collapse mb-4">
									<div className="card-collapse-head text-white fw-bolder">
										Details
									</div>
									<div className="card-collapse-content">
										<div className="d-flex justify-content-between">
											<span>Contract Address</span>
											<span className="fw-bold text-gradient" title={contract}>{contract?.substring(0, 4)}...{contract?.substring(contract.length - 4, contract.length)}</span>
										</div>
										<div className="d-flex justify-content-between">
											<span>Token ID</span>
											<span className="fw-bold text-gradient">{tokenId}</span>
										</div>
										<div className="d-flex justify-content-between">
											<span>Token Standard</span>
											<span className="fw-bold text-gradient">ERC-721</span>
										</div>
										<div className="d-flex justify-content-between">
											<span>Chain Name</span>
											<span className="fw-bold text-gradient">{chain.name}</span>
										</div>
										<div className="d-flex justify-content-between">
											<span>Chain ID</span>
											<span className="fw-bold text-gradient">{chain.chainId}</span>
										</div>
									</div>
								</div>
								<div className="card bg-blur border-0">
									<div className="card-body">
										<div>Current price</div>
										<h2 className="text-white mb-3">{item.price} ETH</h2>
										<button 
											type="button" 
											className="btn btn-gradient px-5 py-3 me-2 w-100"
											onClick={() =>_createMarketSale(item)}
											disabled={isLoadingButton}
										>
											{isLoadingButton ? 'Loading...' : 'BUY NOW' }
										</button>
									</div>
								</div>
							</div>
						</div> :
						<SingleItemLoading />
					}
				</div>
			</div>
		</div>
	)
}

export async function getServerSideProps(context) {
	const  { contract, tokenId } = context.query;
  return {
    props: {contract, tokenId}, // will be passed to the page component as props
  }
}