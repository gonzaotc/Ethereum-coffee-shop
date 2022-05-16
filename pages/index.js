import abi from "../utils/BuyMeACoffe.json";
import { ethers } from "ethers";
import Head from "next/head";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import LogoutIcon from "../components/logoutIcon";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x50d4dD484cefE91c6CD25dbe310F800410Cf5174";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState(undefined);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [coffeePrice, setCoffeePrice] = useState(undefined);
  const [memos, setMemos] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [paymentState, setPaymentState] = useState(undefined);

  const caffees = [0.001, 0.005, 0.01];

  const onNameChange = event => {
    setName(event.target.value);
  };

  const onMessageChange = event => {
    setMessage(event.target.value);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setPaymentState("to be paid");
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAccountChange = accounts => {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log("Please connect to MetaMask.");
    } else if (accounts[0] !== currentAccount) {
      console.log("useEffect - The account has changed. Now is: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    }
  };

  useEffect(() => {
    ethereum.on("accountsChanged", handleAccountChange);
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountChange);
    };
  }, []);

  // Wallet re-connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;
      // get which ethereum accounts are avaiable in this website right now.
      // eth_accounts RPC method returns an array that is either empty or contains a single account address.
      // If any, is the address of the most recently used account that the caller is permitted to access.
      const accounts = await ethereum.request({ method: "eth_accounts" });
      // window.seletedAddress is deprecated. We now use request type eth_accounts.
      console.log("accounts: ", accounts);
      if (accounts.length > 0) {
        console.log("wallet is connected!", accounts[0]);
        setCurrentAccount(accounts[0]);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  // wallet connection logic
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("please install MetaMask");
      }
      // metamask popups and asks is you want to login (eth_accounts permission.)
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("logged in!", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const disconnectWallet = async () => {
    setCurrentAccount(undefined);
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

        console.log("buying coffee..");
        setPaymentState("waiting for payment approval");
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "Anonymous",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.001") }
        );
        setPaymentState("loading payment on the blockchain...");
        await coffeeTxn.wait();
        setPaymentState("sucessfully payed!");
        console.log("mined ", coffeeTxn.hash);
        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
      setPaymentState("Payment rejected. Try Again");
    }
  };

  //Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);
        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();

        console.log("fetched memos!", memos);
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends a new memo. (subscription)
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-gradient-247 to-[#53f] from-[#05d5ff] flex flex-col items-center font-Roboto text-white text-lg">
      <Head>
        <title>Smart Coffe shop</title>
        <meta
          name="description"
          content="Crypto-coffe shop made for Alchemy roadmap to web3 with Solidity, Next.js, React.js, Ethers.js and TailwindCSS."
        />
      </Head>

      <nav className="border-b-[1px] border-borderOpacity w-full flex items-center justify-center mb-2">
        <div className="w-10/12 flex items-center justify-between my-3">
          <span className="text-2xl font-medium flex items-center justify-center">
            <span className="relative top-[3px]">
              <Image src="/icons/solidity.svg" width={34} height={32}></Image>
            </span>
            Smart Coffee
          </span>
          {!currentAccount ? (
            <button
              className="flex items-center justify-center border-2 rounded-full px-5 h-12 font-medium shadow-lg transition duration-300 hover:bg-[#53f]/10"
              onClick={connectWallet}
            >
              Sign in
              <span className="relative top-[4px] left-[2px]">
                <Image src="/images/MetaMask_Fox.svg" width={34} height={34}></Image>
              </span>
            </button>
          ) : (
            <div className="flex items-center justify-center">
              <p className="mr-4 hidden sm:flex">
                {currentAccount.slice(0, 4) + "..." + currentAccount.slice(-4)}
              </p>
              <button
                className="flex items-center justify-center border-2 rounded-full px-5 h-12 font-medium shadow-lg transition duration-300 hover:bg-[#53f]/10"
                onClick={disconnectWallet}
              >
                Sign out
                <span className="ml-2">
                  <LogoutIcon />
                </span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="h-full w-full flex items-center justify-center">
        {openModal && (
          <Modal
            className="w-[480px] h-[auto] p-7 text-black text-xl"
            handleCloseModal={handleCloseModal}
          >
            <h3 className="mb-7 text-xl font-semibold">Pay with MetaMask on Goerli testnet</h3>
            <p className="mb-7 flex items-center justify-between">
              <p>Payment State:</p>
              <p className="">{paymentState}</p>
            </p>
            {paymentState !== "sucessfully payed!" && (
              <p className="mb-7 flex items-center justify-between">
                <p>To be paid:</p>
                <p>{coffeePrice}eth</p>
              </p>
            )}

            <button
              className={`text-xl w-full bg-blue-600 text-white rounded-md shadow-lg px-4 py-3 ${
                paymentState !== "to be paid" &&
                paymentState !== "Payment rejected. Try Again" &&
                "bg-blue-300 cursor-default"
              } ${paymentState === "sucessfully payed!" && "bg-green-400"}`}
              onClick={() => {
                if (
                  paymentState === "to be paid" ||
                  paymentState === "Payment rejected. Try Again"
                ) {
                  buyCoffee(coffeePrice);
                }
              }}
            >
              {paymentState === "to be paid" && <p>Make payment</p>}
              {paymentState === "waiting for payment approval" && <p>Make payment</p>}
              {paymentState === "loading payment on the blockchain..." && <Spinner className="" />}
              {paymentState === "Payment rejected. Try Again" && <p>Make payment</p>}
              {paymentState === "sucessfully payed!" && <p>sucess</p>}
            </button>
          </Modal>
        )}

        <div className=" h-full w-10/12 grid grid-cols-1 lg:grid-cols-2 items-center justify-items-center ">
          {/* COL1 */}
          <div className="w-11/12 max-w-[450px] 2xl:max-w-[700px] h-full border-green-300 flex flex-col items-center">
            <div className="w-full flex flex-col items-center justify-center">
              <h3 className="text-3xl mb-2 2xl:mb-4">Send a coffee</h3>
              <form className="w-full flex flex-col p-5 bg-bgOpacityStrong rounded-md 2xl:py-8">
                <label className="text-lg 2xl:text-xl mb-0.5">Name</label>
                <input
                  className="w-full rounded-sm py-2 px-2 mb-2 2xl:mb-4 text-gray-700 outline-0"
                  id="name"
                  type="text"
                  placeholder="Satoshi Nakamoto"
                  onChange={onNameChange}
                />
                <label className="text-lg 2xl:text-xl mb-0.5">Add a letter</label>
                <textarea
                  className="w-full h-[4rem] 2xl: rounded-sm py-1 px-2 mb-2 2xl:mb-8 text-gray-700 resize-none outline-0"
                  rows={3}
                  placeholder="Here goes the caffeine to continue learning web3 dear dev!."
                  id="message"
                  onChange={onMessageChange}
                  required
                ></textarea>
                {currentAccount ? (
                  <>
                    <button
                      type="button"
                      className="w-full bg-orange-400/75 text-xl rounded-md shadow-lg px-4 py-2 2xl:py-3.5 mb-2 2xl:mb-3"
                      onClick={() => {
                        setCoffeePrice(caffees[0]);
                        handleOpenModal();
                      }}
                    >
                      Send a coffee for {caffees[0]}eth
                    </button>
                    <button
                      type="button"
                      className="w-full bg-orange-700/75 text-xl rounded-md shadow-lg px-4 py-2 2xl:py-3.5 mb-2 2xl:mb-3 "
                      onClick={() => {
                        setCoffeePrice(caffees[1]);
                        handleOpenModal();
                      }}
                    >
                      Send a big coffee for {caffees[1]}eth
                    </button>
                    <button
                      type="button"
                      className="w-full bg-orange-900/75 text-xl rounded-md shadow-lg px-4 py-2 2xl:py-3.5 "
                      onClick={() => {
                        setCoffeePrice(caffees[2]);
                        handleOpenModal();
                      }}
                    >
                      Send a mega coffee for {caffees[2]}eth
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="w-full bg-blue-600 text-xl rounded-md shadow-lg px-4 py-2 2xl:py-3.5 cursor-default"
                  >
                    Login to send a coffee
                  </button>
                )}
              </form>
            </div>
          </div>
          {/* COL 2 */}
          <div className="w-11/12 max-w-[700px] h-full  border-red-500 flex flex-col items-center">
            <h3 className="text-3xl mb-2 2xl:mb-4">Coffees prepared</h3>
            <div className="w-full h-full overflow-y-auto max-h-63vh 2xl:max-h-70vh no-scrollbar">
              {memos.map((memo, idx) => {
                return (
                  <div className="w-full p-4 bg-bgOpacityStrong mb-8 rounded-md" key={idx}>
                    <span className="flex items-center justify-between mb-2.5">
                      <p>{memo.name} </p>
                      <p>{new Date(memo.timestamp * 1000).toLocaleString().toString()}</p>
                    </span>
                    <p className="">
                      
                      {memo.mesage?.length > 200
                        ? '"' +  memo.message.slice(0, 200) + "..." + ""
                        : '"' + memo.message + '"'}
                      
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full h-20 bg-bgOpacity border-t-[1px] border-borderOpacity flex items-center justify-center">
        <div className="w-10/12 h-full flex items-center justify-between ">
          <span className="flex items-center justify-center text-[1.32rem]">
            powered by
            <a
              href="https://alchemy.com/?a=roadtoweb3weektwo"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center justify-center"
            >
              <Image src="/icons/alchemy.png" width={124.8} height={26.4} layout="fixed"></Image>
            </a>
          </span>
          <a
            href="https://twitter.com/gonzaotc"
            target="_blank"
            rel="noopener noreferrer"
            className="border-[1px] border-white/75 rounded-full flex items-center justify-center"
          >
            <Image src="/icons/twitter.png" width={35} height={35} layout="fixed"></Image>
          </a>
        </div>
      </footer>
    </div>
  );
}
