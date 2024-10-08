
import React from 'react'
import Widget from 'rasa-webchat';
const Chatbot = () => {
    return (
        <Widget
          // initPayload={"/get_started"}
          socketUrl={"http://localhost:5005"}
          showMessageDate
          customData={{"language": "en"}} // arbitrary custom data. Stay minimal as this will be added to the socket
          title={"Title"}
          subtitle={"hello world"}
          // onWidgetEvent
        />
      )
}

export default Chatbot