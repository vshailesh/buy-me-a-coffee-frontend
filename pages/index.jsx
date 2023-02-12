import abi from "../utils/BuyMeACoffee.json";
import { ethers } from "ethers";
import Head from "next/head";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x76AB81993C8D378445463bD96fBE6942026E949F";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);
  const [newWalletAddress, setNewWalletAddress] = useState("");

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const onAddressChange = (event) => {
    setNewWalletAddress(event.target.value);
  };

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const SetNewWalletAddress = async () => {
    try {
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        console.log("Wallet is connected");
        console.log(
          `Changing owner address from ${accounts[0]} to ${newWalletAddress}`
        );
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const signer = provider.getSigner();

        const changeAddrTxn = await buyMeACoffee.updateWithdrawalAddress(
          accounts[0],
          newWithdrawalAddress
        );
        await changeAddrTxn.wait();
        console.log(`New Withdrawal Address is set ${changeAddreTxn.hash}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..");
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.001") }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
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

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
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
  }, [getMemos, contractABI]);

  return (
    <div>
      <Head>
        <title>Buy Me a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center font-normal">
        <h1 className="text-black font-bold text-2xl md:text-8xl">
          Buy Me a Coffee!
        </h1>

        {currentAccount ? (
          <div className="bg-gradient-to-b from-white to-slate-300">
            <form>
              <div>
                <label>Name</label>
                <br />

                <input
                  id="name"
                  type="text"
                  placeholder="Please enter you name"
                  onChange={onNameChange}
                  className="px-2 border-2 border-stone-900 rounded-md"
                />
              </div>
              <br />
              <div>
                <label>Send Me a message</label>
                <br />

                <textarea
                  rows={3}
                  placeholder="Drop a message for me!"
                  id="message"
                  onChange={onMessageChange}
                  required
                  className="px-2 border-2 border-stone-900 rounded-md"
                ></textarea>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={buyCoffee}
                  className="hover:scale-110 duration-300 px-1 bg-gradient-to-br from-cyan-200 to-blue-400 rounded-md"
                >
                  Send 1 Coffee for 0.001ETH
                </button>
              </div>

              <div>
                <span className="px-4">
                  <label htmlFor="newWalletAddress">
                    {" "}
                    Enter New Wallet Address
                  </label>
                </span>
                <input
                  id="newWalletAddress"
                  type="text"
                  name="newWalletAddress"
                  placeholder="0x667...879"
                  onChange={onAddressChange}
                  className="px-2 border-2 border-stone-900 rounded-md"
                />

                <div className="py-2">
                  <button
                    onClick={SetNewWalletAddress}
                    className="hover:scale-110 duration-300 px-1 bg-gradient-to-br from-cyan-200 to-blue-400 rounded-md"
                  >
                    {" "}
                    Change Withdrawal Address{" "}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-48">
            <button
              className="px-4 py-2 rounded-md bg-gradient-to-tr from-black to-slate-400 text-white hover:scale-105 duration-200"
              onClick={connectWallet}
            >
              {" "}
              Connect your wallet{" "}
            </button>
          </div>
        )}
      </div>
      <div className="text-center bg-gradient-to-b from-slate-300 to-white">
        <div className="mx-0 sm:mx-2">
          {currentAccount && <h1>Memos received</h1>}

          {currentAccount &&
            memos.map((memo, idx) => {
              return (
                <div
                  key={idx}
                  className="py-2 px-2 border-2 border-stone-900 rounded-md"
                >
                  <p className="font-bold">{memo.message}</p>
                  <p>
                    From: {memo.name} at {memo.timestamp.toString()}
                  </p>
                </div>
              );
            })}
        </div>
      </div>

      <div className="w-full h-screen bg-gradient-to-b from-white to-slate-300 ">
        <p className="text-center py-12">Created by Shailesh Vashishth</p>
      </div>
    </div>
  );
}
