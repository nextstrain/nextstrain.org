/* eslint-disable react/prop-types */
import React, {ReactNode, useEffect, useState, useCallback} from 'react';
import { MdClose } from "react-icons/md";
import { Background, ModalContainer, Title } from './styles';


interface ModalProps {
  title: string,
  isOpen: boolean,
  onClose?: () => void,
  children: ReactNode
}

const Modal = ({title, isOpen, onClose, children}: ModalProps) => {
  const [ showModal, setShowModal ] = useState<boolean>(false);

  useEffect(() => {
    const handleEsc = (event) => {
       if (event.key === 'Escape') {closeModal()}
    };
    window.addEventListener('keydown', handleEsc);
    return () => {window.removeEventListener('keydown', handleEsc);};
  });

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen])

  function closeModal() {
    setShowModal(false);
    // Run optional callback function
    if (onClose){
      onClose();
    }
  }

  const scrollRef = useCallback((node) => {
    /* A CSS-only solution would be to set 'overflow: hidden' on <body>. This
    solution works well, but there are still ways to scroll (e.g. via down/up
    arrows) */
    node?.addEventListener('wheel', (event) => {event.preventDefault();}, false);
  }, []);

  if (!showModal) return null;

  return (
    <div ref={scrollRef}>

      <Background onClick={closeModal}/>
      <ModalContainer onClick={(e) => {e.stopPropagation()}}>
        <CloseIcon onClick={closeModal}/>
        <Title>{title}</Title>
        {children}
      </ModalContainer>

    </div>
  )
}

const CloseIcon = ({onClick}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{position: 'absolute', top: '15px', right: '15px', cursor: 'pointer' }}
      onClick={onClick} onMouseOver={() => {setHovered(true)}} onMouseOut={() => setHovered(false)}
    >
      <MdClose size='1.5em' color={hovered ? '#333' : '#999'}/>
    </div>
  )
}

export default Modal;
