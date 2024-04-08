import React, { useState, useEffect } from "react";

const Contacts = (props) => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await props?.loadConversations();
        setResults(data);
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };

    fetchConversations();
  }, [props]); // Add props to the dependency array if loadConversations may change
  const handleContactSelect = (contact) => {
    console.log("contact ", contact);
    props.setSelectedContact(contact?.peerAddress);
    props.setShowContactsList(false); // Assuming setShowContactsList controls the visibility of the contact list
  };

  return (
    <div>
      {results.map((contact, index) => (
        <div
          key={index}
          onClick={() => handleContactSelect(contact)}
          style={{ cursor: "pointer" }}
        >
          <h2 className="" style={{ color: "black" }}>
            {contact?.peerAddress}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default Contacts;
