import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { toast, ToastContainer } from 'react-toastify';
import { ethers } from 'ethers';
import ContractABI from "./Constant/ContractABI";
import 'react-toastify/dist/ReactToastify.css';

const BASE_SEPOLIA_CHAIN_ID = '0x14A34'; 
const CONTRACT_ADDRESS = "0x8aD3fA67Ad83D75242D6e821530711a267B9E200";
const CONTRACT_ABI = ContractABI;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [depositAmount, setDepositAmount] = useState(0);

  useEffect(() => {
    if (account) {
      checkNetwork();
      initializeContract();
    }
  }, [account]);

  const checkNetwork = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });

        if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: BASE_SEPOLIA_CHAIN_ID,
                      chainName: 'Base Sepolia',
                      nativeCurrency: {
                        name: 'Sepolia ETH',
                        symbol: 'ETH',
                        decimals: 18,
                      },
                      rpcUrls: ['https://sepolia.base.org'],
                      blockExplorerUrls: ['https://sepolia.basescan.org'],
                    },
                  ],
                });
              } catch (addError) {
                console.error('Failed to add network:', addError);
                toast.error('Failed to add Base Sepolia network to MetaMask');
              }
            } else {
              console.error('Failed to switch network:', switchError);
              toast.error('Failed to switch to Base Sepolia network');
            }
          }
        }
      } catch (error) {
        console.error('Error checking network:', error);
        toast.error('Error checking network. Please check your MetaMask connection.');
      }
    } else {
      console.error('MetaMask is not installed');
      toast.error('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const connectToMetaMask = async () => {
    if (window.ethereum) {
      setIsConnecting(true);

      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsOpen(false);
        toast.success('Wallet connected successfully', {
          position: "bottom-right",
          autoClose: 5000,
          closeOnClick: true,
          draggable: false,
          toastId: 17,
        });
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast.error('Failed to connect wallet. Please try again.');
      } finally {
        setIsConnecting(false);
      }
    } else {
      toast.error('MetaMask is not installed. Please install it to use this feature.', {
        position: "bottom-right",
        autoClose: false,
        closeOnClick: true,
        draggable: false,
        toastId: 18,
      });
    }
  };

  const initializeContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const newContract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);
      setContract(newContract);

    }
  };

  const handleDeposit = async ()=> {
    try {
      const tx = await contract.deposit({ value: ethers.parseEther(depositAmount.toString()) });
      await tx.wait();
      if (!toast.isActive('stake-success')) {
        toast.success("Payment successfully", {
          toastId: 'Successful',
          containerId: 'notification'
        });
      }
      
      setDepositAmount(0);
    }catch (error) {
      if (!toast.isActive('stake-failure')) {
        toast.error(" failed: " + error.message, {
          toastId: 'failure',
          containerId: 'notification'
        });
      }
    }
  }


  /* const handleDeposit = async () => {
    console.log('handleDeposit called');
    if (!contract) {
      console.error('Contract not initialized');
      toast.error('Contract not initialized. Please connect your wallet.');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      console.error('Invalid deposit amount');
      toast.error('Please enter a valid deposit amount.');
      return;
    }

    try {
      console.log('Attempting deposit of', depositAmount, 'ETH');
      const amountWei = ethers.parseEther(depositAmount);
      
      // Estimate gas
      const gasEstimate = await contract.deposit.estimateGas({ value: amountWei });
      console.log('Estimated gas:', gasEstimate.toString());
      
      const tx = await contract.deposit({ value: amountWei, gasLimit: gasEstimate.mul(120).div(100) });
      console.log('Transaction sent:', tx.hash);
      toast.info('Transaction sent. Waiting for confirmation...');
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.transactionHash);
      toast.success('Deposit successful!', { position: 'bottom-right' });
      
      // Reset deposit amount
      setDepositAmount('');
    } catch (error) {
      console.error('Error during deposit:', error);
      if (error.reason) {
        toast.error('Deposit failed: ' + error.reason);
      } else if (error.data && error.data.message) {
        toast.error('Deposit failed: ' + error.data.message);
      } else {
        toast.error('Deposit failed. Check console for details.');
      }
    }
  }; */

  return (
    <>
      <div className="w-full flex flex-col justify-end items-baseline h-[15vh] md:h-[20vh]">
        <button
          className="bg-transparent px-[25px] py-[10px] text-[16px] border-white border-[2px] font-[900] rounded-[10px] text-white self-end"
          onClick={() => setIsOpen(true)}
        >
          {account ? `Connected: ${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect Wallet'}
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed z-[1050] top-0 left-0 right-0 bottom-0 bg-[#00000080] flex items-center justify-center"
        >
          <section 
            className="bg-[#11141F] max-w-[400px] rounded-[10px] z-[1060] py-[16px] pb-[30px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="flex justify-center items-center h-[40px] w-[40px] rounded-full bg-[#1A1F2E] absolute top-[20px] right-[20px] cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <IoClose size={24} />
            </div>
            <section className="p-12">
              <h2 className="text-[24px] font-sans mb-6">Connect Wallet to continue</h2>
              <button
                className="w-full bg-blue-500 text-white py-2 px-4 rounded mb-2"
                onClick={connectToMetaMask}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </section>
          </section>
        </div>
      )}

      {account && (
        <div className="deposit-section">
          <h2>Deposit to BASE Contract</h2>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter amount in ETH"
          />
          <button 
            className="bg-green-500 text-white py-2 px-4 rounded" 
            onClick={handleDeposit}
            /* disabled={!contract || !depositAmount} */
          >
            Deposit
          </button>
        </div>
      )}

      <ToastContainer containerId={"networkError"} />
    </>
  );
};

export default Navbar;