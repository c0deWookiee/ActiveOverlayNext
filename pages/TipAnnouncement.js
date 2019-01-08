import React from 'react';
import styled from 'styled-components';
import WebSocket from 'isomorphic-ws';


class TipAnnouncement extends React.Component {
  constructor(props) {
    super(props);

    this.connectToChatServer = this.connectToChatServer.bind(this);
  }

  connectToChatServer() {
    //establish a new websocket
    let chatServer = new WebSocket(
      "wss://testbed-chat.stream.highwebmedia.com:8443/ws/751/4fnhi3dy/websocket"
    );

    //when the connection is opened called this function
    chatServer.onopen = event => {
      console.log("Connection to remote chatServer is open!", event);
    };

    chatServer.onerror = event => {
      console.log("Error with connection to remote chatServer", event);
    };

    chatServer.onclose = event => {
      console.log("Connection to remote chatServer closed!", event);
    };

    chatServer.onmessage = event => {
      // console.log('New message from remote chatSever: ', event);
      if (event.data === "o") {
        console.log("READY FOR AUTH!");
        //authData lets us join the correct room so we can get all the messages
        let authData = JSON.stringify([
          '{"method":"connect","data":{"user":"__anonymous__hsiHa82nah0","password":"anonymous","room":"activeoverlay","room_password":""}}'
        ]);
        //send the authData to the server
        chatServer.send(authData);
      } else if (event.data[0] === "a") {
        let newString = event.data.substr(1);
        let newData = JSON.parse(newString);
        let finalData = JSON.parse(newData[0]);
        if (finalData.method === "onAuthResponse") {
          chatServer.send(
            JSON.stringify([
              '{"method":"joinRoom","callback":1,"data":{"room":"activeoverlay"}}'
            ])
          );
        } else if (finalData.method === "onRoomMsg") {
          let data = JSON.parse(finalData.args[1]);
          console.log("New user message: " + data.m);
        } else if (finalData.method === "onNotify") {
          let tipData = JSON.parse(finalData.args[0]);
          console.log("This is finaldata ", tipData);
          let currentTipQueue = this.state.tipQueue;
          currentTipQueue.push(tipData);
          this.setState({ tipQueue: currentTipQueue });
        }
      }
    };
  }
}

export default TipAnnouncement;