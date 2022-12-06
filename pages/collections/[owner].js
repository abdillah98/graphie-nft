import {useState, useEffect, useContext} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {ethers} from 'ethers';
import NFT from "../../contracts/NFT.json";
import nftContractAddress from "../../contracts/nft-contract-address";
import MarketV2 from "../../contracts/NFTMarketV2.json";
import marketContractAddressV2 from "../../contracts/nftmarketv2-contract-address";

export default function Collections({owner}) {
	
	const [itemsLoading, setItemsLoading] = useState([1, 2, 3, 4])
	const [items, setItems] = useState([])
	const [itemsCreated, setItemsCreated] = useState([])
	const [itemsListed, setItemsListed] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [tabs, setTabs] = useState(0)

	useEffect(() => {
		// _fetchMarketItems()
	  _fetchMyNFTs()
	  _fetchItemsListed()
	}, [])

	const _fetchMarketItems = async () => {
    const _provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
    const marketContract = new ethers.Contract(marketContractAddressV2.contractAddress, MarketV2.abi, _provider.getSigner(0));

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
	    const filterSeller = newItems.filter(item => item.seller.toLowerCase() == owner)
	    setItemsCreated(filterSeller)
	    setIsLoading(false)
    }
    catch (error){
    	console.log(error)
    }
  }

	const _fetchMyNFTs = async () => {
	  const _provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
	  const marketContract = new ethers.Contract(marketContractAddressV2.contractAddress, MarketV2.abi, _provider.getSigner(0));
	  
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
	  	// console.log(newItems)
	  	setItems(newItems)
	  	setIsLoading(false)
	  }
	  catch (error){
	  	console.log(error)
	  }
	}

	const _fetchItemsListed = async () => {
	  const _provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
	  const marketContract = new ethers.Contract(marketContractAddressV2.contractAddress, MarketV2.abi, _provider.getSigner(0));
	  
	  //return an array of unsold market items
	  try {
	  	const data = await marketContract.fetchItemsListed();
	  	const newListed = await Promise.all(data.map(async i => {
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

	  	console.log(newListed)
	  	setItemsListed(newListed)
	  	setIsLoading(false)
	  }
	  catch (error) {
	  	console.log(error)
	  }
	}

	return (
		<div className="container">
			<div className="row mb-4">
			  <div className="col-lg-12">
			  	<button type="button" className={`btn ${tabs === 0 ? 'btn-gradient' : 'btn-dark bg-blur'} py-2 me-2 rounded-pill`} onClick={() => setTabs(0)}>Item Created & Resell</button>
			  	<button type="button" className={`btn ${tabs === 1 ? 'btn-gradient' : 'btn-dark bg-blur'} py-2 me-2 rounded-pill`} onClick={() => setTabs(1)}>My Collections</button>
			  	{/*<button type="button" className="btn btn-gradient me-2 rounded-pill" onClick={() => setTabs(2)}>Item Resell</button>*/}
			  </div>
			</div>
			{/*<div className={`row ${tabs !== 0 ? 'd-none' : ''}`}>
			  <div className="col-lg-12 mb-3">
			    <h2 className="text-white fw-bolder">Items Created</h2>
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
              itemsCreated.length > 0 ?
              itemsCreated.map((item, index) => 
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
              ) :
              <div className="col-md-12 mb-4">
              	<p className="text-center">No items have been created yet</p>
							</div>
            }
					</div>
				</div>
			</div>*/}
			<div className={`row ${tabs !== 1 ? 'd-none' : ''}`}>
			  <div className="col-lg-12 mb-5">
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
              items.length > 0 ? 
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
              ) :
              <div className="col-md-12 mb-4">
              	<p className="text-center">No items have been collection yet</p>
							</div>
            }
					</div>
				</div>
			</div>
			<div className={`row ${tabs !== 0 ? 'd-none' : ''}`}>
 			  <div className="col-lg-12 mb-3">
 			    <h2 className="text-white fw-bolder">Items Resell</h2>
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
               itemsListed.length > 0 ?
               itemsListed.map((item, index) => 
                 <div className="col-md-6 col-lg-3 mb-4" key={index}>
                   <Link href={`/details/${item.owner}/${item.tokenId}`}>
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
               ) :
               <div className="col-md-12 mb-4">
               	<p className="text-center">No items have been resell yet</p>
 							</div>
             }
 					</div>
 				</div>
 			</div>
		</div>
	)
}

export async function getServerSideProps(context) {
	const  { owner } = context.query;
  return {
    props: {owner}, // will be passed to the page component as props
  }
}