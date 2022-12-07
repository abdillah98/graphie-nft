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

export default function MyNFT({owner, tokenId}) {
	const router = useRouter();
	const value = useContext(AppContext);
	const { accountAddress } = value;

	const [item, setItem] = useState(null)
	const [chain, setChain] = useState(null)
	const [isLoadingButton, setIsLoadingButton] = useState(false)

	useEffect(() => {
	  const fetchMyNFTs = async () => {
	    const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
	    const marketContract = new ethers.Contract(marketContractAddressV2.contractAddress, MarketV2.abi, provider.getSigner(0));
	    
	    //return an array of unsold market items
	    try {
	    	const data = await marketContract.fetchMyNFTs();
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
			  console.log(nft)
			  setItem(nft)
			  setChain(_chain)
	    }
	    catch (error) {
	    	console.log(error)
	    }
	  }

	  fetchMyNFTs()

	}, [tokenId])

	const _resellToken = async (item) => {
	  console.log(item)
	  
	  const _provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
	  const marketContract = new ethers.Contract(marketContractAddressV2.contractAddress, MarketV2.abi, _provider.getSigner(0));

	  //set the price
	  const price = ethers.utils.parseUnits(item.price.toString(), 'ether');

	  //get the listing price
	  let listingPrice = await marketContract.getListingPrice();
	  listingPrice = listingPrice.toString();

	  //make the sale
	  setIsLoadingButton(true)
	  const transaction = await marketContract.resellToken(item.tokenId, price, {
	    value: listingPrice
	  });

	  await transaction.wait();
	  setIsLoadingButton(false)
	  router.push(`/`)
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
											<span className="fw-bold text-gradient">{marketContractAddressV2.contractAddress?.substring(0, 4)}...{marketContractAddressV2.contractAddress?.substring(marketContractAddressV2.contractAddress.length - 4, marketContractAddressV2.contractAddress.length)}</span>
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
										<div className="mb-2">Set price</div>
										<input
											type="number"
											className="form-control mb-3"
											value={item.price}
											onChange={(e) => setItem({...item, price: e.target.value})}
										/>
										<button 
											type="button" 
											className="btn btn-gradient px-5 py-3 me-2 w-100"
											onClick={() =>_resellToken(item)}
											disabled={isLoadingButton}
										>
											{isLoadingButton ? 'Loading...' : 'RESELL' }
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
	const  { owner, tokenId } = context.query;
  return {
    props: {owner, tokenId}, // will be passed to the page component as props
  }
}