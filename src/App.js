import React from "react";
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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      messageInput: "",
      date: "",
      fileInputFile: null,
      fileInputValue: "",
      isLoggedIn: false,
      user: {},
      email: "",
      password: "",
    };
  }
  componentDidMount() {
    const messagesRef = ref(database, DB_MESSAGES_KEY);
    onChildAdded(messagesRef, (data) => {
      this.setState((state) => ({
        messages: [...state.messages, { key: data.key, val: data.val() }],
      }));
    });

    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        this.setState({
          isLoggedIn: true,
          user: user,
        });
      } else {
        this.setState({
          isLoggedIn: false,
          user: {},
        });
      }
    });
  }

  writeData = (url) => {
    const messageListRef = ref(database, DB_MESSAGES_KEY);
    const newMessageRef = push(messageListRef);

    set(newMessageRef, {
      email: this.state.email,
      message: this.state.messageInput,
      date: new Date().toLocaleString(),
      url: url,
    });

    this.setState({
      messageInput: "",
      date: "",
      fileInputFile: null,
      fileInputValue: "",
    });
  };

  submit = () => {
    const fullStorageRef = storageRef(
      storage,
      STORAGE_KEY + this.state.fileInputFile.name
    );

    uploadBytes(fullStorageRef, this.state.fileInputFile).then((snapshot) => {
      getDownloadURL(fullStorageRef).then((url) => {
        this.writeData(url);
      });
    });
  };

  handleLogIn = () => {
    signInWithEmailAndPassword(auth, this.state.email, this.state.password)
      .then((userCred) => {
        console.log("logged in!");
        console.log(userCred.email);
      })
      .catch((err) => {
        alert(err, " - There was an error");
      });
  };

  handleSignIn = () => {
    createUserWithEmailAndPassword(auth, this.state.email, this.state.password)
      .then((userCred) => {
        console.log("signed in!");
        console.log(userCred);
      })
      .catch((err) => console.log(err));
  };
  handleSignOut = () => {
    signOut(auth).then(() => {
      console.log("Signed out :(");
    });
    this.setState({
      email: "",
      password: "",
    });
  };
  render() {
    let messageListItems = this.state.messages.map((message) => (
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

          {!this.state.isLoggedIn ? (
            <>
              <input
                value={this.state.email}
                name="email"
                type="text"
                placeholder="email"
                onChange={(e) =>
                  this.setState({
                    email: e.target.value,
                  })
                }
              />
              <input
                value={this.state.password}
                name="password"
                type="text"
                placeholder="password"
                onChange={(e) =>
                  this.setState({
                    password: e.target.value,
                  })
                }
              />
              <button onClick={this.handleLogIn}>Login</button>
              <button onClick={this.handleSignIn}>Sign Up</button>
            </>
          ) : (
            <>
              <button onClick={this.handleSignOut}>Sign out</button>

              <input
                placeholder="message"
                type="text"
                value={this.state.messageInput}
                onChange={(e) =>
                  this.setState({
                    messageInput: e.target.value,
                  })
                }
              ></input>
              <input
                value={this.state.fileInputValue}
                type="file"
                onChange={(e) =>
                  this.setState({
                    fileInputFile: e.target.files[0],
                    fileInputValue: e.target.value,
                  })
                }
              ></input>
              <br />
              <button onClick={this.submit}>Send</button>
            </>
          )}
          <ul>{messageListItems}</ul>
        </header>
      </div>
    );
  }
}

export default App;
