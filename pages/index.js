import {useState, useEffect, useContext} from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/Home.module.css'
// import Logo from '../images/logo.svg';
import EthLogo from '../images/eth-logo.png';
import {ethers} from 'ethers';
import NFT from "../contracts/NFT.json";
import MarketV2 from "../contracts/NFTMarketV2.json";
import marketContractAddressV2 from "../contracts/nftmarketv2-contract-address";
import nftContractAddress from "../contracts/nft-contract-address";
import Web3Modal from "web3modal";
import { Navbar, ItemLoading } from '../components'
import { AppContext } from "../context";

const RPC_URL = process.env.NEXT_PUBLIC_JSON_RPC
const RPC_URL_KEY = process.env.NEXT_PUBLIC_JSON_RPC_KEY

export default function Home() {
  const value = useContext(AppContext);
  const { accountAddress, setAccountAddress } = value;
  const [items, setItems] = useState([])
  const [indicator, setIndicator] = useState(0)
  const [isLoadingButton, setIsLoadingButton] = useState(null);
  const [isLoading, setIsLoading] = useState(true)
  const [itemsLoading, setItemsLoading] = useState([1, 2, 3, 4])
  // const [searchField, setSearchFiled] = useState('')

  useEffect(() => {
    _fetchMarketItems()
  }, [])

  const _fetchMarketItems = async () => {
    // const _provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider();
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
      console.log(newItems)
      setItems(newItems)
      setIsLoading(false)
    }
    catch (error){
      console.log(error)
    }
  }

  const _createMarketSale = async (e, item) => {
    e.preventDefault();
    
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(marketContractAddressV2.contractAddress, MarketV2.abi, signer);

    //set the price
    const price = ethers.utils.parseUnits(item.price, 'ether');

    // //make the sale
    setIsLoadingButton(item.tokenId)
    const transaction = await marketContract.createMarketSale(item.tokenId, {value: price});

    await transaction.wait();
    await _fetchMarketItems()
    setIsLoadingButton(null)
  }

  const increaseGasLimit = (estimatedGasLimit) => {
    return estimatedGasLimit.mul(130).div(100) // increase by 30%
  }

  return (
    <div className="container">
      <div className="row mb-5">
        <div className="col-lg-12">
          <div className="card-banner p-3 p-md-5">
            <div className="row justify-content-between align-items-center">
              <div className="col-lg-6 col-md-6 order-1 order-md-0">
                <h1 className="text-white text-hero mb-4">Beautiful NFTs for everyone</h1>
                <p className="lead">NFT Market is a multi-chain marketplace that aggregates every NFT into a single platform.</p>
                <div className="d-flex">
                  <button type="button" className="btn btn-gradient px-md-5 py-3 me-2">Explore</button>
                  <Link href="/create">
                    <button type="button" className="btn btn-dark px-md-5 py-3 fw-bolder">Sell</button>
                  </Link>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 order-0 order-md-1 mb-5 mb-md-0">
                <div id="carouselExampleIndicators" className="carousel slide">
                  <div className="carousel-indicators">
                    {
                      items.map((item, index) => 
                        index < 3 &&
                        <button 
                          key={index}
                          type="button" 
                          data-bs-target="#carouselExampleIndicators" 
                          className={indicator === index ? 'active' : ''} 
                          onClick={() => setIndicator(index)}
                        />
                      )
                    }
                  </div>
                  <div className="carousel-inner">
                    {
                      items.map((item, index) => 
                        index < 3 &&
                        <div className={`carousel-item ${indicator === index ? 'active' : ''}`} key={index}>
                          <Image layout="fill" src={item.image} className="d-block w-100" alt="..." />
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12 mb-3">
          <h2 className="text-white fw-bolder">All Items</h2>
        </div>
        <div className="col-lg-12">
          <div className="row">
            {
              isLoading ?
              itemsLoading.map((item, index) =>
                <ItemLoading key={index} />
              ) :
              items.map((item, index) => 
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
                        <button 
                          type="button" 
                          className="btn btn-gradient px-4 rounded-pill w-50"
                          onClick={(e) => _createMarketSale(e, item)}
                          disabled={isLoadingButton == item.tokenId}
                        >
                          {isLoadingButton == item.tokenId ? 'Loading...' : 'BUY'}
                        </button>
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
