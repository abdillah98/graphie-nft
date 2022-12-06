import {useState, useEffect, useContext} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {ethers} from 'ethers';
import NFT from "../../contracts/NFT.json";
import nftContractAddress from "../../contracts/nft-contract-address";
import MarketV2 from "../../contracts/NFTMarketV2.json";
import marketContractAddressV2 from "../../contracts/nftmarketv2-contract-address";

export default function Collections() {
	
	const [itemsLoading, setItemsLoading] = useState([1, 2, 3, 4])
	const [items, setItems] = useState([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
	  _fetchMyNFTs()
	}, [])

	const _fetchMyNFTs = async () => {
	  const _provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
	  const marketContract = new ethers.Contract(marketContractAddressV2.contractAddress, MarketV2.abi, _provider.getSigner(0));
	  
	  //return an array of unsold market items
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
	  console.log(newItems)
	  setItems(newItems)
	  setIsLoading(false)
	}

	return (
		<div className="container">
			<div className="row">
			  <div className="col-lg-12 mb-3">
			    <h2 className="text-white fw-bolder">My NFT Collections</h2>
			  </div>
			  <div className="col-lg-12">
			    <div className="row">
			    	{
			    		isLoading ?
			    		itemsLoading.map((item, index) =>
				    		<div className="col-md-6 col-lg-3 mb-4" key={index}>
				    			<div className="card-item">
				    			  <div className="card-img mb-3"></div>
				    			  <div className="text-loading mb-3 w-50"></div>
				    			  <div className="text-loading mb-2"></div>
				    			  <div className="text-loading w-25"></div>
				    			</div>
				    		</div>
			    		) :
              items.map((item, index) => 
                <div className="col-md-6 col-lg-3 mb-4" key={index}>
                  <Link href={`/my-nft/${item.owner}/${item.tokenId}`}>
                    <div className="card-item">
                      <div className="card-img">
                        <Image layout="fill" src={item.image} alt="nft-image" />
                      </div>
                      <div className="fw-bolder text-white mb-3">{item.name}</div>
                      <div className="card-price">
                        <div className="d-block ms-1">
                          <div className="text-muted">Price</div>
                          <div className="text-white fw-bolder">{item.price} ETH</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            }
					</div>
				</div>
			</div>
		</div>
	)
}