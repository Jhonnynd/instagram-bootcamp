import React, { useEffect, useState } from "react";
import { onChildAdded, push, ref, set } from "firebase/database";
import { database, storage, auth } from "./firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import logo from "./logo.png";
import "./App.css";

const DB_MESSAGES_KEY = "messages";
const STORAGE_KEY = "images/";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setmessageInput] = useState("");
  const [date, setdate] = useState("");
  const [fileInputFile, setfileInputFile] = useState(null);
  const [fileInputValue, setfileInputValue] = useState("");
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [user, setuser] = useState({});
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

  useEffect(() => {
    const messagesRef = ref(database, DB_MESSAGES_KEY);
    onChildAdded(messagesRef, (data) => {
      setMessages((prevmessages) => [
        ...prevmessages,
        { key: data.key, val: data.val() },
      ]);
    });

    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        setisLoggedIn(true);
        setuser(user);
      } else {
        setisLoggedIn(false);
        setuser({});
      }
    });
  }, []);

  const writeData = (url) => {
    const messageListRef = ref(database, DB_MESSAGES_KEY);
    const newMessageRef = push(messageListRef);

    set(newMessageRef, {
      email: email,
      message: messageInput,
      date: new Date().toLocaleString(),
      url: url,
    });

    setmessageInput("");
    setdate("");
    setfileInputFile(null);
    setfileInputValue("");
  };

  const submit = () => {
    const fullStorageRef = storageRef(
      storage,
      STORAGE_KEY + fileInputFile.name
    );

    uploadBytes(fullStorageRef, fileInputFile).then((snapshot) => {
      getDownloadURL(fullStorageRef).then((url) => {
        writeData(url);
      });
    });
  };

  const handleLogIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCred) => {
        console.log("logged in!");
        console.log(userCred.email);
      })
      .catch((err) => {
        alert(err, " - There was an error");
      });
  };

  const handleSignIn = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCred) => {
        console.log("signed in!");
        console.log(userCred);
      })
      .catch((err) => console.log(err));
  };
  const handleSignOut = () => {
    signOut(auth).then(() => {
      console.log("Signed out :(");
    });
    setemail("");
    setpassword("");
  };

  let messageListItems = messages.map((message) => (
    <li key={message.key}>
      <p>User: {message.val.email}</p>
      <p>Message: {message.val.message}</p>
      <p>Date: {message.val.date}</p>
      <span>
        {message.val.url ? (
          <img
            style={{ width: "30vw", height: "50vh", objectFit: "cover" }}
            src={message.val.url}
            alt={message.val.name}
          />
        ) : (
          "No img"
        )}
      </span>
    </li>
  ));

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        {!isLoggedIn ? (
          <>
            <input
              value={email}
              name="email"
              type="text"
              placeholder="email"
              onChange={(e) => setemail(e.target.value)}
            />
            <input
              value={password}
              name="password"
              type="text"
              placeholder="password"
              onChange={(e) => setpassword(e.target.value)}
            />
            <button onClick={handleLogIn}>Login</button>
            <button onClick={handleSignIn}>Sign Up</button>
          </>
        ) : (
          <>
            <button onClick={handleSignOut}>Sign out</button>

            <input
              placeholder="message"
              type="text"
              value={messageInput}
              onChange={(e) => setmessageInput(e.target.value)}
            ></input>
            <input
              value={fileInputValue}
              type="file"
              onChange={(e) => {
                setfileInputFile(e.target.files[0]);
                setfileInputValue(e.target.value);
              }}
            ></input>
            <br />
            <button onClick={submit}>Send</button>
          </>
        )}
        <ul>{messageListItems}</ul>
      </header>
    </div>
  );
}
