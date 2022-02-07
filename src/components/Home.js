/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'

import WalletBalance from './WalletBalance'
import MyToken from '../artifacts/contracts/MyToken.sol/MyToken.json'
import placeholder from './placeholder.jpg'

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const provider = new ethers.providers.Web3Provider(window.ethereum)

// get the end user
const signer = provider.getSigner()

// get the smart contract
const contract = new ethers.Contract(contractAddress, MyToken.abi, signer)


function Home() {

  const [totalMinted, setTotalMinted] = useState(0)
  useEffect(() => {
    getCount()
  }, [])

  const getCount = async () => {
    console.log(contract)
    const count = await contract.count()
    console.log('asd')
    console.log(parseInt(count))
    setTotalMinted(parseInt(count))
  }

  return (
    <div>
      <WalletBalance />

      {Array(totalMinted + 1)
        .fill(0)
        .map((_, i) => (
          <div key={i}>
            <NFTImage tokenId={i} getCount={getCount} />
          </div>
        ))}
    </div>
  )
}

function NFTImage({ tokenId, getCount }) {
  const contentId = 'QmNck2Tq7o227cGjm3Fs2hPzdJn9bKcC7FMrguWGL8Fbzf'
  const metadataURI = `${contentId}/${tokenId}.json`
  const imageURI = `https://gateway.pinata.cloud/ipfs/${contentId}/${tokenId}.png`

  const [isMinted, setIsMinted] = useState(false)

  useEffect(() => {
    getMintedStatus()
  }, [isMinted])

  const getMintedStatus = async () => {
    const result = await contract.isContentOwned(metadataURI)
    console.log(result)
    setIsMinted(result)
  }

  const requestMetamask = async (method) => {
    return await window.ethereum.request({ method })
  }

  const mintToken = async () => {
    const [account] = await requestMetamask('eth_requestAccounts')
    console.log(account)
    const result = await contract.payToMint(account, metadataURI, {
      value: ethers.utils.parseEther('0.05'),
    })

    await result.wait()
    getMintedStatus()
    getCount()
  }

  async function getURI() {
    const uri = await contract.tokenURI(tokenId)
    alert(uri)
  }
  return (
    <div>
      <img src={isMinted ? imageURI : placeholder}></img>
      <h5>ID #{tokenId}</h5>
      {!isMinted ? (
        <button onClick={mintToken}>
          Mint
        </button>
      ) : (
        <button onClick={getURI}>
          Taken! Show URI
        </button>
      )}
    </div>
  )
}

export default Home
