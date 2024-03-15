import { useContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { leaveChat, listenToChat } from "../../../services/chats.service";
import RenameChat from "../RenameChat/RenameChat";
import Button from "../../Button/Button";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import './ChatHeader.css'

export default function ChatHeader({ chatId }) {
    const { userData } = useContext(AppContext)
    const [chatInfo, setChatInfo] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const cleanup = listenToChat(chatId, setChatInfo);

        return cleanup;

    }, [chatId]);

    const leaveThisChat = async () => {
        const participant = userData.username;
        try {
            const leaveCompleted = await leaveChat(chatId, participant);
            if (leaveCompleted) {
                toast.success('You left this chat!');
                navigate('/main/chats');
            }
        } catch (error) {
            console.error(error.code);
        }
    }

    const title = chatInfo?.chatTitle;


    return (
        (!chatId) ?
            (<div></div>)
            :
            (<header className="chat-header">
                <div>
                    {
                        title ?
                            (<span>{title}</span>) :
                            (!chatInfo?.participants ?
                                (null) :
                                (chatInfo?.participants
                                    .filter((user) => user !== userData.username)
                                    .join(' '))
                            )
                    }
                </div>
                <div>
                    <Button className="btn btn-info m-2" onClick={() => setShowModal(true)}>Rename</Button>
                    <RenameChat id={chatId} show={showModal} setShow={setShowModal} />
                    <Button className="btn btn-danger m-2" onClick={leaveThisChat}> Leave chat</Button>
                    <Button className="btn btn-primary m-2" onClick={() => navigate('/main/chats/video')}>Video</Button>
                </div>

            </header>)
    )
}

ChatHeader.propTypes = {
    chatId: PropTypes.string,
}
