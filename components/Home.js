import { ConnectWallet, useAddress, useSigner } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";

import Chat from "../components/Chat.js";
import { useEffect, useRef, useState } from "react";
import { Client } from "@xmtp/xmtp-js";
import Contacts from "../components/Contacts.js";
import Image from "next/image.js";
const TEST_ADDRESS = "0x3eCf3AfB79c161bAa5e3a810a38ffBfD62E9c422";
const BOT_ADDRESS = "0x937C0d4a6294cdfa575de17382c7076b579DC176";

import { loadKeys, storeKeys } from "./helpers";
const Home = () => {
  const [message, setMessage] = useState(null);
  const converseRef = useRef(null);
  const clientRef = useRef(null);
  const address = useAddress();
  const signer = useSigner();
  const isConnected = !!signer;
  const [isOnNetwork, setIsOnNetwork] = useState(false);
  const [showContactsList, setShowContactsList] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const clientOptions = {
    env: "production",
  };
  const getKeysFromStore = async () => {
    let keys = loadKeys(selectedContact);
    if (!keys) {
      keys = await Client.getKeys(signer, {
        ...clientOptions,
        // we don't need to publish the contact here since it
        // will happen when we create the client later
        skipContactPublishing: true,
        // we can skip persistence on the keystore for this short-lived
        // instance
        persistConversations: false,
      });
      storeKeys(selectedContact, keys);
    }
    return keys;
  };

  //Function to load the existing messages in a conversation
  const newConversation = async function (xmtp_client, addressTo) {
    console.log("addressTo ", addressTo);
    //create a new conversation with the address
    if (await xmtp_client?.canMessage(addressTo)) {
      const conversation = await xmtp_client.conversations.newConversation(
        addressTo
      );
      converseRef.current = conversation;
      //Loads the messages of the conversation
      const message = await conversation.messages();
      setMessage(message);
    } else {
      alert(
        "The contact you searched for can't be messaged because they are not on the xmtp network"
      );
    }
  };

  //Load all conversation
  const loadConversations = async () => {
    const conversations = await clientRef.current.conversations.list();
    return conversations;
  };
  //Function to initialize the xmtp client
  const initXMTP = async function () {
    const startConversation = async (contactToInit) => {
      const keys = await getKeysFromStore();
      console.log("keys ", keys);
      console.log("clientOptions ", clientOptions);
      const xmtp = await Client.create(null, {
        ...clientOptions,
        privateKeyOverride: keys,
      });
      //Create or load conversation with Gm bot
      newConversation(xmtp, contactToInit.address);
      //Set the XMTP client in state foe later use
      setIsOnNetwork(!!xmtp.address);
      //Set the client in the ref
      clientRef.current = xmtp;
    };
    //Check selected contact
    if (selectedContact) {
      startConversation(selectedContact);
    } else {
      startConversation({ address: BOT_ADDRESS });
    }
  };

  useEffect(() => {
    if (isOnNetwork && converseRef.current) {
      //Function to stream new messages in the conversation
      const streamMessages = async () => {
        const newStream = await converseRef.current.streamMessages();
        for await (const msg of newStream) {
          const exists = message.find((m) => {
            m.id === msg.id;
          });
          if (!exists) {
            setMessage((prevMessage) => {
              const messageNew = [...prevMessage, msg];
              return messageNew;
            });
          }
        }
      };
      streamMessages();
      loadConversations();
    }
  }, [message, isOnNetwork]);

  useEffect(() => {
    const startConversation = async () => {
      const keys = await getKeysFromStore();
      const xmtp = await Client.create(null, {
        ...clientOptions,
        privateKeyOverride: keys,
      });
      //Create or load conversation with Gm bot
      newConversation(xmtp, selectedContact);
      //Set the xmtp client in state for later use
      setIsOnNetwork(!!xmtp.address);
      //Set the client in the ref
      clientRef.current = xmtp;
    };

    if (selectedContact) {
      startConversation();
    }
  }, [selectedContact]);

  console.log("selectedContact ", selectedContact);
  return (
    <div className={styles.Home}>
      {/* Display the ConnectWallet component if not connected */}
      {!isConnected && (
        <div className={styles.thirdWeb}>
          <Image
            src="../public/thirdweb.svg"
            alt="Your image description"
            width={200}
            height={200}
          />
          <ConnectWallet theme="dark" />
        </div>
      )}
      {/* Display XMTP connection options if connected but not initialized */}
      {isConnected && !isOnNetwork && (
        <div className={styles.xmtp}>
          <ConnectWallet theme="light" />
          <button onClick={initXMTP} className={styles.btnXmtp}>
            Connect to XMTP
          </button>
        </div>
      )}
      {/* Render the Chat component if connected, initialized, and messages exist */}
      {isConnected && isOnNetwork && message && !showContactsList ? (
        <Chat
          client={clientRef.current}
          conversation={converseRef.current}
          messageHistory={message}
          selectedContact={selectedContact}
          setShowContactList={setShowContactsList}
        />
      ) : (
        isConnected &&
        isOnNetwork &&
        message && (
          <Contacts
            loadConversations={loadConversations}
            setSelectedContact={setSelectedContact}
            setShowContactsList={setShowContactsList}
          />
        )
      )}
    </div>
  );
};

export default Home;
