import { useContext, useState } from "react";
import Button from "../../Button/Button";
import PropTypes from 'prop-types';
import { AppContext } from "../../../context/AppContext";
import { sendMessage, setLastModified } from "../../../services/chats.service";

export default function ChatInput({ chatId, onChatEvent }) {
    const { userData } = useContext(AppContext);
    const [message, setMessage] = useState('');

    const sendUserMessage = async () => {
        const sender = userData.username;
        try {
            if (message === '') {
                return
            }
            await sendMessage(chatId, sender, message);
            await setLastModified(sender, chatId, message);
            await onChatEvent();
            setMessage('');
        } catch (error) {
            console.log(error.message);
        }
    }
    
    const handleChange = (e) => {
        setMessage(e.target.value);
    }

    return (
        <div>
            <form onSubmit={e => e.preventDefault()}>
                <input type="text" name="message" id="message" value={message}
                    onChange={handleChange} className="chat-message-input"/>
                <Button type='submit' onClick={sendUserMessage}
                className="btn btn-primary">send</Button>
            </form>
        </div>
    )
}

ChatInput.propTypes = {
    chatId: PropTypes.string,
    onChatEvent: PropTypes.string,
}