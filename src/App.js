import React from "react";
import { onChildAdded, push, ref, set } from "firebase/database";
import { database } from "./firebase";
import logo from "./logo.png";
import "./App.css";

const DB_MESSAGES_KEY = "messages";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      messageInput: "",
      nameInput: "",
      date: "",
    };
  }
  componentDidMount() {
    const messagesRef = ref(database, DB_MESSAGES_KEY);
    onChildAdded(messagesRef, (data) => {
      this.setState((state) => ({
        messages: [...state.messages, { key: data.key, val: data.val() }],
      }));
    });
  }

  writeData = () => {
    const messageListRef = ref(database, DB_MESSAGES_KEY);
    const newMessageRef = push(messageListRef);
    set(newMessageRef, {
      name: this.state.nameInput,
      message: this.state.messageInput,
      date: new Date().toLocaleString(),
    });
    this.setState({
      nameInput: "",
      messageInput: "",
      date: "",
    });
  };

  render() {
    let messageListItems = this.state.messages.map((message) => (
      <li key={message.key}>
        <p>Name: {message.val.name}</p>
        <p>Message: {message.val.message}</p>
        <p>Date: {message.val.date}</p>
      </li>
    ));
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Name:</p>
          <input
            value={this.state.nameInput}
            onChange={(e) =>
              this.setState({
                nameInput: e.target.value,
              })
            }
          ></input>
          <p>Message:</p>
          <input
            value={this.state.messageInput}
            onChange={(e) =>
              this.setState({
                messageInput: e.target.value,
              })
            }
          ></input>
          <br />
          <button onClick={this.writeData}>Send</button>
          <ol>{messageListItems}</ol>
        </header>
      </div>
    );
  }
}

export default App;
