import React, { useState, useEffect } from "react";
import styles from "./Chat.module.css";
import {
  init,
  useLazyQueryWithPagination,
  fetchQuery,
} from "@airstack/airstack-react";

init("29e4514124794cfba1002e869484a59e");

const Contacts = async (props) => {
  const [listConversations, setListConversations] = useState([]);
  console.log(props);
  useEffect(() => {
    const loadConversations = async () => {
      const results = await props?.loadConversations();
      const data = results.map((i, v) => {
        console.log("i ", i);
        console.log("v ", v);
        setListConversations(v);
      });
    };
    loadConversations();
  }, [listConversations]);
  console.log(listConversations);
  return <h2 className="">Hello contacts</h2>;
};

export default Contacts;
