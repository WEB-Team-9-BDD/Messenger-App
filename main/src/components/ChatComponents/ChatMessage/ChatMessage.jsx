import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { AppContext } from "../../../context/AppContext";
import { deleteMessage, editMessage, setLastModified } from '../../../services/chats.service';
import Button from '../../Button/Button';
import { Modal } from "react-bootstrap";
import toast from 'react-hot-toast';
import './ChatMessage.css';

export default function ChatMessage({ chatId, message }) {
    const { userData } = useContext(AppContext);
    const [inEditMode, setInEditMode] = useState(false);
    const [messageToEdit, setMessageToEdit] = useState(message.message);
    const [textareaHeight, setTextareaHeight] = useState(60);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const makeLinkMessage = (message) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return message.split(urlRegex).map((part, index) => {
            if (part.match(urlRegex)) {
                return <a key={index} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
            }
            return part;
        });
    };

    const handleChange = (e) => {
        setMessageToEdit(e.target.value);
    }

    const handleEdit = () => {
        setInEditMode(!inEditMode);
        setMessageToEdit(message.message);
    }

    const handleDelete = async () => {
        setShowDeleteModal(true);
    }

    const handleDeleteConfirm = async () => {
        try {
            await deleteMessage(chatId, message.id);
            await setLastModified(userData.username, chatId, 'Deleted message');
            toast.success('Message deleted.');
            setShowDeleteModal(false);
        } catch (error) {
            toast.error(error.code);
        }
    }

    const editMessageContent = async () => {
        try {
            await editMessage(chatId, message, messageToEdit);
            await setLastModified(userData.username, chatId, messageToEdit)
            setInEditMode(!inEditMode);
        } catch (error) {
            console.log(error.message);
        }
    }

    return (
        <div>
            {inEditMode ?
                (
                    <div className="edit-message">
                        <textarea key={message.id} className="edit-chat-message"
                            value={messageToEdit} onChange={handleChange}
                            style={{ height: `${textareaHeight}px` }}
                            onInput={(e) => setTextareaHeight(e.target.scrollHeight)} />
                        <Button onClick={editMessageContent}>Save</Button>
                        <Button onClick={handleEdit}>Cancel</Button>
                    </div>
                )
                :
                (<div className='my-message'>
                    <span>{makeLinkMessage(message.message)}</span>
                </div>
                )
            }
            {userData.username === message.author ?
                (<div>
                    <Button className='btn btn-primary ms-2' onClick={handleEdit}>edit</Button>
                    <Button className='btn btn-primary ms-2' onClick={handleDelete}>delete</Button>
                </div>
                )
                :
                (null)
            }
            <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <Modal.Body>
                    <p>Do you want to delete this message?</p>
                    <Button className='btn btn-primary ms-2' onClick={handleDeleteConfirm}>Yes</Button>
                    <Button className='btn btn-primary ms-2' onClick={() => setShowDeleteModal(false)}>No</Button>
                </Modal.Body>
            </Modal>
        </div>
    )
}

ChatMessage.propTypes = {
    chatId: PropTypes.string,
    message: PropTypes.object,
}